import json
from django.http import HttpResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from channels.layers import get_channel_layer

# Health check flags
is_ready = False
is_shutting_down = False

async def metrics(request):
    return HttpResponse(generate_latest(), content_type=CONTENT_TYPE_LATEST)

async def healthz(request):
    """Liveness probe"""
    if is_shutting_down:
        return HttpResponse('Shutting down', status=503)
    return HttpResponse('OK')

async def readyz(request):
    """Readiness probe"""
    if not is_ready or is_shutting_down:
        return HttpResponse('Not ready', status=503)
    
    # Check Redis connection
    channel_layer = get_channel_layer()
    try:
        await channel_layer.connection(0)
        return HttpResponse('Ready')
    except:
        return HttpResponse('Redis connection failed', status=503)