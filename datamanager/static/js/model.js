$(document).ready(function () {
    $('#predict_btn').click(function () {
        let text = $('#inputs').val();
        let columns = JSON.parse(text.replace(/'/g, '"'));

        const loadingRoller = $('#loadingRoller');
        loadingRoller.show();

        let values = [];
        for (let i = 0; i < columns.length; i++) {
            let col = columns[i];
            let value = $('#in' + col).val();
            if (!value) {
                loadingRoller.hide();
                return;
            }
            values.push(parseFloat(value));
        }

        $.ajax({
            url: '/data/api/analysis/predict/',
            type: 'POST',
            data: JSON.stringify({
                inputs: values,
                ml_model_id: $('#ml_id').val()
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                let predicted = response.predicted;

                if (!Array.isArray(predicted)) {
                    predicted = [predicted];
                }

                let outs = $('#outputs').val();
                let out_columns = JSON.parse(outs.replace(/'/g, '"'));

                for (let i = 0; i < out_columns.length; i++) {
                    let col = out_columns[i];
                    $('#out' + col).val(round(predicted[i]));
                }

                $('#loadingRoller').hide();
            }
        });
    });
});

