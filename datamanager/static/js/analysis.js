let columns = [];
let dataset = [];

let predictor = {};
let addictive = {};

let chart = {};

$(document).ready(function () {
    predictor = $('#var1');
    addictive = $('#var2');

    Pace.track(function () {
        $.ajax('/data/api/dataset/' + $('#data_id').val())
            .done(function (responseData) {
                columns = responseData.columns;
                dataset = parseRows(responseData);

                fillOptions(columns);
                chart = initScatter(dataset, predictor.find("option:selected").text(),
                    addictive.find("option:selected").text());
            });
    });

    predictor.on('changed.bs.select', function (e, clickedIndex) {
        updateScatter(chart, dataset, columns[clickedIndex], addictive.find("option:selected").text());
    });

    addictive.on('changed.bs.select', function (e, clickedIndex) {
        updateScatter(chart, dataset, predictor.find("option:selected").text(), columns[clickedIndex]);
    });
});

function fillOptions(columns) {
    predictor.find('option').remove();
    addictive.find('option').remove();

    $.each(columns, function (i, item) {
        predictor.append($('<option>', {
            value: i,
            text: item
        }));
        addictive.append($('<option>', {
            value: i,
            text: item
        }));
    });

    predictor.selectpicker('refresh');
    addictive.selectpicker('refresh');
}

function initScatter(dataset, x, y) {
    let data = [];
    for (let i = 0; i < dataset.length; i++) {
        let row = dataset[i];
        data.push({x: row[x], y: row[y]});
    }

    let ctx = document.getElementById("scatterPlot").getContext('2d');
    let color = Chart.helpers.color;

    return new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'X / Y',
                data: data,
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

function updateScatter(chart, dataset, x, y) {
    let data = [];
    for (let i = 0; i < dataset.length; i++) {
        let row = dataset[i];
        data.push({x: row[x], y: row[y]});
    }

    chart.data.datasets[0].data = data;
    chart.update();
}