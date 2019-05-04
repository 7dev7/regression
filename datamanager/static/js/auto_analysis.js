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
        step4.hide('fast');
        $('#modelsTable').hide('fast');
        step1.show('fast');
    });

    $('.step2_button').click(function () {
        step3.hide('fast');
        step1.hide('fast');
        step4.hide('fast');
        $('#modelsTable').hide('fast');
        step2.show('fast');
    });

    $('.step3_button').click(function () {
        step4.hide('fast');
        $('#modelsTable').hide('fast');
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

    $('#selectAllInBtn').click(function () {
        let allChecked = true;
        const columns = $('input:checkbox[name=in_columns]');

        columns.each(function () {
            const checked = $(this).prop("checked");
            if (!checked) {
                allChecked = false;
            }
        });

        columns.each(function () {
            const value = !allChecked;
            $(this).prop("checked", value);
        });
    });

    $('#selectAllOutBtn').click(function () {
        let allChecked = true;
        const columns = $('input:checkbox[name=out_columns]');

        columns.each(function () {
            const checked = $(this).prop("checked");
            if (!checked) {
                allChecked = false;
            }
        });

        columns.each(function () {
            const value = !allChecked;
            $(this).prop("checked", value);
        });
    });

    $('#step3_next').click(function () {
        const data_id = $('.datasets').find('input[type=radio]:checked').val();
        $('#loadingRoller').show();

        Pace.track(function () {
            $.ajax({
                url: '/data/api/analysis/auto/',
                type: 'POST',
                data: JSON.stringify({
                    data_id: data_id,
                    x: getSelectedColumns(inColumns),
                    y: getSelectedColumns(outColumns)
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    const modelsTable = $('#modelsTable tbody');
                    modelsTable.empty();

                    $('#step4_message_holder').empty();

                    const highlightLimit = 5;
                    let count = 0;

                    response.models.forEach(modelData => {
                        let description = modelData.description || '';
                        const score = percents(modelData.score);

                        const validationData = modelData.validation_data;
                        if (validationData) {
                            const validation = formatValidationData(validationData);
                            description = description + ' <span class="text-danger">' + validation + '</span>'
                        }
                        const rowStyle = count < highlightLimit ? "table-success" : "table-light";

                        const tr = $('<tr class="' + rowStyle + '">' +
                            '<th scope="row">' + (count + 1) + '</th>' +
                            '<td>' + modelData.model + '</td>' +
                            '<td>' + score + '</td>' +
                            '<td>' + description + '</td></tr>');

                        const button = $('<button class="float-right btn btn-sm btn-outline-primary">Сохранить</button>');
                        button.click(function () {
                            handleSaveBtn(modelData, $(this));
                        });

                        const buttonTd = $('<td></td>');
                        buttonTd.append(button);

                        tr.append(buttonTd);

                        modelsTable.append(tr);
                        count++;
                    });

                    $('#modelsTitle').text('Построенные модели');
                    $('#modelsTable').show('fast');

                    $('#loadingRoller').hide();
                }
            });
        });

        step3.hide('fast');
        $('#modelsTitle').text('Пожалуйста, подождите. Идет процесс построения регрессионных моделей...');
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
        $('#modelsTable').hide('fast');
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
                const nextBtn = $("#step3_next");
                nextBtn.prop("disabled", false);

                $('#in_columns_st3 ul').empty();
                $('#out_columns_st3 ul').empty();

                const msgHolder = $('#step3_message_holder');

                response.in_columns.forEach(col => {
                    const col_type = response.in_types[col];
                    const formatted_col_type = col_type === 'num' ? 'Числовой' : 'Строковый';

                    const col_uniq = response.in_unique[col];
                    const threshold = response.unique_threshold;
                    const uniqueStyle = col_uniq < threshold ? 'text-danger' : 'text-muted';

                    col = $.trim(col);
                    const typeStyle = col_type === 'num' ? 'text-muted' : 'text-danger';

                    $('#in_columns_st3 ul').append(
                        '<li class="list-group-item d-flex justify-content-between align-items-center">' + col +
                        '\t<span class="' + uniqueStyle + '">Количество уникальных значений: ' + col_uniq + '</span>' +
                        '\t<span class="' + typeStyle + '">Тип переменной: ' + formatted_col_type + '</span></li>');
                });

                response.out_columns.forEach(col => {
                    const col_type = response.out_types[col];
                    const formatted_col_type = col_type === 'num' ? 'Числовой' : 'Строковый';

                    const col_uniq = response.out_unique[col];
                    const threshold = response.unique_threshold;
                    const uniqueStyle = col_uniq < threshold ? 'text-danger' : 'text-muted';

                    col = $.trim(col);
                    const typeStyle = col_type === 'num' ? 'text-muted' : 'text-danger';

                    $('#out_columns_st3 ul').append(
                        '<li class="list-group-item d-flex justify-content-between align-items-center">' + col +
                        '\t<span class="' + uniqueStyle + '">Количество уникальных значений: ' + col_uniq + '</span>' +
                        '\t<span class="' + typeStyle + '">Тип переменной: ' + formatted_col_type + '</span></li>');
                });

                let analysisIsAllowed = validateUnique(response);

                if (!analysisIsAllowed) {
                    nextBtn.prop("disabled", true);
                } else {
                    //dataset is ok case
                }

                if (Array.isArray(response.incorrect_columns) && response.incorrect_columns.length) {
                    nextBtn.prop("disabled", true);

                    msgHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">Одна или несколько колонок имеют строковый тип. Проверьте данные в этих колонках</p> ' +
                        '</div>');
                }

                if (Array.isArray(response.nan_columns) && response.nan_columns.length) {
                    const msg = `Колонки [${response.nan_columns}] содержат пропущенные данные.
                     При продолжении анализа строки с пропущенными данными будут исключены.`;
                    nextBtn.prop("disabled", true);
                    msgHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                        '<p class="mb-0">' + msg + '</p> ' +
                        '</div>');
                }

                step1.hide('fast');
                step2.hide('fast');
                step3.show('fast');
            }
        });
    }
});

