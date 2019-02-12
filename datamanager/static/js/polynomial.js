function handleEnterPolyTab() {
    Pace.track(function () {

        $.ajax({
            url: '/data/api/analysis/info/nonlinear/',
            type: 'POST',
            data: JSON.stringify({
                data_id: data_id,
                x: "radio",
                y: "sales"
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (responseInfo) {
                let chart = initScatter("polyScatter");
                updateScatter(chart, responseInfo);
            }
        });
    });
}