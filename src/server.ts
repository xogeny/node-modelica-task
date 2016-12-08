import kue = require('kue');
import { Request } from './result';
import { simulate } from './index';

const taskname = "simulateModelica";
const concurrent = 4;

// TODO: Add command line options
export function run() {
    try {
        kue.createQueue().process(taskname, concurrent, (job: any, done: any) => {
            try {
                let req: Request = job.data;
                simulate(req.model, req.source, req.stopTime).then((result) => done(null, result), (e) => done(e));
            } catch (e) {
                done(e);
            }
        });
    } catch (e) {
        throw new Error("Couldn't initialize kue, redis down?")
    }

}

run();
