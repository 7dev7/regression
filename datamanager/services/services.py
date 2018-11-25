from datamanager.models import Document


def load_dataset(file, user):
    doc = Document(content=file, author=user, name=generate_doc_name(user))
    doc.save()


def generate_doc_name(user):
    count = Document.objects.filter(author=user).count()
    return 'Набор #{}'.format(count + 1)
