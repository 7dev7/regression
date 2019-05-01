from sklearn.neural_network import MLPRegressor

import datamanager.services.scatter as sct
from datamanager.services import dataframe
from datamanager.services.auto_analysis import func_mapping


def neural_model_scatter(x_name, y_name, data_id):
    df = dataframe.get_dataframe(data_id)
    x = df[[x_name]]
    y = df[[y_name]]

    regressor = MLPRegressor(hidden_layer_sizes=(5,), max_iter=10000, activation='tanh',
                             random_state=9)
    model = regressor.fit(x, y.values.ravel())

    scatter_data = sct.get_scatter_data(model, x, y, x_name, y_name, scalar=True)
    return scatter_data


def neural_model_info(x_names, y_names, data_id):
    df = dataframe.get_dataframe(data_id)
    x = df[x_names]
    y = df[y_names]

    model = MLPRegressor(hidden_layer_sizes=(5,), max_iter=10000, activation='tanh',
                         random_state=9)
    model = model.fit(x, y.values.ravel())
    score = model.score(x, y.values.ravel())
    return {
        'r_squared': score,
        'activation': func_mapping.get(model.activation, ''),
        'hidden_layer_sizes': model.hidden_layer_sizes
    }
