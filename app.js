function random() {
	return 2 * Math.random() - 1;
};

function sigmoid(x) {
	return 1 / (1 + Math.exp(-x));
}
function mutation(prob) {
	throw "unimplemented";
}
function mutate(x, variation) {
	if (Math.random() < 0.02) return random();
	if (!variation) variation = 0.0;
	return x * (1 - variation + 2 * variation * Math.random());
}
function randEl(array, val) {
	return val === undefined ? array[Math.floor(array.length * Math.random())] : array[Math.floor(array.length * Math.random())] = val;
}

function NN() {
	if (arguments.length < 3) throw "Invalid layer count";
	this.structure = arguments;
	this.layers = [];
	this.weights = []; // Left to right
	this.biases = [];

	for (var i = arguments.length; i--;) this.layers[i] = new Array(arguments[i]);
	for (var i = arguments.length - 1; i--;) {
		var layer = this.weights[i] = [];
		for (var j = arguments[i]; j--;) {
			var weights = layer[j] = [];
			for (var k = arguments[i + 1]; k--;) weights[k] = random();
		}
		this.biases[i] = random();
	}
}
NN.prototype.compute = function () {
	if (arguments.length !== this.structure[0]) throw "\n" + arguments.length + " arguments given. " + this.structure[0] + " expected\n";

	for (var i = 1, layer = arguments; i < this.structure.length; i++) {
		var previousLayer = layer;
		layer = this.layers[i];
		var weights = this.weights[i - 1];
		var bias = this.biases[i - 1];

		for (var j = layer.length; j--;) {
			var dot = 0;
			for (var k = previousLayer.length; k--;) dot += previousLayer[k] * weights[k][j];
			layer[j] = sigmoid(dot + bias);
		}
	}
	return layer;
}
NN.prototype.cross = function () {
	var nn = new NN(...this.structure);
	var parents = [this, ...arguments];
	for (var i = nn.weights.length; i--;) {
		var layer = nn.weights[i];
		for (var j = layer.length; j--;) {
			var weights = layer[j];
			for (var k = weights.length; k--;)
				weights[k] = mutate(randEl(parents).weights[i][j][k]);
		}
	}
	for (var i = nn.biases.length; i--;)
		nn.biases[i] = mutate(randEl(parents).biases[i]);
	return nn;
}
NN.prototype.clone = function () {
	var nn = new NN(...this.structure);
	for (var i = nn.weights.length; i--;) {
		var layer = nn.weights[i];
		var parentLayer = this.weights[i];
		for (var j = layer.length; j--;) {
			var weights = layer[j];
			var parentWeights = parentLayer[j];
			for (var k = weights.length; k--;) weights[k] = mutate(parentWeights[k]);
		}
	}
	for (var i = nn.biases.length; i--;) nn.biases[i] = mutate(this.biases[i]);
	return nn;
}

//var brain = new NN(1, 200, 1);
//var cbrain = brain.clone();
//console.log(brain.compute(0.5))
//console.log(cbrain.weights, cbrain.biases);

////////////////////////////////////////////////////////////////////////////////

//var brains = [];
//var STRUCTURE = [1, 5, 1];
//for (var b = 100; b--;) brains.push({ NN: new NN(...STRUCTURE) }); // Population
//var PARENTS = 10;


//for (var iterations = 0; iterations < 1000; iterations++) {
//	for (var b = brains.length; b--;) {
//		var brain = brains[b];
//		//var n = Math.random() > 0.5 ? 1 : 0;
//		//brain.fitness = n - brain.NN.compute(n)[0]; // Fitness = function of guess accuracy
//		brain.fitness = brain.NN.compute(1)[0];
//	}
//	//c.lineTo(iterations, window.innerHeight - brains[0].fitness * window.innerHeight);
//	brains.sort((a, b) => b.fitness - a.fitness); // "brains" sorted by fitness
//	//if (iterations % 10000 === 0) console.log(brains[0].fitness);

//	var newBrains = [brains[0]]; // Best parent cloned
//	for (var k = PARENTS; k--;) for (var j = Math.floor(brains.length / PARENTS); j--;)
//		newBrains.push({ NN: brains[k].NN.cross(brains[j].NN) }) // Next generation created by crossing-over fittest parents

//	brains = newBrains;
//}
//console.log("over");
//c.stroke();