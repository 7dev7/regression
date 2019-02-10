let regrTabSource = {};
let regrTabTarget = {};
let rSquared = {};
let adjRSquared = {};
let durbinWatson = {};
let regressionEquation = {};
let breuschGodfrey = {};
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

            durbinWatson.text(parseFloat(responseInfo.info.durbin_watson).toFixed(3));
            durbinWatson.attr('data-original-title', responseInfo.info.durbin_watson);

            breuschGodfrey.text(parseFloat(responseInfo.info.breusch_godfrey[0]).toFixed(3));
            breuschGodfrey.attr('data-original-title', responseInfo.info.breusch_godfrey[0]);

            validateDwCriteria(responseInfo.info.durbin_watson);
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

    if (dwCriteria > 1.001 && dwCriteria < 2.5) {
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