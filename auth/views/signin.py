from django.contrib import auth
from django.contrib.auth.models import User
from django.shortcuts import redirect, render_to_response
from django.template.context_processors import csrf
from django.views import generic


class SignInView(generic.TemplateView):
    template_name = 'signin.html'

    @staticmethod
    def post(request):
        args = {}
        args.update(csrf(request))
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        user = auth.authenticate(username=username, password=password)

        # If auth failed
        if user is None:
            args['login_error'] = 'Username or password is incorrect'
            return render_to_response('login.html', args)
        else:
            auth.login(request, user)
            return redirect('/')
