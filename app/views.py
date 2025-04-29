from django.http import JsonResponse

# Module-level readiness flag
is_ready = False

def health(request):
    return JsonResponse({'status': 'ok'})

def ready(request):
    return JsonResponse({'status': 'ready' if is_ready else 'not ready'})

def set_ready():
    global is_ready
    is_ready = True

def set_not_ready():
    global is_ready
    is_ready = False