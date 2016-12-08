import { Result } from './result';

import temp = require('temp');
import fs = require('fs');
import path = require('path');
import { parseColumnMajor } from './parsing';
import { exec } from 'child_process';

export function omSimulate(model: string, source: string, stopTime: number): Promise<Result> {
  // Automatically track and cleanup files at exit
  temp.track();

  return new Promise((resolve, reject) => {
    // Open a temporary directory
    temp.mkdir('modelica-task', function (err, dirPath) {
      try {
        let scriptFile = path.join(dirPath, "run.mos");
        let modelFile = path.join(dirPath, model + ".mo");
        let msl = false;

        let script = `
setModelicaPath(getModelicaPath()+":"+".");
useMSL := ${msl};
if useMSL then
  loadModel(Modelica);
end if;
cf := loadModel(${model});
e := getErrorString();
if not cf then
   writeFile("error.txt", e);
   exit(1);
end if;
rec := simulate(${model}, stopTime=${stopTime}, fileNamePrefix="${model}", outputFormat="csv", simflags="-noEventEmit");
e := getErrorString();
rfile := rec.resultFile;
if rfile=="" then
   writeFile("error.txt", e);
   exit(1);
end if;
`
        // Write script
        fs.writeFileSync(scriptFile, script);
        // Write modelica file
        fs.writeFileSync(modelFile, source);
        process.chdir(dirPath);
        // Call omc
        exec("omc " + scriptFile, (err) => {
          if (err) {
            reject(err);
            return;
          }
          // Look for error.txt
          if (fs.existsSync("error.txt")) {
            let message = fs.readFileSync("error.txt");
            reject(new Error(message.toString()));
            return;
          }
          let resFile = model + "_res.csv";
          let results = fs.readFileSync(resFile).toString();
          parseColumnMajor(results).then((v) => {
            resolve(v)
          });
        })
      } catch (e) {
        //console.error("Error while trying to compile and simulate " + model, e);
        reject(e);
      }
    });
  });
}
