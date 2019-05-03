let forestScatterTabSource = {};
let forestScatterTabTarget = {};
let forestChart = {};

let forestScatterInitialized = false;

function handleEnterForestScatterTab() {
    if (forestScatterInitialized) return;
    Pace.track(function () {
        forestScatterTabSource = $('#in_select_forest_scatter');
        forestScatterTabTarget = $('#out_select_forest_scatter');

        fillOptions(columns, forestScatterTabSource);
        fillOptions(columns, forestScatterTabTarget);
        forestScatterTabTarget.find(':last').attr("selected", "selected");
        forestScatterTabTarget.selectpicker('refresh');

        initForestScatterEvents();

        forestChart = initScatter("forestScatter");

        recalculateForestScatterRegression();
    });
    forestScatterInitialized = true;
}

function initForestScatterEvents() {
    forestScatterTabSource.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculateForestScatterRegression();
        });
    });

    forestScatterTabTarget.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculateForestScatterRegression();
        });
    });

    $('#forestScatterEstimatorsInput').on('change', function () {
        Pace.track(function () {
            recalculateForestScatterRegression();
        });
    });
}

function recalculateForestScatterRegression() {
    const x = getSelectedOption(forestScatterTabSource);
    const y = getSelectedOption(forestScatterTabTarget);
    const estimators = $('#forestScatterEstimatorsInput').val();

    if (x.length === 0 || y.length === 0 || parseInt(estimators) < 0) return;

    $.ajax({
        url: '/data/api/analysis/info/forest/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y,
            estimators: estimators
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (responseInfo) {
            updateScatter(forestChart, responseInfo);
        }
    });
}