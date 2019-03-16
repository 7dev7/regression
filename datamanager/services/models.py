from datamanager.models import MlModel, Dataset


def save_ml_model(in_cols, out_cols, ds_id, model, degree, user):
    ds = Dataset.objects.get(pk=ds_id)
    name = generate_model_name(in_cols, out_cols, model)
    ml_model = MlModel(author=user, name=name, ds_in_cols=in_cols, ds_out_cols=out_cols,
                       dataset=ds, model=model, degree=degree)
    ml_model.save()


def generate_model_name(in_cols, out_cols, model):
    return 'Модель {}: {} -> {}'.format(model, in_cols, out_cols)


def delete_model(model_id):
    model = MlModel.objects.get(id=model_id)
    model.delete()


def check_model_correct(in_cols, out_cols, ds_id, model, degree, user):
    models = MlModel.objects.filter(author=user)

    for m in models:
        if m.dataset.pk == ds_id and m.model == model:
            in_columns = m.ds_in_cols
            out_columns = m.ds_out_cols
            columns_are_equal = (set(in_columns) == set(in_cols) and set(out_columns) == set(out_cols))
            degree_are_equal = (degree is None and m.degree is None) or (int(degree) == int(m.degree))

            if columns_are_equal and degree_are_equal:
                return False

    return True
