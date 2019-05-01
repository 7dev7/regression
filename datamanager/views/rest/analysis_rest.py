from rest_framework.decorators import api_view, parser_classes, authentication_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

import datamanager.services.regression.linear as lin_regr
import datamanager.services.regression.poly as poly_regr
import datamanager.services.scatter as sct
from datamanager.models import MlModel
from datamanager.services.auto_analysis import get_models, format_models_data, func_mapping
from datamanager.services.dataframe import get_dataframe
from datamanager.views.rest.csrf_auth import CsrfExemptSessionAuthentication


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def linear_regression_scatter(request):
    x_name = request.data['x']
    y_name = request.data['y']
    data_id = request.data['data_id']

    model_data = lin_regr.linear_model_scatter(x_name, y_name, data_id)
    return Response(model_data)


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def linear_regression_info(request):
    x_names = request.data['x']
    y_names = request.data['y']
    data_id = request.data['data_id']

    model_data = lin_regr.linear_model_info(x_names, y_names, data_id)
    return Response(model_data)


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def polynomial_regression_scatter(request):
    x_name = request.data['x']
    y_name = request.data['y']
    data_id = request.data['data_id']
    degree = int(request.data['degree'])

    model_data = poly_regr.poly_model_scatter(x_name, y_name, data_id, degree)
    return Response(model_data)


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def poly_regression_info(request):
    x_names = request.data['x']
    y_names = request.data['y']
    data_id = request.data['data_id']
    degree = int(request.data['degree'])

    model_data = poly_regr.train_poly_model_enhanced(x_names, y_names, data_id, degree)
    return Response(model_data)


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def predict(request):
    inputs = request.data['inputs']
    ml_model_id = request.data['ml_model_id']

    model = MlModel.objects.get(pk=ml_model_id)

    request_x = model.ds_in_cols
    request_y = model.ds_out_cols

    df = get_dataframe(model.dataset.id)

    x = df[request_x]
    y = df[request_y]

    if model.model == 'OLS':
        model = LinearRegression().fit(x, y)
        res = model.predict([inputs])
        return Response({'predicted': res[0]})
    elif model.model == 'Polynomial':
        degree = model.degree
        model = make_pipeline(PolynomialFeatures(degree=degree), LinearRegression())
        model.fit(x, y)
        res = model.predict([inputs])
        return Response({'predicted': res[0]})
    elif model.model == 'MLP':
        activation = model.activation
        hidden = model.hidden_layer
        regressor = MLPRegressor(hidden_layer_sizes=(hidden,), max_iter=9000, activation=activation,
                                 random_state=9)
        model = regressor.fit(x, y)
        res = model.predict([inputs])
        return Response({'predicted': res[0]})
    return Response({'error': 'Incorrect model type'})


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def neural_regression_scatter(request):
    x, y, request_x, request_y, df = get_data(request)

    neural_model, score = find_best_model(x, y)

    scatter_data = sct.get_scatter_data(neural_model, x, y, request_x, request_y, scalar=True)
    response = scatter_data
    response['model'] = {
        'r_squared': score,
        'activation': func_mapping.get(neural_model.activation, ''),
        'hidden_layer_sizes': neural_model.hidden_layer_sizes
    }
    return Response(response)


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def forest_regression(request):
    x, y, request_x, request_y, df = get_data(request)

    forest = RandomForestRegressor(n_estimators=150, random_state=0, max_depth=2)
    forest.fit(x, y)
    score = forest.score(x, y)

    scatter_data = sct.get_scatter_data(forest, x, y, request_x, request_y, scalar=True)
    response = scatter_data
    response['model'] = {
        'r_squared': score,
        'estimators': forest.n_estimators
    }
    return Response(response)


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def auto_analysis(request):
    request_x = request.data['x']
    request_y = request.data['y']
    data_id = request.data['data_id']
    df = get_dataframe(data_id)

    x = df[request_x]
    y = df[request_y]

    models = get_models(x, y)
    models.sort(key=lambda m: m['score'], reverse=True)
    formatted = format_models_data(models, df)

    return Response({'models': formatted})


def find_best_model(x, y):
    results = train_models(range(3, 4), 9000, ['logistic', 'tanh'], x, y)
    results.sort(key=lambda r: r['score'], reverse=True)
    return results[0]['model'], results[0]['score']


def train_models(hidden_range, iters, activations, x, y):
    results = []
    for hidden in hidden_range:
        for activation in activations:
            regressor = MLPRegressor(hidden_layer_sizes=(hidden,), max_iter=iters, activation=activation,
                                     random_state=9)
            model = regressor.fit(x, y.values.ravel())
            results.append({'model': model, 'score': model.score(x, y.values.ravel())})
    return results


def get_data(request):
    request_x = request.data['x']
    request_y = request.data['y']
    data_id = request.data['data_id']
    df = get_dataframe(data_id)

    x = df[[request_x]]
    y = df[[request_y]]

    return x, y, request_x, request_y, df
