from datamanager.services import dataframe


def get_nan_columns(df, all_columns):
    nan_columns = []
    for col in all_columns:
        if df[col].isnull().values.any():
            nan_columns.append(col)
    return nan_columns


def get_nan_columns_for_ds(ds_id):
    df = dataframe.get_dataframe(ds_id)
    cols = df.columns.values

    nan_columns = []
    for col in cols:
        if df[col].isnull().values.any():
            nan_columns.append(col)
    return nan_columns
