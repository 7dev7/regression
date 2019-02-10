function handleEnterRegressionTab() {
    let regrTabSource = $('#in_select2');
    let regrTabTarget = $('#out_select2');

    Pace.track(function () {
        $.ajax('/data/api/dataset/' + data_id)
            .done(function (responseData) {
                columns = responseData.columns;
                dataset = parseRows(responseData);

                fillOptions(columns, regrTabSource);
                fillOptions(columns, regrTabTarget);

                //TODO check it
                // regrTabSource.find(':first').attr("selected", "selected");
                regrTabTarget.find(':last').attr("selected", "selected");
                regrTabTarget.selectpicker('refresh');


                let x = getSelectedOption(regrTabSource);
                let y = getSelectedOption(regrTabTarget);

                $.ajax('/data/api/analysis/info/' + data_id + '/' + x + '/' + y + '/')
                    .done(function (responseInfo) {
                        console.log(responseInfo);
                        $('#r_squared').text(Math.round(parseFloat(responseInfo.info.r_squared) * 100) + '%');
                        $('#r_squared').attr('data-original-title', responseInfo.info.r_squared);


                        $('#adj_r_squared').text(Math.round(parseFloat(responseInfo.info.adj_r_squared) * 100) + '%');
                        $('#adj_r_squared').attr('data-original-title', responseInfo.info.adj_r_squared);
                    });
            });
    });
}