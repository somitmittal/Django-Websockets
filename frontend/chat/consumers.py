import json
import asyncio
import logging
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from prometheus_client import Counter, Gauge

logger = logging.getLogger(__name__)

# Prometheus metrics
MESSAGES_TOTAL = Counter('websocket_messages_total', 'Total WebSocket messages received')
ACTIVE_CONNECTIONS = Gauge('websocket_connections_active', 'Number of active WebSocket connections')
ERROR_COUNT = Counter('websocket_errors_total', 'Total WebSocket errors')

class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_count = 0
        self.heartbeat_task = None
        self.connection_id = None

    async def connect(self):
        self.connection_id = self.scope.get('client')[1]
        session_id = self.scope["query_string"].decode().split("session_id=")[-1] if "session_id" in self.scope["query_string"].decode() else None

        try:
            await self.accept()
            ACTIVE_CONNECTIONS.inc()
            
            # Send connection ID
            await self.send(json.dumps({
                "connectionId": self.connection_id
            }))

            # Start heartbeat
            self.heartbeat_task = asyncio.create_task(self.send_heartbeat())
            
            logger.info('WebSocket connected', extra={
                'request_id': self.connection_id,
                'session_id': session_id,
                'event': 'connection_established'
            })

        except Exception as e:
            ERROR_COUNT.inc()
            logger.error('Connection error', extra={
                'request_id': self.connection_id,
                'error': str(e),
                'event': 'connection_error'
            })
            raise

    async def disconnect(self, close_code):
        if self.heartbeat_task:
            self.heartbeat_task.cancel()
            
        ACTIVE_CONNECTIONS.dec()
        
        await self.send(json.dumps({
            "bye": True,
            "total": self.message_count
        }))

        logger.info('WebSocket disconnected', extra={
            'request_id': self.connection_id,
            'close_code': close_code,
            'total_messages': self.message_count,
            'event': 'connection_closed'
        })

    async def receive(self, text_data):
        try:
            self.message_count += 1
            MESSAGES_TOTAL.inc()
            
            await self.send(json.dumps({
                "count": self.message_count
            }))

            logger.info('Message received', extra={
                'request_id': self.connection_id,
                'message_count': self.message_count,
                'event': 'message_received'
            })

        except Exception as e:
            ERROR_COUNT.inc()
            logger.error('Message handling error', extra={
                'request_id': self.connection_id,
                'error': str(e),
                'event': 'message_error'
            })
            raise

    async def send_heartbeat(self):
        while True:
            try:
                await asyncio.sleep(30)
                await self.send(json.dumps({
                    "ts": datetime.utcnow().isoformat()
                }))
                
                logger.info('Heartbeat sent', extra={
                    'request_id': self.connection_id,
                    'event': 'heartbeat_sent'
                })

            except asyncio.CancelledError:
                break
            except Exception as e:
                ERROR_COUNT.inc()
                logger.error('Heartbeat error', extra={
                    'request_id': self.connection_id,
                    'error': str(e),
                    'event': 'heartbeat_error'
                })
                break