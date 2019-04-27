def validate_linear(model_info):
    dw_correct = __validate_dw_criteria(model_info)
    bg_correct = __validate_bg_criteria(model_info)
    bp_correct = __validate_bp_criteria(model_info)

    return {
        'dw': dw_correct,
        'bg': bg_correct,
        'bp': bp_correct
    }


def __validate_dw_criteria(model_info):
    dw = model_info['durbin_watson']
    return 1.5 < dw < 2.5


def __validate_bg_criteria(model_info):
    bg = model_info['breusch_godfrey']['f_pval']
    return bg > 0.05


def __validate_bp_criteria(model_info):
    bp = model_info['het_breuschpagan']['f_pval']
    return bp < 0.05
