from django.contrib import auth
from django.contrib.auth.models import User
from django.shortcuts import redirect, render_to_response
from django.template.context_processors import csrf
from django.views import generic

from auth.views.validation.user import validate
from datamanager.models import Configuration


class SignUpView(generic.TemplateView):
    template_name = 'signup.html'

    @staticmethod
    def post(request):
        args = {}
        args.update(csrf(request))

        username = request.POST.get('username', '')
        email = request.POST.get('email', '')
        password = request.POST.get('password', '')
        password_confirm = request.POST.get('passwordConfirm', '')

        success, msg = validate(username, email, password, password_confirm)

        if not success:
            args['error'] = msg
            return render_to_response('signup.html', args)

        User.objects.create_user(
            username=username, password=password, email=email)

        user = auth.authenticate(username=username, password=password)
        if user is not None:
            Configuration.objects.create(owner=user)
            auth.login(request, user)
        return redirect('/', request)
