from django.contrib.auth.models import User

def validate(username: str, email: str, pwd: str, pwd_confirm: str) -> (bool, str):
    """
    Performs user's data validation. Returns success flag and error message if exists.
    """
    if not username.strip():
        return False, 'Username cannot be empty'
    if not email.strip():
        return False, 'Email cannot be empty'
    if not pwd.strip():
        return False, 'Password cannot be empty'
    if pwd != pwd_confirm:
        return False, 'Password must be equals to password confirm'

    existing_user = User.objects.get(username=username)

    if existing_user is not None:
        return False, 'There is user with such username'

    return True, ''
