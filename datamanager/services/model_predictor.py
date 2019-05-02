from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

from datamanager.models import MlModel
from datamanager.services import dataframe


def predict(model_id, inputs):
    model = MlModel.objects.get(pk=model_id)

    request_x = model.ds_in_cols
    request_y = model.ds_out_cols

    df = dataframe.get_dataframe(model.dataset.id)

    x = df[request_x]
    y = df[request_y]

    if model.model == 'OLS':
        return __predict_linear(x, y, inputs)
    elif model.model == 'Polynomial':
        return __predict_poly(model, x, y, inputs)
    elif model.model == 'MLP':
        return __predict_neural(model, x, y, inputs)
    elif model.model == 'Forest':
        return __predict_forest(model, x, y, inputs)
    return {'error': 'Incorrect model type'}


def __predict_linear(x, y, inputs):
    model = LinearRegression().fit(x, y)
    res = model.predict([inputs])
    return {'predicted': res[0]}


def __predict_poly(model, x, y, inputs):
    degree = model.degree
    model = make_pipeline(PolynomialFeatures(degree=degree), LinearRegression())
    model.fit(x, y)
    res = model.predict([inputs])
    return {'predicted': res[0]}


def __predict_neural(model, x, y, inputs):
    activation = model.activation
    hidden = model.hidden_layer
    regressor = MLPRegressor(hidden_layer_sizes=(hidden,), max_iter=9000, activation=activation,
                             random_state=9)
    model = regressor.fit(x, y)
    res = model.predict([inputs])
    return {'predicted': res[0]}


def __predict_forest(model, x, y, inputs):
    estimators = model.estimators
    forest = RandomForestRegressor(n_estimators=estimators, random_state=0, max_depth=2).fit(x, y)
    model = forest.fit(x, y)
    res = model.predict([inputs])
    return {'predicted': res[0]}
