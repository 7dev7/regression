import statsmodels.api as sm
from rest_framework.decorators import api_view
from rest_framework.response import Response
from statsmodels.stats.stattools import durbin_watson, jarque_bera

from datamanager.services.dataframe import get_dataframe


@api_view(['GET'])
def linear_regression(request, data_id, x, y):
    df = get_dataframe(data_id)

    predictor = sm.add_constant(df[[x]])
    model = sm.OLS(df[[y]], predictor).fit()

    return Response({"intercept": model.params[0], "coef": [model.params[1]]})


@api_view(['GET'])
def linear_regression_info(request, data_id, x, y):
    df = get_dataframe(data_id)

    predictor = sm.add_constant(df[[x]])
    model = sm.OLS(df[[y]], predictor).fit()
    print(model.summary())

    info = {
        'r_squared': model.rsquared,
        'adj_r_squared': model.rsquared_adj,
        'p_values': model.pvalues,
        'params': model.params,
        'std': model.bse,
        't_values': model.tvalues,
        'durbin_watson': durbin_watson(model.resid),
        'jarque_bera': jarque_bera(model.resid),
        # 'linear_harvey_collier': sms.linear_harvey_collier(model),
        'residuals': model.resid
    }

    return Response({"info": info})
