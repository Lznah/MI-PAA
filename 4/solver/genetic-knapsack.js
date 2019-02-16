var Individual = function(chromosome) {
  if(typeof chromosome != "undefined") {
    this.chromosome = chromosome;
    this.computeFitness();
    return;
  }
  this.chromosome = [];
  this.fitness = 0;
  var sumWeights = 0;
  while(true) {
    var randomNode = Math.floor(Math.random()*this.chromosomeLength);
    if(typeof this.chromosome[randomNode] != "undefined") continue;
    if(sumWeights + Individual.prototype.items[randomNode].weight > Individual.prototype.maxWeight) break;
    this.chromosome[randomNode] = true;
    sumWeights += Individual.prototype.items[randomNode].weight;
  }
  this.computeFitness();
};
Individual.prototype.computeFitness = function() {
  var sumWeights = 0;
  var sumPrices = 0;
  for(var i=0; i<Individual.prototype.chromosomeLength; i++) {
    if(this.chromosome[i]) {
      sumWeights += Individual.prototype.items[i].weight;
      sumPrices += Individual.prototype.items[i].price;
    }
  }
  this.fitness = sumPrices;
  if(sumWeights > Individual.prototype.maxWeight) this.fitness = 0;
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

var GeneticKnapsack = function(maxWeight, items, populationSize, crossoverProbability, mutationProbability, numberOfgenerations) {
  this.population = [];
  this.populationSize = populationSize;
  this.crossoverProbability = crossoverProbability;
  this.mutationProbability = mutationProbability;
  this.numberOfgenerations = numberOfgenerations;
  this.maxPrice = items.reduce((a,b) => a + b.price, 0);
  Individual.prototype.chromosomeLength = items.length;
  Individual.prototype.maxWeight = maxWeight;
  Individual.prototype.items = items;

  while(this.population.length < this.populationSize) {
    this.addRandomIndividual();
  }
  this.bestFitness = 0;
  var catastropheTimer = 0;
  console.log("generation\tbest\tsd\tavg\catastrophe");
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
    if(catastropheTimer >= 50) {
      console.log(`${i}\t${this.bestFitness}\t${stdDeviation}\t${avg}\t${this.bestFitness}`);
      this.population = this.population.slice(0,100);
      while(this.population.length <= this.populationSize) {
        this.population.push(new Individual());
      }
      catastropheTimer = 0;
    } else {
      console.log(`${i}\t${this.bestFitness}\t${stdDeviation}\t${avg}\tNaN`);
    }
  }
}

GeneticKnapsack.prototype.selection = function() {
  this.tournament();
}

GeneticKnapsack.prototype.tournament = function() {
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
    if(tournament.length >= 3) {
      tournament.sort((a,b) => a.fitness < b.fitness);
      newPopulation.push(tournament[0]);
      newPopulation.push(tournament[1]);
      tournament = [];
    }
  }
  this.population = newPopulation;
}

GeneticKnapsack.prototype.crossover = function() {
  var originalSurvivorsCount = this.population.length;
  while(this.population.length <= this.populationSize) {
    var randomNode1 = Math.floor(Math.random()*originalSurvivorsCount);
    var randomNode2 = Math.floor(Math.random()*originalSurvivorsCount);
    if(randomNode1 == randomNode2) continue;
    var {sibling1, sibling2} = this.singlepointCrossover(this.population[randomNode1].chromosome, this.population[randomNode2].chromosome);
    if(sibling1.fitness > 0 && this.crossoverProbability < Math.random()) {
      this.population.push(sibling1);
    } else {
      this.population.push(new Individual());
    }
    if(this.population.length == this.populationSize) break;
    if(sibling2.fitness > 0 && this.crossoverProbability < Math.random()) {
      this.population.push(sibling2);
    } else {
      this.population.push(new Individual());
    }
  }
}

GeneticKnapsack.prototype.singlepointCrossover = function(chromosome1, chromosome2) {
  var randomPoint = Math.floor(Math.random()*chromosome1.length);
  var ch1p1 = chromosome1.slice(0,randomPoint);
  var ch1p2 = chromosome1.slice(randomPoint,chromosome1.length);

  var ch2p1 = chromosome2.slice(0,randomPoint);
  var ch2p2 = chromosome2.slice(randomPoint,chromosome2.length);

  var sibling1 = new Individual([...ch1p1,...ch2p2]);
  var sibling2 = new Individual([...ch2p1,...ch1p2]);

  return {sibling1, sibling2};
}

GeneticKnapsack.prototype.uniformCrossover = function(chromosome1, chromosome2) {
  var newChromosome1 = [];
  var newChromosome2 = [];
  for(var i=0; i<chromosome1;i++) {
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

  return {sibling1, sibling2};
}

GeneticKnapsack.prototype.mutation = function() {
  for(var a=0; a<this.population.length; a++) {
    for(var i=0; i<Individual.prototype.chromosomeLength; i++) {
      var randomNode = Math.random()*Individual.prototype.chromosomeLength;
      if(Math.random() > this.mutationProbability) {
        this.population[a].chromosome[randomNode] = !this.population[a].chromosome[randomNode];
      }
    }
  }
}

GeneticKnapsack.prototype.addRandomIndividual = function() {
  this.population.push(new Individual());
}

module.exports = GeneticKnapsack;
