from django.http import JsonResponse

def healthz(request):
    return JsonResponse({'status': 'ok'})

def readyz(request):
    # Add database check if needed
    return JsonResponse({'status': 'ready'})