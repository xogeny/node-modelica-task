import { simulate } from '../src';
import { expect } from 'chai';

export const firstOrder = `
model FirstOrder
  Real x;
equation
  der(x) = 1-x;
end FirstOrder;
`
describe("Trigger a Modelica simulation", () => {
    it("should run a simulation and get the correct result", async () => {
        try {
            let result = await simulate("FirstOrder", firstOrder);
            expect(result).to.not.equal(null);
        } catch (e) {
            throw new Error("Simulation should have succeeded");
        }
    })
    it("should return an error for invalid syntax", async () => {
        let failed = false;
        try {
            await simulate("FirstOrder", "model Foo end;");
        } catch (e) {
            failed = true;
            // This is the expected outcome!
        }
        expect(failed).to.not.equal(false);
    })
})