import { Result } from './result';

import temp = require('temp');
import fs = require('fs');
import path = require('path');
//import { exec } from 'child_process';

export function omSimulate(model: string, source: string): Promise<Result> {
  // Automatically track and cleanup files at exit
  temp.track();

  return new Promise((resolve, reject) => {
    // Open a temporary directory
    temp.mkdir('modelica-task', function (err, dirPath) {
      try {
        console.log("temp dir = ", dirPath);
        let scriptFile = path.join(dirPath, "run.omc");
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
rec := simulate(${model}, fileNamePrefix="${model}", outputFormat="csv", simflags="-noEventEmit");
e := getErrorString();
rfile := rec.resultFile;
if rfile=="" then
   writeFile("error.txt", e);
   exit(1);
end if;
`
        console.log("script = ", script);
        // Write script
        fs.writeFileSync(scriptFile, script);
        // Write modelica file
        fs.writeFileSync(modelFile, source);
        process.chdir(dirPath);
        // Call omc
        //exec("omc " + scriptFile);
        // Look for error.txt
        if (fs.existsSync("error.txt")) {
          let message = fs.readFileSync("error.txt");
          reject(new Error(message.toString()));
          return;
        }
      } catch (e) {
        console.error("Error while trying to compile and simulate "+model, e);
        reject(e);
      }
    });
    resolve({
      success: true
    })
  });
}
