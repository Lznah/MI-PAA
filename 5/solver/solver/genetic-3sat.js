var Individual = function(chromosome) {
  if(typeof chromosome != "undefined") {
    this.chromosome = chromosome;
    this.computeFitness();
    return;
  }
  this.chromosome = [];
  this.fitness = 0;
  for(var i=0; i<Individual.prototype.chromosomeLength; i++) {
    this.chromosome[i] = Math.round(Math.random())?true:false;
  }
  this.repair();
  this.computeFitness();
};

Individual.prototype.heuristicRepair = function() {
  for(var i=0; i<Individual.prototype.clauses.length; i++) {
    var clauseSatisfiable = false;
    for(var y=0; y<3; y++) {
      var variable = Math.abs(Individual.prototype.clauses[i][y])-1;
      //this.fitness += Individual.prototype.weights[variable];
      if(this.chromosome[variable] == undefined) console.log(""+variable);
      if(Individual.prototype.clauses[i][y] > 0) {
        clauseSatisfiable |= this.chromosome[variable];
      } else if(Individual.prototype.clauses[i][y] < 0) {
        clauseSatisfiable |= !this.chromosome[variable];
      } else {
        console.log("error");
      }
    }
    if(!clauseSatisfiable) {
      var clause = Individual.prototype.clauses[i];
      var candidate = Individual.prototype.clauseCandidates[i];
      var variable = Math.abs(clause[candidate])-1;
      if(clause[candidate] < 0) {
        var otherCandidate = Math.floor(Math.random()*3)
        while(otherCandidate == candidate) {
          otherCandidate = Math.floor(Math.random()*3);
        }
        var otherVariable = Math.abs(clause[candidate])-1
        if(clause[otherCandidate] < 0) {
          this.chromosome[otherVariable] = false;
        } else {
          //console.log("nasratzmrde");
          this.chromosome[otherVariable] = true;
        }
      } else {
        this.chromosome[variable] = true;
      }
    }
  }
}

Individual.prototype.nonHeuristicRepair = function() {
  var satisfiable = false;
  while(satisfiable != true) {
    satisfiable = true;
    for(var i=0; i<Individual.prototype.clauses.length; i++) {
      var clauseSatisfiable = false;
      for(var y=0; y<3; y++) {
        var variable = Math.abs(Individual.prototype.clauses[i][y])-1;
        //this.fitness += Individual.prototype.weights[variable];
        if(this.chromosome[variable] == undefined) console.log(""+variable);
        if(Individual.prototype.clauses[i][y] > 0) {
          clauseSatisfiable |= this.chromosome[variable];
        } else if(Individual.prototype.clauses[i][y] < 0) {
          clauseSatisfiable |= !this.chromosome[variable];
        } else {
          console.log("error");
        }
      }
      if(!clauseSatisfiable) {
        var clause = Individual.prototype.clauses[i];
        var candidate = Math.floor(Math.random()*3);
        var variable = Math.abs(clause[candidate])-1;
        if(clause[candidate] < 0) {
          this.chromosome[variable] = false;
        } else {
          this.chromosome[variable] = true;
        }
      }
      satisfiable &= clauseSatisfiable;
    }
  }
}

Individual.prototype.repair = function() {
  this.heuristicRepair();
  this.nonHeuristicRepair();
}

