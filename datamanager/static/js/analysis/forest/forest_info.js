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
    forestInfoTabSource.on('hidden.bs.select', function () {
        Pace.track(function () {
            refillForestRegressionInfo();
        });
    });

    forestInfoTabTarget.on('hidden.bs.select', function () {
        Pace.track(function () {
            refillForestRegressionInfo();
        });
    });

    $('#save_forest_model_btn').click(function () {
        saveForestModel();
    });

    $('#forestInfoEstimatorsInput').on('change', function () {
        Pace.track(function () {
            refillForestRegressionInfo();
        });
    });
}

function saveForestModel() {
    const x = getSelectedOptions(forestInfoTabSource);
    const y = getSelectedOptions(forestInfoTabTarget);
    const estimators = $('#forestInfoEstimatorsInput').val();

    if (x.length === 0 || y.length === 0 || parseInt(estimators) < 0) return;

    Pace.track(function () {
        $.ajax({
            url: '/data/api/models/',
            type: 'POST',
            data: JSON.stringify({
                data_id: parseInt(data_id),
                in: x,
                out: y,
                model: 'Forest',
                estimators: estimators
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                if (response.status === 'ok') {
                    forestMessageHolder.append('<div class="alert alert-dismissible alert-success"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">Модель сохранена</p> ' +
                        '</div>');
                } else {
                    forestMessageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">Ошибка при сохранении модели: ' + response.error_message + '</p> ' +
                        '</div>');
                }
            }
        });
    });
}

function refillForestRegressionInfo() {
    const x = getSelectedOptions(forestInfoTabSource);
    const y = getSelectedOptions(forestInfoTabTarget);
    const estimators = $('#forestInfoEstimatorsInput').val();

    if (x.length === 0 || y.length === 0 || parseInt(estimators) < 0) return;

    $.ajax({
        url: '/data/api/analysis/info/forest/info/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y,
            estimators: estimators
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