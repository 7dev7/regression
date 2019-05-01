import statsmodels.api as sm
from rest_framework.decorators import api_view, parser_classes, authentication_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from sklearn import preprocessing
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

import datamanager.services.linear_info as lin
import datamanager.services.validator as validator
from datamanager.models import MlModel
from datamanager.services.auto_analysis import get_models, format_models_data, func_mapping
from datamanager.services.dataframe import get_dataframe
from datamanager.views.rest.csrf_auth import CsrfExemptSessionAuthentication


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def linear_regression_scatter(request):
    x, y, request_x, request_y, df = get_data(request)

    model = LinearRegression().fit(x, y)

    size = x.shape[0]

    labels = [x.iloc[i][request_x] for i in range(0, size)]
    predictions = model.predict(x)

    line_points = [{'x': labels[i], 'y': predictions[i][0]} for i in range(0, size)]
    observations = [{'x': labels[i], 'y': y.iloc[i][request_y]} for i in range(0, 200)]

    return Response({
        'predictors': labels,
        'linePoints': line_points,
        'observations': observations
    })


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def polynomial_regression_scatter(request):
    x, y, request_x, request_y, df = get_data(request)
    degree = int(request.data['degree'])

    model = make_pipeline(PolynomialFeatures(degree=degree), LinearRegression())
    model.fit(x, y)

    size = x.shape[0]

    labels = [x.iloc[i][request_x] for i in range(0, size)]
    predictions = model.predict(x)

    line_points = [{'x': labels[i], 'y': predictions[i][0]} for i in range(0, size)]
    observations = [{'x': labels[i], 'y': y.iloc[i][request_y]} for i in range(0, 200)]

    return Response({
        'predictors': labels,
        'linePoints': line_points,
        'observations': observations,
        'model': {
            'r_squared': model.score(x, y),
            'degree': degree,
            'coefs': model.steps[1][1].coef_[0][1:],
            'intercept': model.steps[1][1].intercept_,
        }
    })


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def poly_regression_info(request):
    request_x = request.data['x']
    request_y = request.data['y']
    data_id = request.data['data_id']
    df = get_dataframe(data_id)

    x = df[request_x]
    y = df[request_y]
    degree = int(request.data['degree'])

    model = make_pipeline(PolynomialFeatures(degree=degree), LinearRegression())
    model.fit(x, y)

    return Response({
        'r_squared': model.score(x, y),
        'degree': degree,
        'coefs': model.steps[1][1].coef_[0][1:],
        'intercept': model.steps[1][1].intercept_,
    })


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def linear_regression_info(request):
    request_x = request.data['x']
    request_y = request.data['y']
    data_id = request.data['data_id']

    df = get_dataframe(data_id)

    predictor = sm.add_constant(df[request_x])
    model = sm.OLS(df[request_y], predictor).fit()

    info = lin.get_model_info(model)
    info['predictors'] = ['Смещение'] + request_x
    validation_result = validator.validate_linear(info)

    return Response({
        "info": info,
        'validation_result': validation_result
    })


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

    min_max_scaler = preprocessing.MinMaxScaler()
    x_normalized = min_max_scaler.fit_transform(x, y)

    neural_model, score = find_best_model(x_normalized, y)
    predictions = neural_model.predict(x_normalized)

    size = x.shape[0]

    labels = [x.iloc[i][request_x] for i in range(0, size)]

    line_points = [{'x': labels[i], 'y': predictions[i]} for i in range(0, size)]
    observations = [{'x': labels[i], 'y': y.iloc[i][request_y]} for i in range(0, 200)]

    return Response({
        'predictors': labels,
        'linePoints': line_points,
        'observations': observations,
        'model': {
            'r_squared': score,
            'activation': func_mapping.get(neural_model.activation, ''),
            'hidden_layer_sizes': neural_model.hidden_layer_sizes
        }
    })


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def forest_regression(request):
    x, y, request_x, request_y, df = get_data(request)

    forest = RandomForestRegressor(n_estimators=150, random_state=0, max_depth=2)
    forest.fit(x, y)
    predictions = forest.predict(x)
    score = forest.score(x, y)

    size = x.shape[0]

    labels = [x.iloc[i][request_x] for i in range(0, size)]

    line_points = [{'x': labels[i], 'y': predictions[i]} for i in range(0, size)]
    observations = [{'x': labels[i], 'y': y.iloc[i][request_y]} for i in range(0, 200)]

    return Response({
        'predictors': labels,
        'linePoints': line_points,
        'observations': observations,
        'model': {
            'r_squared': score,
            'estimators': forest.n_estimators
        }
    })


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
