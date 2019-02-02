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
    let model = parseColumnModels(dataset);

    let data = {
        page: 1,
        records: dataset.size,
        rows: parseRows(dataset)
    };

    $("#dataset_table").jqGrid({
        data: data.rows,
        datatype: "local",
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
    }).navGrid('#dataset_table_pager', {search: true, edit: true, add: true, del: true, refresh: false});
}