let step2MessageHolder;

$(document).ready(function () {
    let step1 = $('#step1');
    let step2 = $('#step2');
    let step3 = $('#step3');
    let step4 = $('#step4');
    let inColumns = $('#in_columns');
    let outColumns = $('#out_columns');
    step2MessageHolder = $('#step2_message_holder');

    $('.step1_button').click(function () {
        step2.hide('fast');
        step3.hide('fast');
        step1.show('fast');
    });

    $('.step2_button').click(function () {
        step3.hide('fast');
        step1.hide('fast');
        step2.show('fast');
    });

    $('.step3_button').click(function () {
        step4.hide('fast');
        step2.hide('fast');
        step1.hide('fast');
        renderStep3();
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
        renderStep3();
    });

    $('#step3_next').click(function () {
        //    TODO start models

        step3.hide('fast');
        step4.show('fast');
    });

    $('#step2_back').click(function () {
        step2.hide('fast');
        step1.show('fast');
    });

    $('#step3_back').click(function () {
        step3.hide('fast');
        step2.show('fast');
    });

    $('#step4_back').click(function () {
        step4.hide('fast');
        renderStep3();
    });

    function renderStep3() {
        if (!step2ValidateUserInput(inColumns, outColumns)) return;
        let data_id = $('.datasets').find('input[type=radio]:checked').val();

        $.ajax({
            url: '/data/api/dataset/analysis/',
            type: 'POST',
            data: JSON.stringify({
                dataset_id: data_id,
                in_columns: getSelectedColumns(inColumns),
                out_columns: getSelectedColumns(outColumns)
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                console.log(response);
                $("#step3_next").prop("disabled", false);

                $('#in_columns_st3 ul').empty();
                $('#out_columns_st3 ul').empty();

                response.in_columns.forEach(col => {
                    let col_type = response.in_types[col];
                    col_type = col_type === 'num' ? 'Числовой' : 'Строковый';

                    const col_uniq = response.in_unique[col];
                    col = $.trim(col);

                    $('#in_columns_st3 ul').append(
                        '<li class="list-group-item d-flex justify-content-between align-items-center">' + col +
                        '\t<span class="text-muted">Количество уникальный значений: ' + col_uniq + '</span>' +
                        '\t<span class="text-muted">Тип переменной: ' + col_type + '</span></li>');
                });

                response.out_columns.forEach(col => {
                    let col_type = response.out_types[col];
                    col_type = col_type === 'num' ? 'Числовой' : 'Строковый';

                    const col_uniq = response.out_unique[col];
                    col = $.trim(col);

                    $('#out_columns_st3 ul').append(
                        '<li class="list-group-item d-flex justify-content-between align-items-center">' + col +
                        '\t<span class="text-muted">Количество уникальный значений: ' + col_uniq + '</span>' +
                        '\t<span class="text-muted">Тип переменной: ' + col_type + '</span></li>');
                });

                let analysisIsAllowed = validateUnique(response);

                if (!analysisIsAllowed) {
                    $("#step3_next").prop("disabled", true);
                } else {
                    $('#step3_message_holder').append('<div class="alert alert-dismissible alert-success"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">Набор данных подходит для анализа</p> ' +
                        '</div>');
                }

                step1.hide('fast');
                step2.hide('fast');
                step3.show('fast');
            }
        });
    }
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
    step2MessageHolder.empty();

    let inSelected = getSelectedColumns(inColumns);
    let outSelected = getSelectedColumns(outColumns);


    if (Array.isArray(inSelected) && inSelected.length &&
        Array.isArray(outSelected) && outSelected.length) {

        let common = $.grep(inSelected, function (element) {
            return $.inArray(element, outSelected) !== -1;
        });

        if (Array.isArray(common) && common.length) {
            let msg = common.length > 1 ? "Параметры " + common + " не могут быть одновременно зависимыми и независимыми"
                : "Параметр " + common + " не может быть одновременно зависимым и независимым";
            step2MessageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                '<p class="mb-0">' + msg + '</p> ' +
                '</div>');
            return false;
        }
        return true;
    } else {
        step2MessageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
            '<p class="mb-0">Не выбраны зависимые или независимые переменные</p> ' +
            '</div>');
        return false;
    }
}

function validateUnique(response) {
    let msgHolder = $('#step3_message_holder');
    msgHolder.empty();

    let numOfErrors = 0;

    const in_size = response.in_columns.length;

    for (let i = 0; i < in_size; i++) {
        let col = response.in_columns[i];
        let unique = response.in_unique[col];

        if (unique < response.unique_threshold) {
            let msg = 'Параметр ' + col + ' имеет категориальную шкалу. Для проведения регрессионного анализа параметры не должны иметь данную шкалу.';

            msgHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                '<p class="mb-0">' + msg + '</p> ' +
                '</div>');
            numOfErrors++;
        }
    }

    const out_size = response.out_columns.length;

    for (let i = 0; i < out_size; i++) {
        let col = response.out_columns[i];
        let unique = response.out_unique[col];

        if (unique < response.unique_threshold) {
            let msg = 'Параметр ' + col + ' имеет категориальную шкалу. Для проведения регрессионного анализа параметры не должны иметь данную шкалу.';

            msgHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                '<p class="mb-0">' + msg + '</p> ' +
                '</div>');
            numOfErrors++;
        }
    }

    return numOfErrors === 0
}

function getSelectedColumns(selector) {
    let values = [];
    selector.find('div>input[type=checkbox]:checked').each(function () {
        values.push($(this).val());
    });
    return values;
}