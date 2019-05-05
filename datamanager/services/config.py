from datamanager.models import Configuration


def update_config(user, unique_values_threshold, highlight_limit, p_value, nn_hidden_min,
                  nn_hidden_max, poly_min, poly_max):
    config = Configuration.objects.get(owner=user)
    config.unique_values_threshold = unique_values_threshold
    config.highlightLimit = highlight_limit
    config.p_value = p_value
    config.nn_hidden_min = nn_hidden_min
    config.nn_hidden_max = nn_hidden_max
    config.poly_min = poly_min
    config.poly_max = poly_max

    config.save()
