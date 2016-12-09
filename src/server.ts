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
                host: process.env["REDIS_HOST"] || "localhost",
                port: process.env["REDIS_PORT"] || 6379,
            },
        }
        console.log("redis options: ", options.redis);
        kue.createQueue(options).process(taskname, concurrent, (job: any, done: any) => {
            try {
                let req: Request = job.data.properties;
                console.log("Got job request: ", req);
                simulate(req.model, req.source, req.stopTime)
                    .then((result) => {
                        console.log("  Success");
                        console.log("  Result:\n"+JSON.stringify(result, null, 4));
                        let hyper = {
                            metadata: {
                                class: ["result"],
                                description: "Simulation of "+req.model
                            },
                            properties: {
                                model: req.model,
                                createdAt: new Date().getTime(),
                                traj: result
                            },
                            related: []
                        } 
                        console.log("  Hyper:\n"+JSON.stringify(hyper, null, 4));
                        done(null, hyper)
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
