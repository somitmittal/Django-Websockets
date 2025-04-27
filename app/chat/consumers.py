# consumers.py for Django WebSocket Service

import json
from channels.generic.websocket import AsyncWebsocketConsumer

import asyncio
import datetime
import uuid
from urllib.parse import parse_qs

class ChatConsumer(AsyncWebsocketConsumer):
    # In-memory session store: {session_id: message_count}
    sessions = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_count = 0
        self.session_id = None

    async def connect(self):
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

    async def disconnect(self, close_code):
        # Save the message count in the session store
        if self.session_id:
            ChatConsumer.sessions[self.session_id] = self.message_count
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        # Optionally, send a bye message (if you want to push before disconnect)
        # await self.send(text_data=json.dumps({"bye": True, "total": self.message_count}))

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        self.message_count += 1

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