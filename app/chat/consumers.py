# consumers.py for Django WebSocket Service

import json
from channels.generic.websocket import AsyncWebsocketConsumer

import asyncio
import datetime
import uuid
from urllib.parse import parse_qs
from prometheus_client import Counter, Gauge, Histogram
import time
import logging

# Define Prometheus metrics
total_messages = Counter('total_messages', 'Total number of messages processed')
active_connections = Gauge('active_connections', 'Number of active WebSocket connections')
error_count = Counter('error_count', 'Number of errors encountered')
shutdown_time = Histogram('shutdown_time_seconds', 'Time taken to shut down the service')

class JsonFormatter(logging.Formatter):
    def format(self, record):
        import json
        log_record = {
            "level": record.levelname,
            "message": record.getMessage(),
            "time": self.formatTime(record, self.datefmt),
        }
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id
        if hasattr(record, "event"):
            log_record["event"] = record.event
        if hasattr(record, "extra"):
            log_record.update(record.extra)
        return json.dumps(log_record)

logger = logging.getLogger("chat")
handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

class ChatConsumer(AsyncWebsocketConsumer):
    # In-memory session store: {session_id: message_count}
    sessions = {}
    active_ws_connections = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_count = 0
        self.session_id = None

    async def connect(self):
        try:
            active_connections.inc()
            # Parse session_id from query string, or generate a new one
            query_string = self.scope.get("query_string", b"").decode()
            params = parse_qs(query_string)
            session_id = params.get("session", [None])[0]
            if session_id is None:
                session_id = str(uuid.uuid4())
            self.session_id = session_id

            # Resume message count if session exists, else start at 0
            self.message_count = ChatConsumer.sessions.get(self.session_id, 0)

            self.room_name = 'chat_room'
            self.room_group_name = 'chat_%s' % self.room_name

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            # Optionally, send the session_id to the client
            await self.send(text_data=json.dumps({"session": self.session_id, "count": self.message_count}))
            self.request_id = str(uuid.uuid4())
            logger.info("WebSocket connected", extra={"request_id": self.request_id, "event": "connect"})
            active_ws_connections.append(self)
            asyncio.create_task(self.send_heartbeat())
        except Exception as e:
            error_count.inc()
            logger.error("Error connecting WebSocket", extra={"request_id": self.request_id, "event": "error", "extra": {"error": str(e)}})

    async def disconnect(self, close_code):
        try:
            start = time.time()
            active_connections.dec()
            # Save the message count in the session store
            if self.session_id:
                ChatConsumer.sessions[self.session_id] = self.message_count
                active_connections.remove(self.session_id)
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            # send a bye message
            await self.send(text_data=json.dumps({"bye": True, "total": self.message_count}))
            logger.info("WebSocket disconnected", extra={"request_id": self.request_id, "event": "disconnect", "extra": {"close_code": close_code}})
            active_ws_connections.remove(self)
            shutdown_time.observe(time.time() - start)
        except Exception as e:
            error_count.inc()
            logger.error("Error disconnecting WebSocket", extra={"request_id": self.request_id, "event": "error", "extra": {"error": str(e)}})

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            self.message_count += 1
            total_messages.inc()
            logger.info("Message received", extra={"request_id": self.request_id, "event": "receive", "extra": {"message": message, "count": self.message_count}})

            # Save updated count in session store
            if self.session_id:
                ChatConsumer.sessions[self.session_id] = self.message_count

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'count': self.message_count
                }
            )
        except Exception as e:
            error_count.inc()
            logger.error("Error processing message", extra={"request_id": self.request_id, "event": "error", "extra": {"error": str(e)}})

    async def chat_message(self, event):
        message = event['message']
        count = event['count']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'count': count
        }))

    async def send_heartbeat(self):
        while True:
            logger.info("Sending heartbeat", extra={"request_id": self.request_id, "event": "heartbeat"})
            await asyncio.sleep(30)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'heartbeat_message',
                    'ts': datetime.datetime.now().isoformat()
                }
            )

    async def heartbeat_message(self, event):
        ts = event['ts']

        # Send heartbeat to WebSocket
        await self.send(text_data=json.dumps({
            'ts': ts
        }))