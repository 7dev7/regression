$(document).ready(function () {
    let step1 = $('#step1');
    let step2 = $('#step2');
    let inColumns = $('#in_columns');
    let outColumns = $('#out_columns');

    $('#step1_button').click(function () {
        step2.hide('fast');
        step1.show('fast');
    });

    $('#step1_next').click(function () {
        let data_id = $('.datasets').find('input[type=radio]:checked').val();

        $.ajax('/data/api/dataset/' + data_id)
            .done(function (responseData) {
                fillColumns(inColumns, responseData.columns, 'in');
                fillColumns(outColumns, responseData.columns, 'out');

                step1.hide('fast');
                step2.show('fast');
            });
    });

    $('#step2_back').click(function () {
        step2.hide('fast');
        step1.show('fast');
    });
});

function fillColumns(holder, columns, type) {
    holder.empty();
    columns.forEach(col => {
        holder.append('<div class="custom-control custom-checkbox">\n' +
            '<input type="checkbox" id="' + type + '_' + col + '" name="dataset"\n' +
            'class="custom-control-input">\n' +
            '<label class="custom-control-label"\n' +
            'for="' + type + '_' + col + '">' + col + '</label>\n' +
            '</div>\n' +
            '<br/>');
    });
}