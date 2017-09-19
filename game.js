var canvas = document.getElementsByTagName("canvas")[0], c = canvas.getContext("2d");
var requestFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	(cb => window.setTimeout(cb, 1000 / 30));

window.onkeydown = e => Game.keys[e.keyCode] = true;
window.onkeyup = e => Game.keys[e.keyCode] = false;

// Constructor
function Bird(nn) {
	this.height = 300;
	this.speed = 0;
	this.score = 0;
	this.NN = nn || new NN(...Game.NNStructure)
	Game.alive++;
	Bird.objects.push(this);
}
Bird.prototype.kill = function () {
	this.dead = true;
	this.score = Game.score;
	Game.alive--;
}
Bird.objects = [];

var Game = {
	keys: {},
	NNStructure: [1, 6, 1],
	score: 0,
	blockWidth: 60,
	gapMargin: 80,
	blockSpacing: 250,
	gapWidth: 100,
	gaps: [],
	speed: 2,
	startOffset: 500,
	playerSize: 30,
	alive: 0,
}

for (var i = 1000; i--;) Game.gaps[i] = Game.gapMargin + Math.random() * (canvas.height - 2 * Game.gapMargin - Game.gapWidth);
for (var i = 160; i--;) new Bird();

c.fillStyle = "rgba(0,0,0,0.5)";
c.strokeStyle = "white";
c.font = "20px Arial";
function render() {
	c.clearRect(0, 0, canvas.width, canvas.height);
	for (var i = Bird.objects.length; i--;) {
		var b = Bird.objects[i];
		if (b.dead) continue;
		//c.beginPath();
		//c.arc(canvas.width / 2, b.height, 10, 0, 2 * Math.PI);
		//c.fill();
		c.fillRect(canvas.width / 2, b.height, Game.playerSize, Game.playerSize);
	}
	for (var i = Game.gaps.length; i--;) {
		var g = Game.gaps[i];
		var offset = Game.blockSpacing * i + -Game.score * Game.speed + Game.startOffset;
		c.fillRect(offset, 0, Game.blockWidth, g);
		c.fillRect(offset, Game.gapWidth + g, Game.blockWidth, canvas.height);
	}
	c.strokeText("Score: " + Math.floor(((Game.speed * Game.score - Game.startOffset + canvas.width / 2 + Game.blockSpacing) - Game.blockWidth) / Game.blockSpacing), 30, 30);
	c.strokeText("Alive: " + Game.alive, 30, 60);
	requestFrame(render);
}
render();

function elapse() {
	for (var i = Bird.objects.length; i--;) {
		var b = Bird.objects[i];
		if (b.dead) continue;
		b.speed += .3;
		b.height += b.speed;
	}
	Game.score += 1;

	var diff = Game.speed * Game.score - Game.startOffset + canvas.width / 2 + Game.blockSpacing;
	var index = Math.floor((diff - Game.blockWidth) / Game.blockSpacing);
	if (index >= 0) {
		var g = Game.gaps[index];
		var space = (diff + Game.playerSize) % Game.blockSpacing;
		//console.log(Math.floor((diff - Game.blockWidth) / Game.blockSpacing), diff % Game.blockSpacing < Game.blockWidth);
		for (var i = Bird.objects.length; i--;) {
			var b = Bird.objects[i];
			if (b.dead) continue;
			if ((space < Game.playerSize + Game.blockWidth && (b.height < g || b.height + Game.playerSize > g + Game.gapWidth))
				|| b.height + Game.playerSize > canvas.height) b.kill();
			else if (b.NN.compute(b.height - g) > 0.9) b.speed = -6;
		}
	}
	if (!Game.alive) {
		Bird.objects.sort((a, b) => b.score - a.score);
		var oldBirds = Bird.objects;
		Bird.objects = [];
		for (var k = 3; k--;)for (var i = 10; i--;) for (var j = i; j--;) new Bird(oldBirds[i].NN.cross(oldBirds[j].NN));
		for (var i = 15; i--;) new Bird(oldBirds[i].NN.clone());
		Game.score = 0;
	}
	if (MAXSPEED) setTimeout(elapse, 0);
}
var MAXSPEED = false;
var speedButton = document.getElementById("speed");
speedButton.onclick = function () {
	MAXSPEED = !MAXSPEED;
	speedButton.innerHTML = MAXSPEED ? "Normal" : "Max"
}

setInterval(elapse, 1000 / 60);


