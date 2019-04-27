from statsmodels.sandbox.stats.diagnostic import acorr_breusch_godfrey, het_breuschpagan
from statsmodels.stats.stattools import jarque_bera, durbin_watson


def get_model_info(model):
    bg_lm, bg_lm_pval, bg_fval, bg_fpval = acorr_breusch_godfrey(model)
    jb, jb_pval, jb_skew, jb_kurtosis = jarque_bera(model.resid)
    het_bp_lm, het_bp_lmpval, het_bp_fval, het_bp_fpval = het_breuschpagan(model.resid, model.model.exog)

    return {
        'r_squared': model.rsquared,
        'adj_r_squared': model.rsquared_adj,
        'p_values': model.pvalues,
        'params': model.params,
        'std': model.bse,
        'size': model.nobs,
        't_values': model.tvalues,
        'durbin_watson': durbin_watson(model.resid),
        'breusch_godfrey': {
            'lm': bg_lm,
            'lm_pval': bg_lm_pval,
            'fval': bg_fval,
            'f_pval': bg_fpval
        },
        'jarque_bera': {
            'jb': jb,
            'jb_pval': jb_pval,
            'skew': jb_skew,
            'kurtosis': jb_kurtosis
        },
        'het_breuschpagan': {
            'lm': het_bp_lm,
            'lm_pval': het_bp_lmpval,
            'fval': het_bp_fval,
            'f_pval': het_bp_fpval
        },
        'residuals': model.resid
    }
