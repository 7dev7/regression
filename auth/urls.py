from django.urls import path

from auth.views import signin, logout, signup

urlpatterns = [
    path('signin/', signin.SignInView.as_view(), name='signin'),
    path('signup/', signup.SignUpView.as_view(), name='signup'),
    path('logout/', logout.LogoutView.as_view(), name='logout'),
]
