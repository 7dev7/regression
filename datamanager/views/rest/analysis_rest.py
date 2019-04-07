import statsmodels.api as sm
from rest_framework.decorators import api_view, parser_classes, authentication_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from sklearn import preprocessing
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from statsmodels.stats.diagnostic import acorr_breusch_godfrey, het_breuschpagan
from statsmodels.stats.stattools import durbin_watson, jarque_bera

from datamanager.models import MlModel
from datamanager.services.auto_analysis import get_models
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
    print(model.summary())

    predictors = ['Смещение'] + request_x
    bg_lm, bg_lm_pval, bg_fval, bg_fpval = acorr_breusch_godfrey(model)

    jb, jb_pval, jb_skew, jb_kurtosis = jarque_bera(model.resid)

    het_bp_lm, het_bp_lmpval, het_bp_fval, het_bp_fpval = het_breuschpagan(model.resid, model.model.exog)

    info = {
        'r_squared': model.rsquared,
        'adj_r_squared': model.rsquared_adj,
        'p_values': model.pvalues,
        'params': model.params,
        'std': model.bse,
        'size': model.nobs,
        'predictors': predictors,
        't_values': model.tvalues,
        'durbin_watson': durbin_watson(model.resid),
        'breusch_godfrey': {
            'lm': bg_lm,
            'lm_pval': bg_lm_pval,
            'fval': bg_fval,
            'f_pval': bg_fpval
        },
        'jarque_bera': {
            'jb': jb,
            'jb_pval': jb_pval,
            'skew': jb_skew,
            'kurtosis': jb_kurtosis
        },
        'het_breuschpagan': {
            'lm': het_bp_lm,
            'lm_pval': het_bp_lmpval,
            'fval': het_bp_fval,
            'f_pval': het_bp_fpval
        },
        # 'linear_harvey_collier': sms.linear_harvey_collier(model),
        'residuals': model.resid
    }

    return Response({"info": info})


@api_view(['POST'])
@parser_classes((JSONParser,))
@authentication_classes((CsrfExemptSessionAuthentication,))
def linear_predict(request):
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
            'activation': neural_model.activation,
            'hidden_layer_sizes': neural_model.hidden_layer_sizes
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
    print(models)

    return Response({'models': []})


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
