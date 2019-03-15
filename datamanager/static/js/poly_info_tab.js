let polyInfoInitialized = false;

let polyRsquared = {};
let polyDegree = {};
let polyRegressionEquation = {};

let polyInfoTabSource = {};
let polyInfoTabTarget = {};
let polyInfoDegreeInput = {};

function handleEnterPolyInfoTab() {
    if (polyInfoInitialized) return;
    Pace.track(function () {
        polyInfoTabSource = $('#in_select_poly_info');
        polyInfoTabTarget = $('#out_select_poly_info');
        polyInfoDegreeInput = $('#polyInfodegreeInput');

        polyRsquared = $('#poly_r_squared');
        polyDegree = $('#poly_degree');
        polyRegressionEquation = $('#poly_regression_equation');

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
        if (coef == 0) continue;
        const index = i;
        equation += coef + 'X<sup>' + index + '</sup> + ';
    }
    equation += intercept;
    return equation;
}