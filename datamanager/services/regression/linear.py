import statsmodels.api as sm
from sklearn.linear_model import LinearRegression
from statsmodels.sandbox.stats.diagnostic import het_breuschpagan, acorr_breusch_godfrey
from statsmodels.stats.stattools import durbin_watson, jarque_bera

import datamanager.services.scatter as sct
import datamanager.services.validator as validator


def train_linear_model(x, y, x_name, y_name):
    model = LinearRegression().fit(x, y)
    scatter_data = sct.get_scatter_data(model, x, y, x_name, y_name)
    return scatter_data


def train_linear_model_enhanced(df, x_name, y_name):
    predictor = sm.add_constant(df[x_name])
    model = sm.OLS(df[y_name], predictor).fit()

    info = get_model_info(model)
    info['predictors'] = ['Смещение'] + x_name
    validation_result = validator.validate_linear(info)
    return {
        "info": info,
        'validation_result': validation_result
    }


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
