import sklearn.linear_model as lm


def linear(df):
    x = df.iloc[:, :-1]
    y = df.iloc[:, -1]

    skm = lm.LinearRegression()
    skm.fit(x, y)
    print(skm.intercept_, skm.coef_)
