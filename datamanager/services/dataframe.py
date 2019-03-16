import pandas as pd

from datamanager.models import Dataset


def get_dataframe(dataset_id):
    dataset = Dataset.objects.get(pk=dataset_id)
    return pd.read_json(dataset.content.replace("'", "\""))


def get_json(df):
    return df.to_json().replace("\"", "'")


def get_columns_meta(dataset_id, columns):
    df = get_dataframe(dataset_id)

    results = []
    for col in columns:
        results.append({
            'column': col,
            'min': round(df[[col]].min()[0], 3),
            'max': round(df[[col]].max()[0], 3),
            'mean': round(df[[col]].mean()[0], 3),
            'median': round(df[[col]].median()[0], 3)
        })

    return results
