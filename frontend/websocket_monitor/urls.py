from django.contrib import admin
from django.urls import path
from chat.views import metrics, healthz, readyz

urlpatterns = [
    path('admin/', admin.site.urls),
    path('metrics/', metrics, name='metrics'),
    path('healthz/', healthz, name='healthz'),
    path('readyz/', readyz, name='readyz'),
]