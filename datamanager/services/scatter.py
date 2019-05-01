def get_scatter_data(model, x, y, x_name, y_name, scalar=False):
    size = x.shape[0]

    labels = [x.iloc[i][x_name] for i in range(0, size)]
    predictions = model.predict(x)

    line_points = [{'x': labels[i], 'y': predictions[i]} for i in range(0, size)] if scalar else \
        [{'x': labels[i], 'y': predictions[i][0]} for i in range(0, size)]

    observations = [{'x': labels[i], 'y': y.iloc[i][y_name]} for i in range(0, 200)]

    return {
        'predictors': labels,
        'linePoints': line_points,
        'observations': observations
    }
