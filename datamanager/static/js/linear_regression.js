let regrTabSource = {};
let regrTabTarget = {};
let rSquared = {};
let adjRSquared = {};
let durbinWatson = {};
let regressionEquation = {};
let breuschGodfrey = {};
let jarqueBera = {};
let paramsTable = {};
let breuschPagan = {};

let messageHolder = {};

let tab_initialized = false;

function handleEnterRegressionTab() {
    if (tab_initialized) return;
    initVariables();

    Pace.track(function () {
        fillOptions(columns, regrTabSource);
        fillOptions(columns, regrTabTarget);

        regrTabSource.find(':first').attr("selected", "selected");
        regrTabTarget.find(':last').attr("selected", "selected");

        regrTabSource.selectpicker('refresh');
        regrTabTarget.selectpicker('refresh');

        initRegrEvents();

        refillRegressionInfo();
    });
    tab_initialized = true;
}

function initVariables() {
    regrTabSource = $('#in_select2');
    regrTabTarget = $('#out_select2');
    rSquared = $('#r_squared');
    adjRSquared = $('#adj_r_squared');
    durbinWatson = $('#durbin_watson');
    regressionEquation = $('#regression_equation');
    breuschGodfrey = $('#breusch_godfrey');
    jarqueBera = $('#jarque_bera');
    breuschPagan = $('#breusch_pagan');

    paramsTable = $('#paramsTable');
    messageHolder = $('#messageHolder');
}

function initRegrEvents() {
    regrTabSource.on('changed.bs.select', function () {
        Pace.track(function () {
            refillRegressionInfo();
        });
    });

    regrTabTarget.on('changed.bs.select', function () {
        Pace.track(function () {
            refillRegressionInfo();
        });
    });

    $('#save_model_btn').click(function () {
        saveModel();
    });
}

function saveModel() {
    let x = getSelectedOptions(regrTabSource);
    let y = getSelectedOptions(regrTabTarget);

    if (x.length === 0 || y.length === 0) return;

    Pace.track(function () {
        $.ajax({
            url: '/data/api/models/',
            type: 'POST',
            data: JSON.stringify({
                data_id: parseInt(data_id),
                in: x,
                out: y,
                model: 'OLS'
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                console.log(response);

                if (response.status === 'ok') {
                    messageHolder.append('<div class="alert alert-dismissible alert-success"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">Модель сохранена</p> ' +
                        '</div>');
                } else {
                    messageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">Ошибка при сохранении модели: ' + response.error_message + '</p> ' +
                        '</div>');
                }
            }
        });
    });
}

function getSelectedOptions(select) {
    let options = [];
    select.find("option:selected").each(function () {
        options.push($(this).text());
    });
    return options;
}

function refillRegressionInfo() {
    let x = getSelectedOptions(regrTabSource);
    let y = getSelectedOptions(regrTabTarget);

    if (x.length === 0 || y.length === 0) return;

    $.ajax({
        url: '/data/api/analysis/info/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (responseInfo) {
            regressionEquation.html(formatRegressionEquation(responseInfo.info));

            rSquared.text(percents(responseInfo.info.r_squared));
            rSquared.attr('data-original-title', responseInfo.info.r_squared);

            adjRSquared.text(percents(responseInfo.info.adj_r_squared));
            adjRSquared.attr('data-original-title', responseInfo.info.adj_r_squared);

            durbinWatson.text(round(responseInfo.info.durbin_watson));
            durbinWatson.attr('data-original-title', responseInfo.info.durbin_watson);

            breuschGodfrey.text(percents(responseInfo.info.breusch_godfrey.f_pval));
            breuschGodfrey.attr('data-original-title', responseInfo.info.breusch_godfrey.f_pval);

            jarqueBera.text(percents(responseInfo.info.jarque_bera.jb_pval));
            jarqueBera.attr('data-original-title', responseInfo.info.jarque_bera.jb_pval);


            breuschPagan.text(percents(responseInfo.info.het_breuschpagan.f_pval));
            breuschPagan.attr('data-original-title', responseInfo.info.het_breuschpagan.f_pval);


            validateDwCriteria(responseInfo.info.durbin_watson);
            validateBgCriteria(responseInfo.info.breusch_godfrey);
            validateHetBpCriteria(responseInfo.info.het_breuschpagan);

            fillParamsTable(responseInfo.info);
        }
    });
}

function formatRegressionEquation(info) {
    const params = info.params;

    const intercept = parseFloat(params[0]).toFixed(3);

    let coefs = [];
    for (let i = 1; i < params.length; i++) {
        coefs.push(parseFloat(params[i]).toFixed(3));
    }

    let equation = "Y = ";
    for (let i = 0; i < coefs.length; i++) {
        let coef = coefs[i];
        equation += coef + 'X<sub>' + (i + 1) + '</sub>' + ' + ';
    }
    equation += intercept;
    return equation;
}

function validateDwCriteria(dwCriteria) {
    messageHolder.find('div').remove();

    if (dwCriteria > 1.5 && dwCriteria < 2.5) {
        messageHolder.append('<div class="alert alert-dismissible alert-success"> ' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
            '<p class="mb-0">Критерий Дарбина - Уотсона соблюдается</p> ' +
            '</div>');
    } else {
        messageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
            '<p class="mb-0">Критерий Дарбина - Уотсона не соблюдается, возможна автокорреляция остатков регрессионной модели</p> ' +
            '</div>');
    }
}

function validateBgCriteria(bgCriteria) {
    let fPValue = parseFloat(bgCriteria.f_pval);
    if (fPValue > 0.05) {
        messageHolder.append('<div class="alert alert-dismissible alert-success"> ' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
            '<p class="mb-0">Тест Бройша - Годфри соблюдается</p> ' +
            '</div>');
    } else {
        messageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
            '<p class="mb-0">Тест Бройша - Годфри не соблюдается, возможна автокорреляция остатков регрессионной модели</p> ' +
            '</div>');
    }
}

function validateHetBpCriteria(hetBpCriteria) {
    let fPValue = parseFloat(hetBpCriteria.f_pval);
    if (fPValue < 0.05) {
        messageHolder.append('<div class="alert alert-dismissible alert-success"> ' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
            '<p class="mb-0">Гетероскедатичность случайных ошибок отсутствует</p> ' +
            '</div>');
    } else {
        messageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
            '<p class="mb-0">Присутствует гетероскедатичность случайных ошибок. Это может привести к неэффективности построенных оценок.</p> ' +
            '</div>');
    }
}

function fillParamsTable(info) {
    const params = info.params.map(round);
    const size = params.length;

    const stds = info.std.map(round);
    const tValues = info.t_values.map(round);
    const pValues = info.p_values.map(round);

    let body = paramsTable.find('tbody');
    body.find('tr').remove();

    for (let i = 0; i < size; i++) {
        let row = '<tr><td>' + info.predictors[i] + '</td><td>' + params[i] + '</td><td>' +
            stds[i] + '</td><td>' + tValues[i] + '</td><td>' +
            pValues[i] + '</td></tr>';

        body.append(row);
    }
}

const round = (param) => {
    return parseFloat(param).toFixed(3);
};

const percents = (param) => {
    return Math.round(parseFloat(param) * 100) + '%'
};