let step2MessageHolder;

$(document).ready(function () {
    let step1 = $('#step1');
    let step2 = $('#step2');
    let step3 = $('#step3');
    let inColumns = $('#in_columns');
    let outColumns = $('#out_columns');
    step2MessageHolder = $('#step2_message_holder');

    $('#step1_button').click(function () {
        step2.hide('fast');
        step3.hide('fast');
        step1.show('fast');
    });

    $('#step2_button').click(function () {
        step3.hide('fast');
        step1.hide('fast');
        step2.show('fast');
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

    $('#step2_next').click(function () {
        if (!step2ValidateUserInput(inColumns, outColumns)) return;

        step1.hide('fast');
        step2.hide('fast');
        step3.show('fast');
    });

    $('#step2_back').click(function () {
        step2.hide('fast');
        step1.show('fast');
    });

    $('#step3_back').click(function () {
        step3.hide('fast');
        step2.show('fast');
    });
});

function fillColumns(holder, columns, type) {
    holder.empty();
    columns.forEach(col => {
        holder.append('<div class="custom-control custom-checkbox">\n' +
            '<input type="checkbox" id="' + type + '_' + col + '" name="dataset"\n' +
            'class="custom-control-input" value="' + col + '">\n' +
            '<label class="custom-control-label"\n' +
            'for="' + type + '_' + col + '">' + col + '</label>\n' +
            '</div>\n' +
            '<br/>');
    });
}

function step2ValidateUserInput(inColumns, outColumns) {
    //TODO correct messages
    step2MessageHolder.empty();

    let inSelected = getSelectedColumns(inColumns);
    let outSelected = getSelectedColumns(outColumns);


    if (Array.isArray(inSelected) && inSelected.length &&
        Array.isArray(outSelected) && outSelected.length) {

        let common = $.grep(inSelected, function (element) {
            return $.inArray(element, outSelected) !== -1;
        });

        if (Array.isArray(common) && common.length) {
            step2MessageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                '<p class="mb-0">Один параметр и входной и выходной</p> ' +
                '</div>');
            return false;
        }
        return true;
    } else {
        step2MessageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
            '<p class="mb-0">Не выбраны входные или выходные параметры</p> ' +
            '</div>');
        return false;
    }
}

function getSelectedColumns(selector) {
    let vals = [];
    selector.find('div>input[type=checkbox]:checked').each(function () {
        vals.push($(this).val());
    });
    return vals;
}