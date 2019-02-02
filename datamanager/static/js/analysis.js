$(document).ready(function () {
    Pace.track(function () {
        $.ajax('/data/api/dataset/' + $('#data_id').val())
            .done(function (responseData) {
                let cols = responseData.columns;

                let first = $('#var1');
                let second = $('#var2');

                first.find('option').remove();
                second.find('option').remove();

                $.each(cols, function (i, item) {
                    first.append($('<option>', {
                        value: i,
                        text: item
                    }));
                    second.append($('<option>', {
                        value: i,
                        text: item
                    }));
                });

                first.selectpicker('refresh');
                second.selectpicker('refresh');

                scatter(responseData);
            });
    });
});

function parseRows(dataset) {
    let content = JSON.parse(dataset.content.replace(new RegExp('\'', 'g'), "\""));
    let columns = dataset.columns;

    let rows = [];
    for (let i = 0; i < dataset.size; i++) {
        let row = {};

        for (let j = 0; j < columns.length; j++) {
            let col = columns[j];
            row[col] = content[col][i];
        }

        rows.push(row);
    }

    return rows;
}

function scatter(dataset) {
    let rows = parseRows(dataset);

    let data = [];
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        data.push({x: row['x2'], y: row['y']});
    }

    let ctx = document.getElementById("scatterPlot").getContext('2d');
    let color = Chart.helpers.color;

    new Chart(ctx, {
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