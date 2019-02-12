let polyScatterTabSource = {};
let polyScatterTabTarget = {};
let degreeInput = {};
let polyChart = {};

let polyScatterInitialized = false;

function handleEnterPolyTab() {
    if (polyScatterInitialized) return;
    Pace.track(function () {
        polyScatterTabSource = $('#in_select3');
        polyScatterTabTarget = $('#out_select3');
        degreeInput = $('#degreeInput');

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
        }
    });
}