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
        saveNeuralModel();
    });

    $('#neuralInfoActivationInput').on('changed.bs.select', function () {
        Pace.track(function () {
            refillNeuralRegressionInfo();
        });
    });

    $('#neuralInfoHiddenInput').on('change', function () {
        Pace.track(function () {
            refillNeuralRegressionInfo();
        });
    });
}

function saveNeuralModel() {
    const x = getSelectedOptions(neuralInfoTabSource);
    const y = getSelectedOptions(neuralInfoTabTarget);

    const activation = $('#neuralInfoActivationInput').find("option:selected").val();
    const hidden = $('#neuralInfoHiddenInput').val();

    if (x.length === 0 || y.length === 0) return;

    Pace.track(function () {
        $.ajax({
            url: '/data/api/models/',
            type: 'POST',
            data: JSON.stringify({
                data_id: parseInt(data_id),
                in: x,
                out: y,
                model: 'MLP',
                activation: activation,
                hidden: hidden
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                if (response.status === 'ok') {
                    neuralMessageHolder.append('<div class="alert alert-dismissible alert-success"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">Модель сохранена</p> ' +
                        '</div>');
                } else {
                    neuralMessageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">Ошибка при сохранении модели: ' + response.error_message + '</p> ' +
                        '</div>');
                }
            }
        });
    });
}

function refillNeuralRegressionInfo() {
    const x = getSelectedOptions(neuralInfoTabSource);
    const y = getSelectedOptions(neuralInfoTabTarget);

    const activation = $('#neuralInfoActivationInput').find("option:selected").val();
    const hidden = $('#neuralInfoHiddenInput').val();

    if (x.length === 0 || y.length === 0) return;

    $.ajax({
        url: '/data/api/analysis/info/neural/info/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y,
            activation: activation,
            hidden: hidden
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