function handleSaveBtn(modelData, button) {
    const data_id = $('.datasets').find('input[type=radio]:checked').val();
    const metaData = modelData.meta;

    $.ajax({
        url: '/data/api/models/',
        type: 'POST',
        data: JSON.stringify({
            data_id: parseInt(data_id),
            in: metaData.in,
            out: metaData.out,
            degree: metaData.degree || null,
            model: metaData.type,
            activation: metaData.activation || null,
            hidden: metaData.hidden || null,
            estimators: metaData.estimators || null,
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            const msgHolder = $('#step4_message_holder');
            msgHolder.empty();

            if (response.status === 'ok') {
                msgHolder.append('<div class="alert alert-dismissible alert-success"> ' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                    '<p class="mb-0">Модель сохранена</p> ' +
                    '</div>');
            } else {
                msgHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
                    '<p class="mb-0">Ошибка при сохранении модели: ' + response.error_message + '</p> ' +
                    '</div>');

                $([document.documentElement, document.body]).animate({
                    scrollTop: msgHolder.offset().top - 30
                }, 600);
            }
            button.remove();
        }
    });
}

function fillColumns(holder, columns, type) {
    holder.empty();
    columns.forEach(col => {
        holder.append('<div class="custom-control custom-checkbox">\n' +
            '<input type="checkbox" id="' + type + '_' + col + '" name="' + type + '_columns"\n' +
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

            $([document.documentElement, document.body]).animate({
                scrollTop: step2MessageHolder.offset().top - 30
            }, 600);
            return false;
        }
        return true;
    } else {
        step2MessageHolder.append('<div class="alert alert-dismissible alert-warning"> ' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button> ' +
            '<p class="mb-0">Не выбраны зависимые или независимые переменные</p> ' +
            '</div>');

        $([document.documentElement, document.body]).animate({
            scrollTop: step2MessageHolder.offset().top - 30
        }, 600);
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

            $([document.documentElement, document.body]).animate({
                scrollTop: msgHolder.offset().top - 30
            }, 600);
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

            $([document.documentElement, document.body]).animate({
                scrollTop: msgHolder.offset().top - 30
            }, 600);
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

function formatValidationData(validationData) {
    if (validationData.dw && validationData.bg && validationData.bp) {
        return "";
    }

    let result = "Внимание, нарушаются условия применимости: ";
    if (!validationData.dw || !validationData.bg) {
        result += "возможна автокорреляция; ";
    }
    if (!validationData.bp) {
        result += "присутствует гетероскедатичность ошибок";
    }
    return result;
}