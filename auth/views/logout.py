from django.contrib import auth
from django.shortcuts import redirect
from django.views import generic


class LogoutView(generic.View):

    @staticmethod
    def get(request):
        auth.logout(request)
        return redirect('/')
