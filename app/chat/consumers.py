# consumers.py for Django WebSocket Service

import json
from channels.generic.websocket import AsyncWebsocketConsumer

import asyncio
import datetime

class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_count = 0

    async def connect(self):
        self.room_name = 'chat_room'
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        self.message_count += 1

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