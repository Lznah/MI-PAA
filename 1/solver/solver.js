module.exports = class Solver {
  constructor() {}
  solve(problem, method) {
    let start = process.hrtime();
    var result;
    switch(method) {
      case "heuristic":
        result = heuristic(problem);
        break;
      case "bruteforce":
        result = bruteforce(problem);
        break;
    }
    let end = process.hrtime(start);
    let seconds = end[0];
    let microseconds = Math.round(end[1]/(10**3))/(10**6);
    let time = seconds + microseconds;
    return {
      result: result,
      time,
      method
    };
  }
}

function heuristic(problem) {
  var maxWeight = problem.M;
  var itemCount = problem.n;
  var items = problem.items;
  items.sort( (a, b) => {
    var x = a['price']/a['weight'];
    var y = b['price']/b['weight'];
    return (x>y?-1:(x<y?1:0));
  });
  var maxPrice = 0;
  var maxPriceConfiguration = [];
  maxPriceConfiguration.length = problem.n;
  maxPriceConfiguration.fill(0);
  var tempWeight = 0;
  for(var i=0; i<itemCount; i++) {
    if(maxWeight >= items[i].weight + tempWeight) {
      maxPriceConfiguration[i] = 1;
      tempWeight += items[i].weight;
      maxPrice += items[i].price;
    }
  }
  return {
    id: problem.ID,
    n: problem.n,
    result: {
      maxPrice,
      maxPriceConfiguration
    }
  }
}

function bruteforce(problem) {
  var maxWeight = problem.M;
  var itemCount = problem.n;
  var items = problem.items;
  var maxPrice = 0;
  var maxPriceConfiguration;
  for(var a=0; a<2**itemCount; a++) {
    var configuration = (a).toString(2).split('').reverse().map(x => parseInt(x));
    var tempWeight = 0;
    var tempPrice = 0;
    for(var b=0; b<itemCount; b++) {
      if(configuration[b] == undefined) {
         configuration[b] = 0;
      }
      if(configuration[b] == 1) {
        tempWeight += items[b].weight;
        tempPrice += items[b].price;
      }
      break;
    }
    if(tempWeight <= maxWeight && tempPrice >= maxPrice) {
      maxPrice = tempPrice;
      maxPriceConfiguration = configuration;
    }
    break;
  }
  return {
    id: problem.ID,
    n: problem.n,
    result: {
      maxPrice,
      maxPriceConfiguration
    }
  }
}
