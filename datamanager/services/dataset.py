import pandas as pd

from datamanager.models import Dataset
from datamanager.services.dataframe import get_json


def create_dataset(file, user):
    if file is None:
        return

    try:
        df = pd.read_csv(file, sep=__get_separator(file))
        content = get_json(df)
        columns = df.columns.values.tolist()
        size = df.shape[0]

        ds = Dataset(content=content, author=user, name=generate_dataset_name(user),
                     columns=columns, size=size)
        ds.save()
    except:
        print("error during dataset saving")


def __get_separator(file):
    for line in file:
        comma_count = str(line).count(',')
        semicolon_count = str(line).count(';')
        file.seek(0)
        return ',' if comma_count > semicolon_count else ';'


def generate_dataset_name(user):
    datasets = Dataset.objects.filter(author=user).order_by('-id')
    num = 1 if not datasets else datasets[0].pk + 1
    return 'Набор #{}'.format(num)


def delete_dataset(ds_id):
    ds = Dataset.objects.filter(id=ds_id)
    ds.delete()
