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
}

function recalculateForestScatterRegression() {
    let x = getSelectedOption(forestScatterTabSource);
    let y = getSelectedOption(forestScatterTabTarget);

    $.ajax({
        url: '/data/api/analysis/info/forest/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (responseInfo) {
            updateScatter(forestChart, responseInfo);
        }
    });
}