let neuralScatterTabSource = {};
let neuralScatterTabTarget = {};
let neuralChart = {};
let neuralRsquared = {};
let activationFunc = {};
let hiddenNeurons = {};

let neuralScatterInitialized = false;

function handleEnterNeuralTab() {
    if (neuralScatterInitialized) return;
    Pace.track(function () {
        neuralScatterTabSource = $('#in_select4');
        neuralScatterTabTarget = $('#out_select4');
        neuralRsquared = $('#neural_r_squared');
        activationFunc = $('#activation_func');
        hiddenNeurons = $('#hidden_neurons');

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
            updateNeuralInfo(responseInfo);
        }
    });
}

function updateNeuralInfo(responseInfo) {
    let model = responseInfo.model;

    neuralRsquared.text(percents(model.r_squared));
    neuralRsquared.attr('data-original-title', model.r_squared);

    activationFunc.text(model.activation);
    hiddenNeurons.text(model.hidden_layer_sizes);
}