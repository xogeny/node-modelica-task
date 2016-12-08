import { Result } from './result';

import temp = require('temp');
import fs = require('fs');
import util = require('util');
import path = require('path');
import { exec } from 'child_process';

const script = `
setModelicaPath(getModelicaPath()+":"+".");
useMSL := {{msl}};
if useMSL then
  loadModel(Modelica);
end if;
cf := loadModel({{model}});
e := getErrorString();
if not cf then
   writeFile("error.txt", e);
   exit(1);
end if;
rec := simulate({{model}}, fileNamePrefix="{{model}}", outputFormat="csv", simflags="-noEventEmit");
e := getErrorString();
rfile := rec.resultFile;
if rfile=="" then
   writeFile("error.txt", e);
   exit(1);
end if;
`

export function omSimulate(name: string, source: string): Promise<Result> {
       // Automatically track and cleanup files at exit
       temp.track();

       temp.mkdir('modelica-task', function(err, dirPath) {
         var inputPath = path.join(dirPath, 'input.tex')
	   fs.writeFile(inputPath, myData, function(err) {
	       if (err) throw err;
    process.chdir(dirPath);
    exec("texexec '" + inputPath + "'", function(err) {
      if (err) throw err;
      fs.readFile(path.join(dirPath, 'input.pdf'), function(err, data) {
        if (err) throw err;
        sys.print(data);
      });
    });
  });
});
       // Open a temporary directory
       // Write modelica file
       // Write script
       // Call omc
       // Look for error.txt
       return Promise.reject("Unimplemented");
}
