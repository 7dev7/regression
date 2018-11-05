from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('auth.urls')),
    path('data/', include('dataloading.urls')),
    path('', include('main.urls')),
]
