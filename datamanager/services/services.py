from datamanager.models import Dataset


def load_dataset(file, user):
    ds = Dataset(content=file, author=user, name=generate_dataset_name(user))
    ds.save()


def generate_dataset_name(user):
    count = Dataset.objects.filter(author=user).count()
    return 'Набор #{}'.format(count + 1)


def delete_dataset(ds_id):
    ds = Dataset.objects.filter(id=ds_id)
    ds.delete()
