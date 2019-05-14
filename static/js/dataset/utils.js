function parseRows(dataset) {
    let content = JSON.parse(dataset.content.replace(new RegExp('\'', 'g'), "\""));
    let columns = dataset.columns;

    let indices = [];
    for (let key in content[columns[0]]) {
        indices.push(parseInt(key));
    }
    console.log(indices);

    let rows = [];
    indices.forEach(i => {
        let row = {};

        for (let j = 0; j < columns.length; j++) {
            let col = columns[j];
            row[col] = content[col][i];
        }
        row['__row_id__'] = i;
        rows.push(row);
    });
    return rows;
}

function getColumnValues(dataset, col) {
    let result = [];
    for (let i = 0; i < dataset.length; i++) {
        let row = dataset[i];
        result.push(row[col]);
    }
    return result;
}

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

const round = (param) => {
    return parseFloat(param).toFixed(3);
};

const percents = (param) => {
    return Math.round(parseFloat(param) * 100) + '%'
};