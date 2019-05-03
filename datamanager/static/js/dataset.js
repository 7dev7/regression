$(document).ready(function () {
    Pace.track(function () {
        $.ajax('/data/api/dataset/' + $('#data_id').val())
            .done(function (responseData) {
                renderTable(responseData);
                renderColumnsModal(responseData);
            });
    });
});

function renderColumnsModal(responseData) {
    const table = $('#columnsTable tbody');
    const columns = responseData.columns;

    table.empty();

    for (let i = 0; i < columns.length; i++) {
        const btn = $('<button class="btn btn-outline-danger float-right removeColumnBtn"><span aria-hidden="true">&times;</span></button>');
        btn.click(function () {
            handleColumnRemove(columns[i]);
        });

        const btnTd = $('<td></td>');
        btnTd.append(btn);

        const inputWidget = $('<input type="text" class="form-control form-control-sm" old-value="' + columns[i] + '" value="' + columns[i] + '"/>');
        inputWidget.change(function (e) {
            const inpt = $(this);
            const oldName = inpt.attr('old-value');
            const newName = inpt.val();

            const dataId = $('#data_id');
            const removeColumnUrl = '/data/api/dataset/' + dataId.val() + '/column/rename/';

            $.ajax({
                url: removeColumnUrl,
                type: 'POST',
                data: JSON.stringify({
                    old_name: oldName,
                    new_name: newName
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    location.reload();
                    return false;
                }
            });
        });

        const inputTd = $('<td></td>');
        inputTd.append(inputWidget);

        const tr = $('<tr></tr>');
        tr.append(inputTd);
        tr.append(btnTd);

        table.append(tr);
    }
}

function handleColumnRemove(columnToRemove) {
    const dataId = $('#data_id');
    const removeColumnUrl = '/data/api/dataset/' + dataId.val() + '/column/remove/';

    $.ajax({
        url: removeColumnUrl,
        type: 'POST',
        data: JSON.stringify({
            column: columnToRemove
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            location.reload();
            return false;
        }
    });
}

function parseColumnModels(dataset) {
    let content = JSON.parse(dataset.content.replace(new RegExp('\'', 'g'), "\""));
    let columns = dataset.columns;

    for (let propertyName in content['0']) {
        columns.push(propertyName);
    }

    let model = [];
    for (let i = 0; i < columns.length; i++) {
        model.push({label: columns[i], name: columns[i], editable: true, sorttype: 'float'});
    }

    return model;
}

function renderTable(dataset) {
    const dataId = $('#data_id');
    const editUrl = '/data/api/dataset/' + dataId.val() + '/row/edit/';
    const addUrl = '/data/api/dataset/' + dataId.val() + '/row/add/';
    const removeUrl = '/data/api/dataset/' + dataId.val() + '/row/remove/';

    let model = parseColumnModels(dataset);
    let columns = dataset.columns;

    let data = {
        page: 1,
        records: dataset.size,
        rows: parseRows(dataset)
    };

    $("#dataset_table").jqGrid({
        data: data.rows,
        datatype: "local",
        localReader: {
            id: "__row_id__"
        },
        colModel: model,
        autowidth: true,
        shrinkToFit: true,
        width: null,
        scroll: true,
        viewrecords: true,
        height: 500,
        rowNum: 25,
        pager: '#dataset_table_pager',
        cellsubmit: 'clientArray',
        editurl: 'clientArray',
        iconSet: 'fontAwesome',
        rownumbers: true,
        guiStyle: 'bootstrap4'
    }).navGrid('#dataset_table_pager', {
        search: true,
        edit: true,
        add: true,
        del: true,
        refresh: false,
    }, {
        reloadAfterSubmit: false,
        url: editUrl,
        closeAfterEdit: true,
        closeOnEscape: true,
        beforeSubmit: function (postdata) {
            postdata['__row_id__'] = postdata['dataset_table_id'];
            delete postdata['dataset_table_id'];
            return [true];
        },
        afterSubmit: function (postdata, formid) {
            $.each(columns, function (i, item) {
                $("#dataset_table").jqGrid('setCell', formid['__row_id__'], item, formid[item]);
            });
            return [true];
        }
    }, {
        reloadAfterSubmit: false,
        url: addUrl,
        position: "last",
        closeAfterAdd: true,
        closeOnEscape: true,
        afterSubmit: function (response) {
            return [true, "", $.parseJSON(response.responseText)];
        }
    }, {
        reloadAfterSubmit: false,
        closeAfterDelete: true,
        closeOnEscape: true,
        url: removeUrl
    });
}