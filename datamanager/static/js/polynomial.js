let polyScatterTabSource = {};
let polyScatterTabTarget = {};
let degreeInput = {};
let polyChart = {};
let polyRsquared = {};
let polyDegree = {};
let polyRegressionEquation = {};

let polyScatterInitialized = false;

function handleEnterPolyTab() {
    if (polyScatterInitialized) return;
    Pace.track(function () {
        polyScatterTabSource = $('#in_select3');
        polyScatterTabTarget = $('#out_select3');
        degreeInput = $('#degreeInput');
        polyRsquared = $('#poly_r_squared');
        polyDegree = $('#poly_degree');
        polyRegressionEquation = $('#poly_regression_equation');

        fillOptions(columns, polyScatterTabSource);
        fillOptions(columns, polyScatterTabTarget);
        polyScatterTabTarget.find(':last').attr("selected", "selected");
        polyScatterTabTarget.selectpicker('refresh');

        initPolyScatterEvents();

        polyChart = initScatter("polyScatter");

        recalculatePolynomialRegression();
    });
    polyScatterInitialized = true;
}

function initPolyScatterEvents() {
    polyScatterTabSource.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculatePolynomialRegression();
        });
    });

    polyScatterTabTarget.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculatePolynomialRegression();
        });
    });

    degreeInput.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculatePolynomialRegression();
        });
    });
}

function recalculatePolynomialRegression() {
    let x = getSelectedOption(polyScatterTabSource);
    let y = getSelectedOption(polyScatterTabTarget);
    let degree = getSelectedOption(degreeInput);

    $.ajax({
        url: '/data/api/analysis/info/nonlinear/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y,
            degree: degree
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (responseInfo) {
            updateScatter(polyChart, responseInfo);
            updatePolyInfo(responseInfo);
        }
    });
}

function updatePolyInfo(responseInfo) {
    let model = responseInfo.model;

    polyRsquared.text(percents(model.r_squared));
    polyRsquared.attr('data-original-title', model.r_squared);

    polyDegree.text(model.degree);
    polyRegressionEquation.html(formatPolyRegressionEquation(responseInfo));
}

function formatPolyRegressionEquation(info) {
    const intercept = parseFloat(info.model.intercept).toFixed(3);
    const coefs = info.model.coefs.map(c => parseFloat(c).toFixed(4));

    let equation = "Y = ";


    for (let i = coefs.length; i > 0; i--) {
        let coef = coefs[i - 1];
        if (coef == 0) continue;
        const index = i;
        equation += coef + 'X<sub>' + index + '</sub><sup>' + index + '</sup> + ';
    }
    equation += intercept;
    return equation;
}