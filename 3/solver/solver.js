const _ = require("lodash");

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
      case "bruteforceRecursive":
        result = bruteforceRecursive(problem)
        break;
      case "dynamic":
        result = dynamic(problem)
        break;
      case "bab":
        result = bab(problem)
        break;
      case "fptas-10":
        result = fptas(problem,0.1)
        break;
      case "fptas-20":
        result = fptas(problem,0.2)
        break;
      case "fptas-30":
        result = fptas(problem,0.3)
        break;
      case "fptas-40":
        result = fptas(problem,0.4)
        break;
      case "fptas-50":
        result = fptas(problem,0.5)
        break;
      case "fptas-60":
        result = fptas(problem,0.6)
        break;
      case "fptas-70":
        result = fptas(problem,0.7)
        break;
      case "fptas-80":
        result = fptas(problem,0.8)
        break;
      case "fptas-90":
        result = fptas(problem,0.9)
        break;
      case "fptas-100":
        result = fptas(problem,1)
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
    }
    if(tempWeight <= maxWeight && tempPrice >= maxPrice) {
      maxPrice = tempPrice;
      maxPriceConfiguration = configuration;
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

function bruteforceRecursive(problem) {
  var maxWeight = problem.M;
  var itemCount = problem.n;
  var items = problem.items;
  var maxPrice = 0;
  var maxPriceConfiguration;
  function rec(currentWeight, currentElement) {
    if(currentElement+1 > items.length) {
        return 0;
    }
    if( currentWeight+items[currentElement].weight > maxWeight) {
      return rec(currentWeight, currentElement+1);
    }
    var left = rec(currentWeight, currentElement+1);
    var right = items[currentElement].price + rec(currentWeight+items[currentElement].weight, currentElement+1);
    return Math.max(left, right);
  }
  maxPrice = rec(0,0);
  console.log(maxPrice);
  return {
    id: problem.ID,
    n: problem.n,
    result: {
      maxPrice,
      maxPriceConfiguration
    }
  }
}

function fptas(problem, error) {
  var problemCopy = JSON.parse(JSON.stringify(problem));
  var items = problemCopy.items;
  var n = items.length;
  var maxPriceConfiguration = [];
  var maxPrice = items.reduce((a,b) => a > b.price?a:b.price,0);
  var b = Math.floor(Math.log2((error*maxPrice)/n));
  var reduction = 2**b;

  for(var i=0; i<n; i++) {
    items[i].price = Math.floor(items[i].price/reduction);
  }
  var approximatedResult = dynamic(problemCopy);
  var result = 0;
  for(var i=0; i<items.length; i++) {
    if(approximatedResult.result.maxPriceConfiguration[i]) {
      result += problem.items[i].price;
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

function dynamic(problem) {
  var maxWeight = problem.M;
  var itemCount = problem.n;
  var items = problem.items;
  var maxPrice = 0;
  var maxPriceConfiguration = [];
  var maxPossiblePrice = items.reduce( (a,b) => a+b.price, 0);
  var W = [];
  for(var i=0; i<=items.length; i++) {
    W[i] = [];
    for(var price=0; price<=maxPossiblePrice; price++) {
      W[i][price] = 0;
    }
  }

	for(var price = 1; price <= maxPossiblePrice; price++) {
		W[0][price] = Infinity;
	}
  for(var n=1; n <= items.length; n++) {
    var item = items[n-1];
    for(var price=0; price<=maxPossiblePrice; price++) {
      var itemIncluded = Infinity;
      var itemNotIncluded = W[n-1][price];
			if (price >= item.price && W[n-1][price-item.price] != Infinity) {
				itemIncluded = W[n-1][price-item.price] + item.weight;
			}
			W[n][price] = Math.min(itemIncluded, itemNotIncluded);
    }
  }

  for (var price = maxPossiblePrice; price >= 0; price--) {
			if (maxWeight >= W[items.length][price]) {
        maxPrice = price;
        break;
      }
	}

  var tempPrice = maxPrice;
  for(var i=items.length-1; i >= 0; i--) {
    if(W[i+1][tempPrice] != W[i][tempPrice]) {
      maxPriceConfiguration[i] = true;
      price = price-items[i].price;
    } else {
      maxPriceConfiguration[i] = false;
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

function bab(problem) {
  var maxWeight = problem.M;
  var itemCount = problem.n;
  var items = problem.items;
  var maxPrice = 0;
  var maxPriceConfiguration;
  var bestPrice = 0;
  var maxProfitTable = [];
  var currentConfiguration = [];

  function rec(currentWeight, currentPrice, currentElement) {
    if(currentElement+1 > items.length) {
      if(bestPrice < currentPrice) {
        bestPrice = currentPrice;
      }
      return 0;
    }
    if(currentPrice + maxProfitTable[currentElement] < bestPrice) {
      return 0;
    }

    if( currentWeight+items[currentElement].weight > maxWeight) {
      return rec(currentWeight, currentPrice, currentElement+1);
    }
    var right = items[currentElement].price + rec(currentWeight+items[currentElement].weight, currentPrice+items[currentElement].price, currentElement+1);
    var left = rec(currentWeight, currentPrice, currentElement+1);
    var thisNodeMaxPrice = Math.max(left, right);
    if(bestPrice < thisNodeMaxPrice) {
      bestPrice = thisNodeMaxPrice;
    }
    return thisNodeMaxPrice;
  }

  var sum = 0;
  for(var i = items.length-1; i>=0; i--) {
    sum += items[i].price;
    maxProfitTable[i] = sum;
  }
  //console.log(maxProfitTable);
  maxPrice = rec(0,0,0);
  console.log(maxPrice);
  return {
    id: problem.ID,
    n: problem.n,
    result: {
      maxPrice,
      maxPriceConfiguration
    }
  }
}


function savedbab(problem) {
  var maxWeight = problem.M;
  var itemCount = problem.n;
  var items = problem.items;
  var maxPriceConfiguration;
  var maxPrice = knapsack(maxWeight, items, itemCount);
  return {
    id: problem.ID,
    n: problem.n,
    result: {
      maxPrice,
      maxPriceConfiguration
    }
  }

  function bound(u, n, W, arr) {
    if( u.weight >= W ) {
      return 0;
    }

    var profit_bound = u.profit;
    var j = u.level + 1;
    var totweight = u.weight;

    while( (j < n) && ((totweight + arr[j].weight) <= W) ) {
      totweight += arr[j].weight;
      profit_bound += arr[j].price;
      j++;
    }

    if(j < n) {
      profit_bound += (W - totweight) * (arr[j].price/arr[j].weight);
    }
    return profit_bound;
  }
  function knapsack(W, arr, n) {
    var Q = [];
    var u = {
      level: -1,
      weight: 0,
      profit: 0,
      bound: 0
    };
    var v = {
      level: 0,
      weight: 0,
      profit: 0,
      bound: 0
    };
    Q.push(u);
    var maxProfit = 0;
    var i =0;
    var y =0;
    var z =0;
    while(Q.length !== 0) {
      a = Q.shift();
      u=_.clone(a, true)
      if(u.level == -1) {
        v.level = 0;
      }
      if(u.level == n-1) {
        continue;
      }
      v.level = u.level+1;

      v.weight = u.weight + arr[v.level].weight;
      v.profit = u.profit + arr[v.level].price;

      if(v.weight <= W && v.profit > maxProfit) {
        maxProfit = v.profit;
      }

      v.bound = bound(v, n, W, arr)
      if(v.bound > maxProfit) {
        i++;
        Q.push(Object.assign({}, v));
      }

      v.weight = u.weight;
      v.profit = u.profit;
      v.bound = bound(v, n, W, arr);
      if(v.bound > maxProfit) {
        y++;
        Q.push(Object.assign({}, v));
      }
      z++;
      //console.log(z, i, y);
    }
    return maxProfit;
  }
}
