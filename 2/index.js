const csv = require('csvtojson');
const fs = require('fs');
const _ = require('lodash');

// ID	n	M	váha	cena	váha	cena	...	...
// n - počet věcí
// M - kapacita batohu

const yargs = require("yargs");

const dataPath = "./problems/data.json";

var Solver = require("./solver/solver.js");

const argv = yargs
  .usage('Usage: knapsack <bruteforce/heuristic/fptas/bab/dynamic/fill> [<size/error>]')
  .help()
  .argv;

var instSize = argv._[1];
var algorithm = argv._[0];
var solver = new Solver();
var data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if(instSize === "time") {
  _.forEach(data[algorithm], (instance, key) => {
    var sumTime = instance.times.reduce( (a,b) => a+b, 0);
    instance.avgTime = sumTime/instance.times.length;
    instance.avgTime = parseFloat(instance.avgTime.toFixed(6));
  });
  fs.writeFileSync(dataPath, JSON.stringify(data, false, 2));
} else if(instSize === "error") {
    _.forEach(data[algorithm], (instance, key) => {
      instance.maxApproximationError = 0;
      var sumApproximationError = 0;
      var i = 0;
      _.forEach(instance.results, (result) => {
        var approximationError = Math.abs(data.expectedValues[key].results[i] - result)/data.expectedValues[key].results[i];
        if(instance.maxApproximationError < approximationError) {
          instance.maxApproximationError = approximationError;
        }
        sumApproximationError += approximationError;
        i++;
      });
      instance.maxApproximationError = parseFloat(instance.maxApproximationError.toFixed(6));
      instance.avgApproximationError = sumApproximationError/instance.results.length;
      instance.avgApproximationError = parseFloat(instance.avgApproximationError.toFixed(6));
    });
    fs.writeFileSync(dataPath, JSON.stringify(data, false, 2));
} else if(algorithm === "fill") {
  csv({
    delimiter: ' ',
    noheader: true,
    headers: ['ID', 'n', 'P']
  })
  .fromFile('./problems/sol/knap_'+instSize+'.sol.dat')
  .then((jsonObj)=>{
    if( _.isUndefined(data['expectedValues'])) {
      data['expectedValues'] = {};
    }
    data['expectedValues'][instSize] = {
      results: []
    }
    data['expectedValues'][instSize].results = jsonObj.map(a => a.P);
    fs.writeFileSync(dataPath, JSON.stringify(data, false, 2));
  });
} else {
  csv({
    delimiter: ' ',
    noheader: true,
    headers: ['ID', 'n', 'M']
  })
  .fromFile('./problems/inst/knap_'+instSize+'.inst.dat')
  .then((jsonObj)=>{
    if( _.isUndefined(data[algorithm]) ) {
      data[algorithm] = {};
    }
    var array = [];
    _.forEach(jsonObj, (element) => {
      element.M = parseInt(element.M);
      element.n = parseInt(element.n);
      var counter = 0;
      var json = {};
      json.items = [];
      var item = {};
      _.forEach(element, (p, k) => {
        if(counter < 3) {
          json[k] = p;
        } else {
          if( (counter-3) % 2 == 1) {
            item.price = parseInt(p);
            item = {};
          } else {
            item.weight = parseInt(p);
            item.inSolution = false;
            json.items.push(item);
          }
        }
        counter++;
      });
      array.push(json);
    });
    data[algorithm][instSize] = {
      times: [],
      results: []
    };
    array.forEach((problem) => {
      var result = solver.solve(problem, algorithm);
      data[algorithm][instSize].times.push(result.time);
      data[algorithm][instSize].results.push(result.result.result.maxPrice)
      fs.writeFileSync(dataPath, JSON.stringify(data, false, 2));
    });
  })
  .catch( (err) => {
    console.log('File does not exist');
  });
}
