from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

import datamanager.services.dataframe as dataframe
import datamanager.services.scatter as sct


def poly_model_scatter(x_name, y_name, data_id, degree):
    df = dataframe.get_dataframe(data_id)

    x = df[[x_name]]
    y = df[[y_name]]

    model = make_pipeline(PolynomialFeatures(degree=degree), LinearRegression())
    model.fit(x, y)

    scatter_data = sct.get_scatter_data(model, x, y, x_name, y_name)
    return scatter_data


def poly_model_info(x_names, y_names, data_id, degree):
    df = dataframe.get_dataframe(data_id)

    x = df[x_names]
    y = df[y_names]

    model = make_pipeline(PolynomialFeatures(degree=degree), LinearRegression())
    model.fit(x, y)

    return {
        'r_squared': model.score(x, y),
        'degree': degree,
        'coefs': model.steps[1][1].coef_[0][1:],
        'intercept': model.steps[1][1].intercept_,
    }
