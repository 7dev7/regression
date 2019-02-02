function parseRows(dataset) {
    let content = JSON.parse(dataset.content.replace(new RegExp('\'', 'g'), "\""));
    let columns = dataset.columns;

    let rows = [];
    for (let i = 0; i < dataset.size; i++) {
        let row = {};

        for (let j = 0; j < columns.length; j++) {
            let col = columns[j];
            row[col] = content[col][i];
        }

        rows.push(row);
    }

    return rows;
}