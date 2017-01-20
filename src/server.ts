import kue = require('kue');
import { Request } from './result';
import { simulate } from './index';
import process = require('process');

const taskname = "simulateModelica";
const concurrent = 4;

export function wait(ms: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => resolve(undefined), ms);
    })
}

// TODO: Add command line options
export function runWorker(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            console.log("env = ", process.env);
            let options: kue.QueueOptions = {
                redis: {
                    host: process.env["REDIS_SERVER_HOST"] || "localhost",
                    port: process.env["REDIS_SERVER_PORT"] || 6379,
                },
            }
            console.log("redis options: ", options.redis);
            let queue = kue.createQueue(options);
            queue.process(taskname, concurrent, (job: any, done: any) => {
                try {
                    let req: Request = job.data.properties;
                    console.log("Got job request: ", req);
                    simulate(req.model, req.source, req.stopTime)
                        .then((result) => {
                            console.log("  Success");
                            console.log("  Result:\n" + JSON.stringify(result, null, 4));
                            let hyper = {
                                metadata: {
                                    class: ["result"],
                                    description: "Simulation of " + req.model
                                },
                                properties: {
                                    model: req.model,
                                    createdAt: new Date().getTime(),
                                    traj: result
                                },
                                related: []
                            }
                            console.log("  Hyper:\n" + JSON.stringify(hyper, null, 4));
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
            setTimeout(() => {
                resolve(true);
            }, 10000);
            queue["on"]('error', function (err: Error) {
                reject(err);
            });
        } catch (e) {
            reject(e);
        }
    })
}

async function run() {
    let running = false;

    while (!running) {
        try {
            await runWorker();
            console.log("Server running and ready for requests");
            running = true;
        } catch (e) {
            console.log("Caught error: ", e);
            await wait(10000);
        }
    }
}

run();
