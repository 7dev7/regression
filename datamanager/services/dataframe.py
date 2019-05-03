import pandas as pd

from datamanager.models import Dataset, MlModel


def get_dataframe(dataset_id):
    dataset = Dataset.objects.get(pk=dataset_id)
    return pd.read_json(dataset.content.replace("'", "\""))


def update_dataframe(df, dataset_id):
    dataset = Dataset.objects.get(pk=dataset_id)
    dataset.content = get_json(df)
    dataset.columns = df.columns.values.tolist()
    dataset.size = df.shape[0]
    dataset.save()

    update_relative_models(dataset)


def add_column(ds_id, column_name):
    df = get_dataframe(ds_id)
    df[column_name] = 0
    update_dataframe(df, ds_id)


def update_relative_models(dataset):
    columns = set(dataset.columns)
    models = MlModel.objects.filter(dataset=dataset)
    for model in models:
        model_columns = set(model.ds_in_cols + model.ds_out_cols)
        if columns != model_columns:
            model.delete()


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
