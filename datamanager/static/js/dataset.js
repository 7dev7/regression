$(document).ready(function () {
    Pace.track(function () {
        $.ajax('/data/api/dataset/' + $('#data_id').val())
            .done(function (responseData) {
                renderTable(responseData);
            });
    });
});

function parseColumnModels(dataset) {
    let content = JSON.parse(dataset.content.replace(new RegExp('\'', 'g'), "\""));
    let columns = dataset.columns;

    for (let propertyName in content['0']) {
        columns.push(propertyName);
    }

    let model = [];
    for (let i = 0; i < columns.length; i++) {
        model.push({label: columns[i], name: columns[i], editable: true});
    }

    return model;
}

function renderTable(dataset) {
    const editUrl = '/data/api/dataset/' + $('#data_id').val() + '/row/edit/';
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
        reloadAfterSubmit: true,
        url: editUrl,
        closeAfterEdit: true,
        closeOnEscape: true,
        beforeSubmit: function (postdata) {
            postdata['__row_id__'] = postdata['dataset_table_id'];
            delete postdata['dataset_table_id'];
            return [true, ""];
        },
        afterSubmit: function (postdata, formid) {
            $.each(columns, function (i, item) {
                $("#dataset_table").jqGrid('setCell', formid['__row_id__'], item, formid[item]);
            });
        }
    });
}