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

function handleEnterRegressionTab() {
    initVariables();

    Pace.track(function () {
        $.ajax('/data/api/dataset/' + data_id)
            .done(function (responseData) {
                columns = responseData.columns;
                dataset = parseRows(responseData);

                fillOptions(columns, regrTabSource);
                fillOptions(columns, regrTabTarget);

                regrTabSource.find(':first').attr("selected", "selected");
                regrTabTarget.find(':last').attr("selected", "selected");

                regrTabSource.selectpicker('refresh');
                regrTabTarget.selectpicker('refresh');

                initRegrEvents();

                refillRegressionInfo();
            });
    });
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

            rSquared.text(Math.round(parseFloat(responseInfo.info.r_squared) * 100) + '%');
            rSquared.attr('data-original-title', responseInfo.info.r_squared);

            adjRSquared.text(Math.round(parseFloat(responseInfo.info.adj_r_squared) * 100) + '%');
            adjRSquared.attr('data-original-title', responseInfo.info.adj_r_squared);

            durbinWatson.text(round(responseInfo.info.durbin_watson));
            durbinWatson.attr('data-original-title', responseInfo.info.durbin_watson);

            breuschGodfrey.text(round(responseInfo.info.breusch_godfrey[2]) +
                ' / p - значение: ' + round(responseInfo.info.breusch_godfrey[3]));
            breuschGodfrey.attr('data-original-title', responseInfo.info.breusch_godfrey[2]);

            jarqueBera.text(round(responseInfo.info.jarque_bera[0]) +
                ' / p - значение: ' + round(responseInfo.info.jarque_bera[1]));
            jarqueBera.attr('data-original-title', responseInfo.info.jarque_bera[0]);


            breuschPagan.text(round(responseInfo.info.het_breuschpagan[0]) +
                ' / p - значение: ' + round(responseInfo.info.het_breuschpagan[1]));
            breuschPagan.attr('data-original-title', responseInfo.info.jarque_bera[0]);


            validateDwCriteria(responseInfo.info.durbin_watson);
            validateBgCriteria(responseInfo.info.breusch_godfrey);

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
    let fPValue = parseFloat(bgCriteria[3]);
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