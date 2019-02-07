import sklearn.linear_model as lm
from rest_framework.decorators import api_view
from rest_framework.response import Response

from datamanager.services.dataframe import get_dataframe


@api_view(['GET'])
def linear_regression(request, data_id, x, y):
    df = get_dataframe(data_id)

    skm = lm.LinearRegression()
    skm.fit(df[[x]], df[[y]])

    return Response({"intercept": skm.intercept_, "coef": skm.coef_})
