import pandas as pd

from datamanager.models import Dataset


def get_dataframe(dataset_id):
    dataset = Dataset.objects.get(pk=dataset_id)
    return pd.read_json(dataset.content.replace("'", "\""))


def get_json(df):
    return df.to_json().replace("\"", "'")
