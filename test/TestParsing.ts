import fs = require('fs');

import { expect } from 'chai';

import { parseRowMajor, parseColumnMajor } from '../src/parsing';

describe("Results parsing", () => {
    it("should read CSV as row major", async () => {
        let data = fs.readFileSync("test/FirstOrder_res.csv").toString();
        let result = await parseRowMajor(data);
        expect(result).to.have.lengthOf(502);
        result.forEach((row) => expect(row).to.have.lengthOf(3));
    })
    it("should read CSV as column major", async () => {
        let data = fs.readFileSync("test/FirstOrder_res.csv").toString();
        let result = await parseColumnMajor(data);
        expect(result).to.haveOwnProperty("time");
        expect(result).to.haveOwnProperty("x");
        expect(result).to.haveOwnProperty("der(x)");
        expect(result["time"]).to.have.lengthOf(501);
        expect(result["x"]).to.have.lengthOf(501);
        expect(result["der(x)"]).to.have.lengthOf(501);
    })
})