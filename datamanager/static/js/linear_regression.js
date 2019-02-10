let regrTabSource = {};
let regrTabTarget = {};
let rSquared = {};
let adjRSquared = {};
let durbinWatson = {};
let regressionEquation = {};

function handleEnterRegressionTab() {
    initVariables();

    Pace.track(function () {
        $.ajax('/data/api/dataset/' + data_id)
            .done(function (responseData) {
                columns = responseData.columns;
                dataset = parseRows(responseData);

                fillOptions(columns, regrTabSource);
                fillOptions(columns, regrTabTarget);

                regrTabTarget.find(':last').attr("selected", "selected");
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

function refillRegressionInfo() {
    let x = getSelectedOption(regrTabSource);
    let y = getSelectedOption(regrTabTarget);

    $.ajax('/data/api/analysis/info/' + data_id + '/' + x + '/' + y + '/')
        .done(function (responseInfo) {
            regressionEquation.html(formatRegressionEquation(responseInfo.info));

            rSquared.text(Math.round(parseFloat(responseInfo.info.r_squared) * 100) + '%');
            rSquared.attr('data-original-title', responseInfo.info.r_squared);

            adjRSquared.text(Math.round(parseFloat(responseInfo.info.adj_r_squared) * 100) + '%');
            adjRSquared.attr('data-original-title', responseInfo.info.adj_r_squared);

            durbinWatson.text(parseFloat(responseInfo.info.durbin_watson).toFixed(3));
            durbinWatson.attr('data-original-title', responseInfo.info.durbin_watson);
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