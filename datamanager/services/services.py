import pandas as pd

from datamanager.models import Dataset


def create_dataset(file, user):
    if file is None:
        return

    # TODO add file check

    content = __get_csv_content(file)
    ds = Dataset(content=content, author=user, name=generate_dataset_name(user))
    ds.save()


def __get_csv_content(file):
    df = pd.read_csv(file)
    return df.to_json()


def generate_dataset_name(user):
    count = Dataset.objects.filter(author=user).count()
    return 'Набор #{}'.format(count + 1)


def delete_dataset(ds_id):
    ds = Dataset.objects.filter(id=ds_id)
    ds.delete()