// author can be found at: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
Individual.prototype.randn_bm = function(min, max, skew) {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = Individual.prototype.randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

Individual.prototype.computeFitness = function() {
  var sumWeights = 0;
  for(var i=0; i<Individual.prototype.chromosomeLength; i++) {
    if(this.chromosome[i]) {
      sumWeights += Individual.prototype.weights[i];
    }
  }
  this.fitness = sumWeights;
  var satisfiable = true;
  for(var i=0; i<Individual.prototype.clauses.length; i++) {
    var clauseSatisfiable = false;
    for(var y=0; y<3; y++) {
      var variable = Math.abs(Individual.prototype.clauses[i][y])-1;
      //this.fitness += Individual.prototype.weights[variable];
      if(this.chromosome[variable] == undefined) console.log(""+variable);
      if(Individual.prototype.clauses[i][y] > 0) {
        clauseSatisfiable |= this.chromosome[variable];
      } else if(Individual.prototype.clauses[i][y] < 0) {
        clauseSatisfiable |= !this.chromosome[variable];
      } else {
        console.log("error");
      }
    }
    satisfiable &= clauseSatisfiable;
  }

  if(!satisfiable) {
    this.fitness = 0;
    return;
  }
}

Individual.prototype.stringify = function() {
  var string = "";
  for(var i=0; i<Individual.prototype.chromosomeLength; i++) {
    if(this.chromosome[i]) {
      string += "1"
    } else {
      string += "0"
    }
  }
  return string;
}

var Genetic3SAT = function(weights, clauses, populationSize, crossoverProbability, mutationProbability, numberOfgenerations) {
  this.population = [];
  this.populationSize = populationSize;
  this.crossoverProbability = crossoverProbability;
  this.mutationProbability = mutationProbability;
  this.numberOfgenerations = numberOfgenerations;
  Individual.prototype.chromosomeLength = weights.length;
  Individual.prototype.weights = weights;
  Individual.prototype.clauses = clauses;
  Individual.prototype.clauseCandidates = [];
  var maximumWeight = Individual.prototype.weights.reduce((total,amount) => total+amount);

  for(var i=0; i<Individual.prototype.clauses.length; i++) {
    var w = [];
    var clause = Individual.prototype.clauses[i];
    for(var y=0; y<3; y++) {
      var v = Math.abs(clause[y])-1;
      w[y] = {weight: Individual.prototype.weights[v], variable: y};
    }
    //console.log(w);
    w.sort((a,b) => a.weight < b.weight);
    Individual.prototype.clauseCandidates.push(w[0].variable);
  }
  //console.log(Individual.prototype.clauseCandidates);
  while(this.population.length < this.populationSize) {
    this.addRandomIndividual();
  }
  this.bestFitness = 0;
  var catastropheTimer = 0;
  console.log("generation\tbest\tsd\tavg\tcv\tcatastrophe");
  for(var i=0; i<this.numberOfgenerations; i++) {
    this.selection();
    this.crossover();
    this.mutation();
    this.population.sort((a,b) => {a.fitness < b.fitness});
    var sum = this.population.reduce((a,b) => a+b.fitness,0);
    var avg = sum/this.population.length;
    var subs = this.population.map(a => (a.fitness-avg)**2);
    var sumSubs = subs.reduce((a,b) => a+b,0);
    var stdDeviation = Math.sqrt((1/(this.population.length-1))*sumSubs);
    if(this.bestFitness < this.population[0].fitness) {
      this.bestFitness = this.population[0].fitness;
    } else if(this.bestFitness == this.population[0].fitness){
      catastropheTimer++;
    }
    catastropheTimer++;
    this.crossoverProbability = 1-(stdDeviation/avg)/Individual.prototype.chromosomeLength;
    this.mutationProbability = (stdDeviation/avg)/Individual.prototype.chromosomeLength;
    if(stdDeviation/avg < 0.00001) {
      console.log(`${i}\t${this.bestFitness}\t${stdDeviation}\t${avg}\t${0}\t${this.bestFitness}`);
      this.population = this.population.slice(0,this.populationSize/10);
      while(this.population.length <= this.populationSize) {
        this.population.push(new Individual());
      }
      catastropheTimer = 0;
    } else {
      console.log(`${i}\t${this.bestFitness}\t${stdDeviation}\t${avg}\t${10000*stdDeviation/avg}\tNaN`);
    }
    if(this.bestFitness == maximumWeight) {
      console.log("Found maximum");
      break;
    }
  }
}

Genetic3SAT.prototype.selection = function() {
  var clonedBestChromosome = this.population[0].chromosome.slice(0);
  this.population = this.tournament();
  this.population.push(new Individual(clonedBestChromosome));
}

Genetic3SAT.prototype.tournament = function() {
  var newPopulation = [];
  var tournament = [];
  var i = this.population.length;
  while(i > 0) {
    var randomIndividual = Math.floor(Math.random()*i);
    tournament.push(this.population[randomIndividual]);
    var tmp = this.population[i];
    this.population[i] = this.population[randomIndividual];
    this.population[randomIndividual] = tmp;
    i--;
    if(tournament.length >= 5) {
      tournament.sort((a,b) => a.fitness < b.fitness);
      newPopulation.push(tournament[0]);
      newPopulation.push(tournament[1]);
      tournament = [];
    }
  }
  return newPopulation;
}

Genetic3SAT.prototype.crossover = function() {
  var originalSurvivorsCount = this.population.length;
  while(this.population.length <= this.populationSize) {
    var randomNode1 = Math.floor(Math.random()*originalSurvivorsCount);
    var randomNode2 = Math.floor(Math.random()*originalSurvivorsCount);
    if(randomNode1 == randomNode2) continue;
    var {sibling1, sibling2} = this.singlepointCrossover(this.population[randomNode1].chromosome, this.population[randomNode2].chromosome);
    sibling1.computeFitness();
    sibling2.computeFitness();
    if(sibling1.fitness > 0 && this.crossoverProbability > Math.random()) {
      this.population.push(sibling1);
    } else {
      this.population.push(new Individual());
    }
    if(this.population.length == this.populationSize) break;
    if(sibling2.fitness > 0 && this.crossoverProbability > Math.random()) {
      this.population.push(sibling2);
    } else {
      this.population.push(new Individual());
    }
  }
}

Genetic3SAT.prototype.singlepointCrossover = function(chromosome1, chromosome2) {
  var randomPoint = Math.floor(Math.random()*chromosome1.length);
  var ch1p1 = chromosome1.slice(0,randomPoint);
  var ch1p2 = chromosome1.slice(randomPoint,chromosome1.length);

  var ch2p1 = chromosome2.slice(0,randomPoint);
  var ch2p2 = chromosome2.slice(randomPoint,chromosome2.length);

  var sibling1 = new Individual([...ch1p1,...ch2p2]);
  var sibling2 = new Individual([...ch2p1,...ch1p2]);

  sibling1.repair();
  sibling2.repair();
  return {sibling1, sibling2};
}

Genetic3SAT.prototype.uniformCrossover = function(chromosome1, chromosome2) {
  var newChromosome1 = [];
  var newChromosome2 = [];
  for(var i=0; i<chromosome1.length;i++) {
    if(Math.random() > 0.5) {
      newChromosome2[i] = chromosome1[i];
      newChromosome1[i] = chromosome2[i];
    } else {
      newChromosome2[i] = chromosome2[i];
      newChromosome1[i] = chromosome1[i];
    }
  }

  var sibling1 = new Individual(newChromosome1);
  var sibling2 = new Individual(newChromosome2);
  sibling1.repair();
  sibling2.repair();
  return {sibling1, sibling2};
}

Genetic3SAT.prototype.mutation = function() {
  for(var a=0; a<this.population.length; a++) {
    for(var i=0; i<Individual.prototype.chromosomeLength; i++) {
      var randomNode = Math.floor(Math.random()*Individual.prototype.chromosomeLength);
      if(Math.random() < this.mutationProbability) {
        this.population[a].chromosome[randomNode] = !this.population[a].chromosome[randomNode];
      }
    }
    this.population[a].repair();
  }
}

Genetic3SAT.prototype.addRandomIndividual = function() {
  this.population.push(new Individual());
}

module.exports = {Genetic3SAT,Individual};
