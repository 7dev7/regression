from sklearn.ensemble import RandomForestRegressor

import datamanager.services.scatter as sct
from datamanager.services import dataframe


def forest_model_scatter(x_name, y_name, data_id, estimators):
    df = dataframe.get_dataframe(data_id)

    x = df[[x_name]]
    y = df[[y_name]]

    forest = RandomForestRegressor(n_estimators=estimators, random_state=0, max_depth=2).fit(x, y)
    scatter_data = sct.get_scatter_data(forest, x, y, x_name, y_name, scalar=True)
    return scatter_data


def forest_model_info(x_names, y_names, data_id, estimators):
    df = dataframe.get_dataframe(data_id)
    x = df[x_names]
    y = df[y_names]

    forest = RandomForestRegressor(n_estimators=estimators, random_state=0, max_depth=2).fit(x, y)
    return {
        'r_squared': forest.score(x, y),
        'estimators': forest.n_estimators
    }
