from rest_framework.decorators import api_view, parser_classes, authentication_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response

import datamanager.services.auto_analysis as a_analysis
import datamanager.services.model_predictor as model_predictor
import datamanager.services.regression.forest as forest_regr
import datamanager.services.regression.linear as lin_regr
import datamanager.services.regression.neural as neural_regr
import datamanager.services.regression.poly as poly_regr
from datamanager.models import Configuration
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

    model_data = poly_regr.poly_model_info(x_names, y_names, data_id, degree)
    return Response(model_data)


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def predict(request):
    inputs = request.data['inputs']
    ml_model_id = request.data['ml_model_id']
    return Response(model_predictor.predict(ml_model_id, inputs))


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def neural_regression_scatter(request):
    x_name = request.data['x']
    y_name = request.data['y']
    data_id = request.data['data_id']
    activation = request.data['activation']
    hidden = int(request.data['hidden'])

    model_data = neural_regr.neural_model_scatter(x_name, y_name, data_id, activation, hidden)
    return Response(model_data)


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def neural_regression_info(request):
    x_names = request.data['x']
    y_names = request.data['y']
    data_id = request.data['data_id']
    activation = request.data['activation']
    hidden = int(request.data['hidden'])

    model_data = neural_regr.neural_model_info(x_names, y_names, data_id, activation, hidden)
    return Response(model_data)


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def forest_regression_scatter(request):
    x_name = request.data['x']
    y_name = request.data['y']
    data_id = request.data['data_id']
    estimators = int(request.data['estimators'])

    model_data = forest_regr.forest_model_scatter(x_name, y_name, data_id, estimators)
    return Response(model_data)


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def forest_regression_info(request):
    x_names = request.data['x']
    y_names = request.data['y']
    data_id = request.data['data_id']
    estimators = int(request.data['estimators'])

    model_data = forest_regr.forest_model_info(x_names, y_names, data_id, estimators)
    return Response(model_data)


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

    models = a_analysis.get_models(x, y, request.user)
    models.sort(key=lambda m: m['score'], reverse=True)
    formatted = a_analysis.format_models_data(models, df)

    config = Configuration.objects.get(owner=request.user)

    return Response({
        'models': formatted,
        'highlight_limit': config.highlightLimit
    })
