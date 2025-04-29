import os
from django.core.wsgi import get_wsgi_application

from app.views import set_ready, set_not_ready
import signal
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

application = get_wsgi_application()
set_ready()

def handle_shutdown(signum, frame):
    set_not_ready()
    sys.exit(0)

signal.signal(signal.SIGTERM, handle_shutdown)
signal.signal(signal.SIGINT, handle_shutdown)