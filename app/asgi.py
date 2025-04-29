import os
from venv import logger
import django
from django.core.asgi import get_asgi_application

from app.views import set_ready, set_not_ready
import signal
import sys

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
    logger.info('Received SIGTERM, Shutting down...')
    set_not_ready()
    sys.exit(0)

signal.signal(signal.SIGTERM, handle_shutdown)
signal.signal(signal.SIGINT, handle_shutdown)