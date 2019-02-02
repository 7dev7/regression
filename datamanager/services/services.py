import pandas as pd

from datamanager.models import Dataset


def create_dataset(file, user):
    if file is None:
        return

    # TODO add file check
    df = pd.read_csv(file)
    content = df.to_json().replace("\"", "'")
    columns = df.columns.values.tolist()
    size = df.shape[0]

    ds = Dataset(content=content, author=user, name=generate_dataset_name(user),
                 columns=columns, size=size)
    ds.save()


def generate_dataset_name(user):
    datasets = Dataset.objects.filter(author=user).order_by('-id')
    num = 1 if not datasets else datasets[0].pk + 1
    return 'Набор #{}'.format(num)


def delete_dataset(ds_id):
    ds = Dataset.objects.filter(id=ds_id)
    ds.delete()
