let columnSelect;
let dataId;
let histogram;

$(document).ready(function () {
    columnSelect = $('#columnSelect');
    dataId = $('#ds_id').val();

    columnSelect.on('changed.bs.select', function () {
        renderInfo();
    });

    histogram = initHistogram('histogram');

    renderInfo();
});

function renderInfo() {
    Pace.track(function () {
        let column = columnSelect.find("option:selected").text();

        $.ajax({
            url: '/data/api/columns/',
            type: 'POST',
            data: JSON.stringify({
                data_id: dataId,
                column: column
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                updateHistogram(histogram, response);
            }
        });
    });
}

function initHistogram(canvasId) {
    let ctx = document.getElementById(canvasId).getContext('2d');
    let color = Chart.helpers.color;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                // label: 'Переменная',
                data: [],
                backgroundColor: color(window.chartColors.green).alpha(0.5).rgbString(),
                borderColor: window.chartColors.green,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Гистограмма переменной'
            },
            // scales: {
            //     xAxes: [{
            //         display: false,
            //         barPercentage: 1.2,
            //         ticks: {
            //             max: 10,
            //         }
            //     }],
            //     yAxes: [{
            //         ticks: {
            //             beginAtZero: true
            //         }
            //     }]
            // }
        }
    });
}

function updateHistogram(histogram, data) {
    data.values.map(val => parseFloat(val)).sort();

    histogram.data.labels = Array.from(Array(data.values.length).keys());
    histogram.data.datasets[0].data = data.values;
    histogram.update();
}