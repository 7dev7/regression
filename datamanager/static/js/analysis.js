let columns = [];
let dataset = [];

let predictor = {};
let addictive = {};

let regr_predictor = {};
let regr_addictive = {};

let chart = {};

$(document).ready(function () {
    predictor = $('#var1');
    addictive = $('#var2');

    regr_predictor = $('#regr_var1');
    regr_addictive = $('#regr_var2');

    Pace.track(function () {
        $.ajax('/data/api/dataset/' + $('#data_id').val())
            .done(function (responseData) {
                columns = responseData.columns;
                dataset = parseRows(responseData);

                fillOptions(columns, predictor);
                fillOptions(columns, addictive);

                fillOptions(columns, regr_predictor);
                fillOptions(columns, regr_addictive);


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

    $.ajax('/data/api/analysis/' + $('#data_id').val() + '/x2/y/')
        .done(function (responseData) {
            let intercept = parseFloat(responseData.intercept);
            let coef = parseFloat(responseData.coef[0]);

            let ctx = document.getElementById("regressionPlot").getContext('2d');

            let labels = getColumnValues(dataset, 'x2');
            labels.sort();

            let line_data = [];

            labels.forEach(label => {
                let res = coef * label + intercept;
                line_data.push({x: label, y: res});
            });

            let color = Chart.helpers.color;

            let data = [];
            for (let i = 0; i < dataset.length; i++) {
                let row = dataset[i];
                data.push({x: row['x2'], y: row['y']});
            }

            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Линия регрессии',
                        data: line_data,
                        borderColor: window.chartColors.red,
                        fill: false,
                        lineTension: 0
                    }, {
                        label: 'X / Y',
                        data: data,
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
        });
});


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