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

                chart = initScatter("scatterPlot");
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

    $.ajax({
        url: '/data/api/analysis/',
        type: 'POST',
        data: JSON.stringify({
            data_id: data_id,
            x: x,
            y: y
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (responseInfo) {
            updateScatter(chart, responseInfo);
        }
    });
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

function initScatter(canvasId) {
    let ctx = document.getElementById(canvasId).getContext('2d');
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
    regressionData.linePoints.sort(function (a, b) {
        return a['x'] - b['x'];
    });

    chart.data.labels = regressionData.predictors;
    chart.data.datasets[0].data = regressionData.linePoints;
    chart.data.datasets[1].data = regressionData.observations;
    chart.update();
}