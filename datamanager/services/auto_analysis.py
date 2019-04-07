from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

NN_RANGE = range(2, 10)
ACTIVATIONS = ['logistic', 'tanh', 'relu']
NN_ITERS = 10000

POLY_DEGREE_RANGE = range(2, 10)


def get_models(x, y):
    nn_models = train_nn_models(x, y)
    linear = train_linear_models(x, y)
    poly = train_poly_models(x, y)

    return nn_models + linear + poly


def train_nn_models(x, y):
    results = []
    for hidden in NN_RANGE:
        for activation in ACTIVATIONS:
            regressor = MLPRegressor(hidden_layer_sizes=(hidden,), max_iter=NN_ITERS, activation=activation,
                                     random_state=9)
            model = regressor.fit(x, y.values.ravel())
            results.append({'model': model, 'score': model.score(x, y.values.ravel())})
    return results


def train_linear_models(x, y):
    model = LinearRegression().fit(x, y)
    return [{'model': model, 'score': model.score(x, y.values.ravel())}]


def train_poly_models(x, y):
    results = []
    for degree in POLY_DEGREE_RANGE:
        model = make_pipeline(PolynomialFeatures(degree=degree), LinearRegression())
        model.fit(x, y)
        results.append({'model': model, 'score': model.score(x, y.values.ravel())})
    return results
