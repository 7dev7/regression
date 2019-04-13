from datamanager.models import MlModel, Dataset
from datamanager.services.auto_analysis import func_mapping


def save_ml_model(in_cols, out_cols, ds_id, model, degree, activation, hidden, user):
    ds = Dataset.objects.get(pk=ds_id)
    name = generate_model_name(in_cols, out_cols, model, degree, activation, hidden)
    ml_model = MlModel(author=user, name=name, ds_in_cols=in_cols, ds_out_cols=out_cols,
                       dataset=ds, model=model, degree=degree, activation=activation, hidden_layer=hidden)
    ml_model.save()


def generate_model_name(in_cols, out_cols, model, degree, activation, hidden):
    degree_suffix = ', {} степени'.format(degree) if degree is not None else ''
    activation_suffix = ', {}'.format(func_mapping.get(activation, '')) if activation is not None else ''
    hidden_suffix = ', {} нейронов'.format(hidden) if hidden is not None else ''
    return '{}: {} -> {}{}{}{}'.format(map_model(model), map_columns(in_cols), map_columns(out_cols),
                                       degree_suffix, activation_suffix, hidden_suffix)


def map_columns(cols):
    if len(cols) > 4:
        return '[{}, {}, {}, {}, ...]'.format(cols[0], cols[1], cols[2], cols[3])
    else:
        return cols


def map_model(model):
    if model == 'OLS':
        return 'Линейная модель'
    elif model == 'Polynomial':
        return 'Полиномиальная модель'
    elif model == 'MLP':
        return 'Персептрон'
    return model


def delete_model(model_id):
    model = MlModel.objects.get(id=model_id)
    model.delete()


def check_model_correct(in_cols, out_cols, ds_id, model, degree, activation, hidden, user):
    models = MlModel.objects.filter(author=user)

    for m in models:
        if m.dataset.pk == ds_id and m.model == model:
            in_columns = m.ds_in_cols
            out_columns = m.ds_out_cols
            columns_are_equal = (set(in_columns) == set(in_cols) and set(out_columns) == set(out_cols))
            degree_are_equal = (degree is None and m.degree is None) or (int(degree) == int(m.degree))
            hidden_are_equal = (hidden is None and m.hidden_layer is None) or (int(hidden) == int(m.hidden_layer))
            activation_are_equal = (activation is None and m.activation is None) or (activation == m.activation)

            if columns_are_equal and degree_are_equal and hidden_are_equal and activation_are_equal:
                return False

    return True
