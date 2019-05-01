let forestScatterTabSource = {};
let forestScatterTabTarget = {};
let forestChart = {};
let forestRsquared = {};

let forestInitialized = false;

function handleEnterForestTab() {
    if (forestInitialized) return;
    Pace.track(function () {
        forestScatterTabSource = $('#in_select5');
        forestScatterTabTarget = $('#out_select5');
        forestRsquared = $('#forest_r_squared');

        fillOptions(columns, forestScatterTabSource);
        fillOptions(columns, forestScatterTabTarget);
        forestScatterTabTarget.find(':last').attr("selected", "selected");
        forestScatterTabTarget.selectpicker('refresh');

        initForestEvents();

        forestChart = initScatter("forestScatter");

        recalculateForestRegression();
    });
    forestInitialized = true;
}

function initForestEvents() {
    forestScatterTabSource.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculateForestRegression();
        });
    });

    forestScatterTabTarget.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculateForestRegression();
        });
    });
}

function recalculateForestRegression() {
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
            updateInfo(responseInfo);
        }
    });
}

function updateInfo(responseInfo) {
    let model = responseInfo.model;

    forestRsquared.text(percents(model.r_squared));
    forestRsquared.attr('data-original-title', model.r_squared);
}