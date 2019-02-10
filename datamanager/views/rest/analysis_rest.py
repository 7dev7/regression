import statsmodels.api as sm
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, parser_classes, authentication_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from statsmodels.stats.diagnostic import acorr_breusch_godfrey, het_breuschpagan
from statsmodels.stats.stattools import durbin_watson, jarque_bera

from datamanager.services.dataframe import get_dataframe


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return None


@api_view(['GET'])
def linear_regression(request, data_id, x, y):
    df = get_dataframe(data_id)

    predictor = sm.add_constant(df[[x]])
    model = sm.OLS(df[[y]], predictor).fit()

    return Response({"intercept": model.params[0], "coef": [model.params[1]]})


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

    info = {
        'r_squared': model.rsquared,
        'adj_r_squared': model.rsquared_adj,
        'p_values': model.pvalues,
        'params': model.params,
        'std': model.bse,
        't_values': model.tvalues,
        'durbin_watson': durbin_watson(model.resid),
        'breusch_godfrey': acorr_breusch_godfrey(model),
        'jarque_bera': jarque_bera(model.resid),
        'het_breuschpagan': het_breuschpagan(model.resid, model.model.exog),
        # 'linear_harvey_collier': sms.linear_harvey_collier(model),
        'residuals': model.resid
    }

    return Response({"info": info})
