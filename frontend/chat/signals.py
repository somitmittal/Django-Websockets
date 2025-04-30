import signal
import asyncio
from django.conf import settings
from django.core.signals import request_finished
from channels.layers import get_channel_layer
from .views import is_ready, is_shutting_down

def graceful_shutdown(signum, frame):
    """Handle graceful shutdown on SIGTERM"""
    global is_shutting_down
    is_shutting_down = True
    
    # Allow 10 seconds for cleanup
    asyncio.get_event_loop().run_until_complete(asyncio.sleep(10))
    
    # Close Redis connections
    channel_layer = get_channel_layer()
    if hasattr(channel_layer, 'close_pools'):
        asyncio.get_event_loop().run_until_complete(channel_layer.close_pools())

# Register signal handlers
signal.signal(signal.SIGTERM, graceful_shutdown)

# Mark as ready after first request
def mark_ready(sender, **kwargs):
    global is_ready
    is_ready = True

request_finished.connect(mark_ready)