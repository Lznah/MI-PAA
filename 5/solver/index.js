var readline = require('readline');
const yargs = require("yargs");
var {Genetic3SAT,Individual} = require("./solver/genetic-3sat.js");

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

var Solver = require("./solver/solver.js");

const argv = yargs.argv;
var variablesCount,
    clausesCount,
    clauses = [];

var solver = new Solver();

var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [],
    weights = [];

stdin.resume();
stdin.setEncoding('utf8');
var rowCount = 0;
rl.on('line', function (chunk) {
  var parsedChunk = chunk.split(" ");
  if(rowCount == 0) {
    variablesCount = parsedChunk[2];
    clausesCount = parsedChunk[3];
  } else if(rowCount == 1) {
    for(var i=1; i<parsedChunk.length-1; i++) {
      weights[i-1] = parseInt(parsedChunk[i]);
    }
  } else {
    var tempClause = [];
    for(var i=0; i<parsedChunk.length-1; i++) {
      tempClause[i] = parseInt(parsedChunk[i]);
    }
    clauses.push(tempClause);
  }
  rowCount++;
});

rl.on('close', () => {
  var gen = new Genetic3SAT(weights, clauses, 100, 1, 0.001, 300);
  gen.population.sort((a,b)=>a.fitness>b.fitness);
  // console.log(gen.population[0].stringify());
  // console.log(JSON.stringify(Individual.prototype.weights));
  //console.log(a);
  //ind.computeFitness()
  // console.log(ind.weights);
  // console.log(ind.fitness);
})

//var data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// rl.on('end', () => {
//     console.log(clauses, weights);
// });

// csv({
//   delimiter: ' ',
//   noheader: true,
//   headers: ['ID', 'n', 'M']
// })
// .fromFile('./inst/'+instSize+".dat")
// .then((jsonObj)=>{
//   console.log(jsonObj);
//   // var array = [];
//   // _.forEach(jsonObj, (element) => {
//   //   element.M = parseInt(element.M);
//   //   element.n = parseInt(element.n);
//   //   var counter = 0;
//   //   var json = {};
//   //   json.items = [];
//   //   var item = {};
//   //   _.forEach(element, (p, k) => {
//   //     if(counter < 3) {
//   //       json[k] = p;
//   //     } else {
//   //       if( (counter-3) % 2 == 1) {
//   //         item.price = parseInt(p);
//   //         item = {};
//   //       } else {
//   //         item.weight = parseInt(p);
//   //         item.inSolution = false;
//   //         json.items.push(item);
//   //       }
//   //     }
//   //     counter++;
//   //   });
//   //   array.push(json);
//   // });
//   // data[algorithm][instSize] = {
//   //   times: [],
//   //   results: []
//   // };
//   // array.forEach((problem) => {
//   //   var result = solver.solve(problem, algorithm);
//   //   data[algorithm][instSize].times.push(result.time);
//   //   data[algorithm][instSize].results.push(result.result.result.maxPrice)
//   //   fs.writeFileSync(dataPath, JSON.stringify(data, false, 2));
//   // });
// })
// .catch( (err) => {
//   console.log('File does not exist');
// });
