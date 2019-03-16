let polyInfoInitialized = false;

let polyRsquared = {};
let polyDegree = {};
let polyRegressionEquation = {};

let polyInfoTabSource = {};
let polyInfoTabTarget = {};
let polyInfoDegreeInput = {};
let polyMessageHolder = {};

function handleEnterPolyInfoTab() {
    if (polyInfoInitialized) return;
    Pace.track(function () {
        polyInfoTabSource = $('#in_select_poly_info');
        polyInfoTabTarget = $('#out_select_poly_info');
        polyInfoDegreeInput = $('#polyInfoDegreeInput');

        polyRsquared = $('#poly_r_squared');
        polyDegree = $('#poly_degree');
        polyRegressionEquation = $('#poly_regression_equation');
        polyMessageHolder = $('#polyMessageHolder');

        fillOptions(columns, polyInfoTabSource);
        fillOptions(columns, polyInfoTabTarget);
        polyInfoTabSource.find(':first').attr("selected", "selected");
        polyInfoTabTarget.find(':last').attr("selected", "selected");

        polyInfoTabSource.selectpicker('refresh');
        polyInfoTabTarget.selectpicker('refresh');

        initPolyInfoEvents();

        refillPolyRegressionInfo();
    });
    polyInfoInitialized = true;
}

function initPolyInfoEvents() {
    polyInfoTabSource.on('changed.bs.select', function () {
        Pace.track(function () {
            refillPolyRegressionInfo();
        });
    });

    polyInfoTabTarget.on('changed.bs.select', function () {
        Pace.track(function () {
            refillPolyRegressionInfo();
        });
    });

    polyInfoDegreeInput.on('changed.bs.select', function () {
        Pace.track(function () {
            refillPolyRegressionInfo();
        });
    });

    $('#save_poly_model_btn').click(function () {
        savePolyModel();
    });
}

function savePolyModel() {
    let x = getSelectedOptions(polyInfoTabSource);
    let y = getSelectedOptions(polyInfoTabTarget);
    let degree = getSelectedOption(polyInfoDegreeInput);

    if (x.length === 0 || y.length === 0) return;

    Pace.track(function () {
        $.ajax({
            url: '/data/api/models/',
            type: 'POST',
            data: JSON.stringify({
                data_id: parseInt(data_id),
                in: x,
                out: y,
                degree: degree,
                model: 'Polynomial'
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                console.log(response);

                if (response.status === 'ok') {
                    polyMessageHolder.append('<div class="alert alert-dismissible alert-success"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">Модель сохранена</p> ' +
                        '</div>');
                } else {
                    polyMessageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">Ошибка при сохранении модели: ' + response.error_message + '</p> ' +
                        '</div>');
                }
            }
        });
    });
}

function refillPolyRegressionInfo() {
    let x = getSelectedOptions(polyInfoTabSource);
    let y = getSelectedOptions(polyInfoTabTarget);
    let degree = getSelectedOption(polyInfoDegreeInput);

    if (x.length === 0 || y.length === 0) return;

    $.ajax({
        url: '/data/api/analysis/info/nonlinear/info/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y,
            degree: degree
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: updatePolyInfo
    });
}

// TODO correct info render
function updatePolyInfo(info) {
    polyRsquared.text(percents(info.r_squared));
    polyRsquared.attr('data-original-title', info.r_squared);

    polyDegree.text(info.degree);
    polyRegressionEquation.html(formatPolyRegressionEquation(info));
}

function formatPolyRegressionEquation(info) {
    const intercept = parseFloat(info.intercept).toFixed(3);
    const coefs = info.coefs.map(c => parseFloat(c).toFixed(4));

    let equation = "Y = ";

    for (let i = coefs.length; i > 0; i--) {
        let coef = coefs[i - 1];
        if (coef === 0) continue;
        equation += coef + 'X<sup>' + i + '</sup> + ';
    }
    equation += intercept;
    return equation;
}