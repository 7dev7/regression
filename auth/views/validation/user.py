from django.contrib.auth.models import User


def validate(username: str, email: str, pwd: str, pwd_confirm: str) -> (bool, str):
    """
    Performs user's data validation. Returns success flag and error message if exists.
    """
    if not username.strip():
        return False, 'Имя пользователя не может быть пустым'
    if not email.strip():
        return False, 'Email не может быть пустым'
    if not pwd.strip():
        return False, 'Пароль не может быть пустым'
    if pwd != pwd_confirm:
        return False, 'Пароль и подвтерждение пароля должны совпадать'

    if User.objects.filter(username=username).exists():
        return False, 'Выбранное имя пользователя уже занято'

    return True, ''
