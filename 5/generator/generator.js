const yargs = require("yargs");

const argv = yargs.argv;

// author can be found at: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
function randn_bm(min, max, skew) {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

function generate(variables, clauses, min, max, skew, skew2) {
  function generateClause() {
    var tempClause = "";
    var clause = [];
    var isAllreadyInClause = {};
    var flagClauseIsEmpty = true;
    for(var i=0; i<3; i++) {
      var variableCoeficient = Math.random();
      if(variableCoeficient > 0.5) variableCoeficient = -1;
      else variableCoeficient = 1;
      var variable = Math.ceil(Math.random()*this.variables);
      if(isAllreadyInClause[variable]) {
        i--;
        continue;
      }
      clause[i] = variableCoeficient*variable;
      isAllreadyInClause[variable] = true;
      flagClauseIsEmpty = false;
    }
    if(flagClauseIsEmpty) return generateClause();
    else return clause;
  }

  this.variables = variables;
  this.clauses = clauses;
  this.output = "p cnf " + this.variables + " " + this.clauses + "\nw ";
  for(var i=0; i<this.variables; i++) {
    this.output += 10**Math.round(Math.random()*skew2) + " ";
  }
  this.clausesArray = [];
  for(var i=0; i<this.clauses; i++) {
    this.clausesArray.push(generateClause());
  }
  while(true) {
    var variableCounts = [];
    for(var i=1; i<=this.variables; i++) {
      variableCounts[i] = 0;
    }
    for(var i=0; i<this.clauses; i++) {
      for(var y=0; y<3; y++) {
        variableCounts[Math.abs(this.clausesArray[i][y])]++;
      }
    }
    var missingVariables = [];
    for(var i=1; i<=this.variables; i++) {
      if(variableCounts[i] == 0) {
        missingVariables.push(i);
      }
    }
    if(missingVariables.length == 0) break;
    for(var i=0; i<missingVariables.length; i++) {
      var randomClause = Math.floor(Math.random()*this.clauses);
      var randomPosition = Math.floor(Math.random()*this.clausesArray[randomClause].length);
      var randomSign = (Math.round(Math.random())?-1:1);
      this.clausesArray[randomClause][randomPosition] = randomSign*missingVariables[i];
    }
  }
  for(var i=0; i<this.clauses; i++) {
    output += "\n";
    for(var y=0; y<3; y++) {
      if(this.clausesArray[i][y] != 0) {
        output += this.clausesArray[i][y] + " ";
      }
    }
    output += "0";
  }
  return this.output;
}
var variables = argv.variables;
var clauses = argv.clauses;
var min = argv.min;
var max = argv.max;
var skew = argv.skew;
var skew2 = argv.skew2;
//console.log(variables, clauses, min, max, skew);
var dmacs = generate(variables, clauses, min, max, skew, skew2);
console.log(dmacs);
