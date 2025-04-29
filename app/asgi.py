import os
from venv import logger
import django
from django.core.asgi import get_asgi_application

from app.views import set_ready, set_not_ready
import signal
import sys
import asyncio

# Initialize Django first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
django.setup()

# Then import Channels components
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from app.chat.consumers import ChatConsumer
from django.urls import path

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/chat/", ChatConsumer.as_asgi()),
            path("ws/chat", ChatConsumer.as_asgi()),
        ])
    ),
})
set_ready()

def handle_shutdown(signum, frame):
    logger.info('Received SIGTERM, Shutting down gracefully...')
    set_not_ready()
    
    # Close all WebSocket connections with code 1001
    async def close_connections():
        logger.info('Closing all WebSocket connections...')
        for consumer in ChatConsumer.active_connections:
            await consumer.close(code=1001)
    
    # Run the close_connections coroutine with a timeout of 10 seconds
    try:
        logger.info('Finishing Event Loop or InFlight Requests...')
        loop = asyncio.get_event_loop()
        loop.run_until_complete(asyncio.wait_for(close_connections(), timeout=10))
    except asyncio.TimeoutError:
        logger.warning("Timeout while closing WebSocket connections")
    
    sys.exit(0)

signal.signal(signal.SIGTERM, handle_shutdown)
signal.signal(signal.SIGINT, handle_shutdown)