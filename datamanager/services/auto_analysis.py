import statsmodels.api as sm
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

import datamanager.services.linear_info as lin
import datamanager.services.validator as validator

NN_RANGE = range(3, 4)
# can be logistic, tanh, relu
ACTIVATIONS = ['logistic', 'tanh']
NN_ITERS = 10000

POLY_DEGREE_RANGE = range(2, 10)
TREE_RANGE = range(50, 150, 20)

func_mapping = {
    'tanh': 'тангенс',
    'logistic': 'сигмоида',
    'relu': 'выпрямитель'
}


def get_models(x, y):
    nn_models = train_nn_models(x, y)
    linear = train_linear_models(x, y)
    poly = train_poly_models(x, y)
    forest = train_random_forest_models(x, y)

    return list(filter(lambda m: m['score'] >= 0, nn_models + linear + poly + forest))


def format_models_data(models, df):
    result = []
    for model_data in models:
        model = model_data['model']

        if isinstance(model, MLPRegressor):
            func = func_mapping.get(model.activation, '')

            formatted_data = {
                'model': 'Многослойный персептрон',
                'description': 'Функция активации <em>{}</em>, '
                               'количество нейронов на скрытом слое <em>{}</em>'.format(func,
                                                                                        model.hidden_layer_sizes[0]),
                'meta': {
                    'type': 'MLP',
                    'activation': model.activation,
                    'hidden': model.hidden_layer_sizes[0]
                }
            }
        elif isinstance(model, LinearRegression):
            validation_data = __get_linear_validation_data(model_data, df)
            formatted_data = {
                'model': 'Линейная регрессия',
                'meta': {
                    'type': 'OLS'
                },
                'validation_data': validation_data
            }
        elif isinstance(model, RandomForestRegressor):
            formatted_data = {
                'model': 'Случайный лес',
                'description': 'Количество деревьев: {}'.format(model.n_estimators),
                'meta': {
                    'type': 'Forest'
                }
            }
        else:
            formatted_data = {
                'model': 'Полиномиальная регрессия',
                'description': 'Степень <em>{}</em>'.format(model.steps[0][1].degree),
                'meta': {
                    'type': 'Polynomial',
                    'degree': model.steps[0][1].degree
                }
            }

        formatted_data['score'] = model_data['score']
        formatted_data['meta']['in'] = model_data['in']
        formatted_data['meta']['out'] = model_data['out']

        result.append(formatted_data)
    return result


def __get_linear_validation_data(model, df):
    predictor = sm.add_constant(df[model['in']])
    model = sm.OLS(df[model['out']], predictor).fit()

    info = lin.get_model_info(model)
    return validator.validate_linear(info)


def train_nn_models(x, y):
    results = []
    for hidden in NN_RANGE:
        for activation in ACTIVATIONS:
            regressor = MLPRegressor(hidden_layer_sizes=(hidden,), max_iter=NN_ITERS, activation=activation,
                                     random_state=9)
            model = regressor.fit(x, y)
            results.append({
                'model': model,
                'score': model.score(x, y),
                'in': x.columns.values,
                'out': y.columns.values
            })
    return results


def train_linear_models(x, y):
    model = LinearRegression().fit(x, y)
    return [{
        'model': model,
        'score': model.score(x, y),
        'in': x.columns.values,
        'out': y.columns.values
    }]


def train_poly_models(x, y):
    results = []
    for degree in POLY_DEGREE_RANGE:
        model = make_pipeline(PolynomialFeatures(degree=degree), LinearRegression())
        model.fit(x, y)
        results.append({
            'model': model,
            'score': model.score(x, y),
            'in': x.columns.values,
            'out': y.columns.values
        })
    return results


def train_random_forest_models(x, y):
    results = []

    for estimator in TREE_RANGE:
        forest = RandomForestRegressor(n_estimators=estimator, random_state=0, max_depth=2)
        forest.fit(x, y)

        results.append({
            'model': forest,
            'score': forest.score(x, y),
            'in': x.columns.values,
            'out': y.columns.values
        })
    return results
