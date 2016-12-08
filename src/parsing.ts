import parse = require('csv-parse');

export async function parseRowMajor(data: string): Promise<Array<Array<any>>> {
    let obj = await new Promise((resolve, reject) => {
        parse(data, { delimiter: "," }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        })
    });
    return obj as Array<Array<any>>;
}

export async function parseColumnMajor(data: string): Promise<{ [key: string]: Array<number> }> {
    let rows = await parseRowMajor(data);
    let ret = {};
    rows[0].forEach((heading) => ret[heading] = []);
    rows.slice(1).forEach((row) => {
        row.forEach((value, col) => {
            let key = rows[0][col];
            ret[key].push(+value);
        })
    })
    return ret;
}