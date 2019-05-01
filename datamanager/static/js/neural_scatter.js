let neuralScatterTabSource = {};
let neuralScatterTabTarget = {};
let neuralChart = {};

let neuralScatterInitialized = false;

function handleEnterNeuralScatterTab() {
    if (neuralScatterInitialized) return;
    Pace.track(function () {
        neuralScatterTabSource = $('#in_select_neural_scatter');
        neuralScatterTabTarget = $('#out_select_neural_scatter');

        fillOptions(columns, neuralScatterTabSource);
        fillOptions(columns, neuralScatterTabTarget);
        neuralScatterTabTarget.find(':last').attr("selected", "selected");
        neuralScatterTabTarget.selectpicker('refresh');

        initNeuralScatterEvents();

        neuralChart = initScatter("neuralScatter");

        recalculateNeuralRegression();
    });
    neuralScatterInitialized = true;
}

function initNeuralScatterEvents() {
    neuralScatterTabSource.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculateNeuralRegression();
        });
    });

    neuralScatterTabTarget.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculateNeuralRegression();
        });
    });
}

function recalculateNeuralRegression() {
    let x = getSelectedOption(neuralScatterTabSource);
    let y = getSelectedOption(neuralScatterTabTarget);

    $.ajax({
        url: '/data/api/analysis/info/neural/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (responseInfo) {
            updateScatter(neuralChart, responseInfo);
        }
    });
}