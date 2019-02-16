const csv = require('csvtojson');
const fs = require('fs');
const _ = require('lodash');

// ID	n	M	váha	cena	váha	cena	...	...
// n - počet věcí
// M - kapacita batohu

const yargs = require("yargs");

var Solver = require("./solver/solver.js");

const argv = yargs
  .usage('Usage: knapsack <size>')
  .help()
  .argv;

var instSize = argv._[0];
var solver = new Solver();
var data = JSON.parse(fs.readFileSync('problems/data.json', 'utf8'));

csv({
  delimiter: ' ',
  noheader: true,
  headers: ['ID', 'n', 'M']
})
.fromFile('./problems/inst/knap_'+instSize+'.inst.dat')
.then((jsonObj)=>{
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
  data[instSize].maxApproximationError = 0;
  data[instSize].sumApproximationError = 0;
  data[instSize].avgApproximationError = 0;
  data[instSize].bruteforce = {};
  data[instSize].heuristic = {};
  data[instSize].bruteforce.sumTime = 0;
  data[instSize].bruteforce.avgTime = 0;
  data[instSize].bruteforce.maxTime = 0;
  data[instSize].bruteforce.minTime = Infinity;
  data[instSize].bruteforce.times = [];
  data[instSize].bruteforce.results = [2875,3327,3463,3987,3771,3968,3757,3659,3773,3786,3206,4039,3059,3255,2965,3447,3456,3478,3272,4382,4013,3738,3860,3399,3302,3394,3745,3624,3605,3399,399,3711,3875,3598,4175,3944,3674,3896,3608,3139,3501,3310,3314,3232,3716,3413,4005,3392,3477,3730];
  data[instSize].heuristic.sumTime = 0;
  data[instSize].heuristic.avgTime = 0;
  data[instSize].heuristic.maxTime = 0;
  data[instSize].heuristic.minTime = Infinity;
  data[instSize].heuristic.times = [];
  data[instSize].heuristic.results = [];
  var i=0;
  array.forEach((problem) => {
    var maxPriceConfiguration = 1
    var maxPrice = data[instSize].bruteforce.results[i];
    var resultBruteforce = {
      result: {
        id: 1,
        n: 1,
        result: {
          maxPrice,
          maxPriceConfiguration
        }
      },
      time : 0,
      method: 'bruteforce'
    };

    //solver.solve(problem, 'bruteforce');
    var resultHeuristic = solver.solve(problem, 'heuristic');
    var approximationError = Math.abs(resultBruteforce.result.result.maxPrice - resultHeuristic.result.result.maxPrice)/resultBruteforce.result.result.maxPrice;
    data[instSize].sumApproximationError += approximationError;
    data[instSize].bruteforce.times[i] = resultBruteforce.time;
    data[instSize].bruteforce.results[i] = resultBruteforce.result.result.maxPrice;
    data[instSize].bruteforce.sumTime += resultBruteforce.time;
    data[instSize].heuristic.times[i] = resultHeuristic.time;
    //data[instSize].heuristic.results[i] = resultHeuristic.result.result.maxPrice;
    data[instSize].heuristic.sumTime += resultHeuristic.time;
    if(data[instSize].maxApproximationError < approximationError) {
      data[instSize].maxApproximationError = approximationError;
    }
    if(data[instSize].heuristic.maxTime < resultHeuristic.time) {
      data[instSize].heuristic.maxTime = resultHeuristic.time;
    }
    if(data[instSize].bruteforce.maxTime < resultBruteforce.time) {
      data[instSize].bruteforce.maxTime = resultBruteforce.time;
    }
    if(data[instSize].heuristic.minTime > resultHeuristic.time) {
      data[instSize].heuristic.minTime = resultHeuristic.time;
    }
    if(data[instSize].bruteforce.minTime > resultBruteforce.time) {
      data[instSize].bruteforce.minTime = resultBruteforce.time;
    }
    i++;
    data[instSize].bruteforce.avgTime = data[instSize].bruteforce.sumTime/i;
    data[instSize].heuristic.avgTime = data[instSize].heuristic.sumTime/i;
    data[instSize].avgApproximationError = data[instSize].sumApproximationError/i;
    fs.writeFileSync('./problems/data.json', JSON.stringify(data, false, 2));
  });
  console.log(data)
})
.catch( (err) => {
  console.log('File does not exist');
});
