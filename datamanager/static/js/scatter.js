let columns = [];
let dataset = [];

let source = {};
let target = {};

let chart = {};

let data_id;

$(document).ready(function () {
    source = $('#in_select');
    target = $('#out_select');
    data_id = $('#data_id').val();

    handleEnterScatter();
    initEvents();
});

function handleEnterScatter() {
    Pace.track(function () {
        $.ajax('/data/api/dataset/' + data_id)
            .done(function (responseData) {
                columns = responseData.columns;
                dataset = parseRows(responseData);

                initSelectors(columns);

                chart = initScatter(dataset, getSelectedOption(source), getSelectedOption(target));
                recalculateLinearRegression();
            });
    });
}

function initEvents() {
    source.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculateLinearRegression();
        });
    });

    target.on('changed.bs.select', function () {
        Pace.track(function () {
            recalculateLinearRegression();
        });
    });
}

function recalculateLinearRegression() {
    let x = getSelectedOption(source);
    let y = getSelectedOption(target);

    $.ajax('/data/api/analysis/' + data_id + '/' + x + '/' + y + '/')
        .done(function (responseData) {
            let regressionData = getRegressionData(responseData, x, y);
            updateScatter(chart, regressionData);
        });
}

function getRegressionData(regressionResult, x, y) {
    let intercept = parseFloat(regressionResult.intercept);
    let coefficient = parseFloat(regressionResult.coef[0]);

    let predictors = getColumnValues(dataset, x);
    predictors.sort();

    let linePoints = [];

    predictors.forEach(predictor => {
        let res = coefficient * predictor + intercept;
        linePoints.push({x: predictor, y: res});
    });

    let observations = [];
    for (let i = 0; i < dataset.length; i++) {
        let row = dataset[i];
        observations.push({x: row[x], y: row[y]});
    }

    return {
        linePoints: linePoints,
        observations: observations,
        predictors: predictors
    };
}

function getSelectedOption(select) {
    return select.find("option:selected").text();
}

function initSelectors(columns) {
    fillOptions(columns, source);
    fillOptions(columns, target);

    target.find(':last').attr("selected", "selected");
    target.selectpicker('refresh');
}

function fillOptions(columns, select) {
    select.find('option').remove();

    $.each(columns, function (i, item) {
        select.append($('<option>', {
            value: i,
            text: item
        }));
    });
    select.selectpicker('refresh');
}

function initScatter() {
    let ctx = document.getElementById("scatterPlot").getContext('2d');
    let color = Chart.helpers.color;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Линия регрессии',
                data: [],
                borderColor: window.chartColors.red,
                fill: false,
                lineTension: 0
            }, {
                label: 'Наблюдения',
                data: [],
                showLine: false,
                borderColor: window.chartColors.green,
                backgroundColor: color(window.chartColors.green).alpha(0.2).rgbString()
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    });
}

function updateScatter(chart, regressionData) {
    chart.data.labels = regressionData.predictors;
    chart.data.datasets[0].data = regressionData.linePoints;
    chart.data.datasets[1].data = regressionData.observations;
    chart.update();
}