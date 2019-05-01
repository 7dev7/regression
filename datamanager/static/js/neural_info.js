let neuralInfoTabSource = {};
let neuralInfoTabTarget = {};
let neuralRsquared = {};
let activationFunc = {};
let hiddenNeurons = {};

let neuralInfoInitialized = false;
let neuralMessageHolder = {};

function handleEnterNeuralInfoTab() {
    if (neuralInfoInitialized) return;
    Pace.track(function () {
        neuralInfoTabSource = $('#in_select_neural_info');
        neuralInfoTabTarget = $('#out_select_neural_info');

        neuralRsquared = $('#neural_r_squared');
        activationFunc = $('#activation_func');
        hiddenNeurons = $('#hidden_neurons');
        neuralMessageHolder = $('#neuralMessageHolder');

        fillOptions(columns, neuralInfoTabSource);
        fillOptions(columns, neuralInfoTabTarget);
        neuralInfoTabSource.find(':first').attr("selected", "selected");
        neuralInfoTabTarget.find(':last').attr("selected", "selected");

        neuralInfoTabSource.selectpicker('refresh');
        neuralInfoTabTarget.selectpicker('refresh');

        initNeuralInfoEvents();

        refillNeuralRegressionInfo();
    });
    neuralInfoInitialized = true;
}

function initNeuralInfoEvents() {
    neuralInfoTabSource.on('changed.bs.select', function () {
        Pace.track(function () {
            refillNeuralRegressionInfo();
        });
    });

    neuralInfoTabTarget.on('changed.bs.select', function () {
        Pace.track(function () {
            refillNeuralRegressionInfo();
        });
    });

    $('#save_neural_model_btn').click(function () {
        //    TODO implement
    });
}

function refillNeuralRegressionInfo() {
    let x = getSelectedOptions(neuralInfoTabSource);
    let y = getSelectedOptions(neuralInfoTabTarget);

    if (x.length === 0 || y.length === 0) return;

    $.ajax({
        url: '/data/api/analysis/info/neural/info/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: updateNeuralInfo
    });
}

function updateNeuralInfo(responseInfo) {
    neuralRsquared.text(percents(responseInfo.r_squared));
    neuralRsquared.attr('data-original-title', responseInfo.r_squared);

    activationFunc.text(responseInfo.activation);
    hiddenNeurons.text(responseInfo.hidden_layer_sizes);
}