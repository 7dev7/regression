$(document).ready(function () {
    Pace.track(function () {
        $.ajax('/data/api/dataset/' + $('#data_id').val())
            .done(function (responseData) {
                renderTable(responseData);
            });
    });
});

function renderTable(dataset) {
    console.log(dataset);
    let content = JSON.parse(dataset.content.replace(new RegExp('\'', 'g'), "\""));
    let columns = dataset.columns;

    for (let propertyName in content['0']) {
        columns.push(propertyName);
    }

    let model = [];
    for (let i = 0; i < columns.length; i++) {
        model.push({label: columns[i], name: columns[i], editable: true});
    }

    //TODO implement content parsing
    console.log(content);

    $("#dataset_table").jqGrid({
        data: content,
        datatype: "local",
        colModel: model,
        autowidth: true,
        shrinkToFit: true,
        width: null,
        scroll: true,
        viewrecords: true,
        height: 500,
        rowNum: 25
    });
}