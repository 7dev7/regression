let forestInfoTabSource = {};
let forestInfoTabTarget = {};
let forestRsquared = {};
let forestEstimators = {};

let forestInfoInitialized = false;
let forestMessageHolder = {};

function handleEnterForestInfoTab() {
    if (forestInfoInitialized) return;
    Pace.track(function () {
        forestInfoTabSource = $('#in_select_forest_info');
        forestInfoTabTarget = $('#out_select_forest_info');
        forestRsquared = $('#forest_r_squared');
        forestEstimators = $('#forest_estimators');

        forestMessageHolder = $('#forestMessageHolder');

        fillOptions(columns, forestInfoTabSource);
        fillOptions(columns, forestInfoTabTarget);
        forestInfoTabSource.find(':first').attr("selected", "selected");
        forestInfoTabTarget.find(':last').attr("selected", "selected");

        forestInfoTabSource.selectpicker('refresh');
        forestInfoTabTarget.selectpicker('refresh');

        initForestInfoEvents();

        refillForestRegressionInfo();
    });
    forestInfoInitialized = true;
}

function initForestInfoEvents() {
    forestInfoTabSource.on('changed.bs.select', function () {
        Pace.track(function () {
            refillForestRegressionInfo();
        });
    });

    forestInfoTabTarget.on('changed.bs.select', function () {
        Pace.track(function () {
            refillForestRegressionInfo();
        });
    });

    $('#save_forest_model_btn').click(function () {
        //    TODO implement
    });
}

function refillForestRegressionInfo() {
    let x = getSelectedOptions(forestInfoTabSource);
    let y = getSelectedOptions(forestInfoTabTarget);

    if (x.length === 0 || y.length === 0) return;

    $.ajax({
        url: '/data/api/analysis/info/forest/info/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: updateForestInfo
    });
}

function updateForestInfo(responseInfo) {
    forestRsquared.text(percents(responseInfo.r_squared));
    forestRsquared.attr('data-original-title', responseInfo.r_squared);

    forestEstimators.text(responseInfo.estimators);
}