import kue = require('kue');
import { Request } from './result';
import { simulate } from './index';
import process = require('process');

const taskname = "simulateModelica";
const concurrent = 4;

// TODO: Add command line options
export function run() {
    try {
        let options: kue.QueueOptions = {
            redis: {
                host: process.env("REDIS_HOST") || "localhost",
                port: process.env("REDIS_PORT") || 6379,
            },
        }
        kue.createQueue(options).process(taskname, concurrent, (job: any, done: any) => {
            try {
                let req: Request = job.data;
                console.log("Got job request: ", req);
                simulate(req.model, req.source, req.stopTime)
                    .then((result) => {
                        console.log("  Success");
                        done(null, result)
                    },
                    (e) => {
                        console.warn("  Failed: ", e);
                        done(e)
                    });
            } catch (e) {
                done(e);
            }
        });
    } catch (e) {
        throw new Error("Couldn't initialize kue, redis down?")
    }
    console.log("Server running and ready for requests");
}

run();
