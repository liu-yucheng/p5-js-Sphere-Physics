let planets = [
  new Planet(
    20,
    20,
    [330, 50, 88, 100],
    new p5.Vector(300, 150),
    new p5.Vector(0, 30),
  ),
  
  new Planet(
    20,
    20,
    [90, 50, 88, 100],
    new p5.Vector(150, 450),
    new p5.Vector(5, -15),
  ),

  new Planet(
    20,
    20,
    [210, 50, 88, 100],
    new p5.Vector(450, 450),
    new p5.Vector(-5, -15),
  ),
];

function setup() {
  createCanvas(600, 600);
  blendMode(BLEND);
  colorMode(HSB, 360, 100, 100, 100);
  background(255, 50, 12, 100);
}

function draw() {
  noStroke();
  fill(255, 50, 12, 55);
  rect(0, 0, width, height);

  for (let index = 0; index < planets.length; index += 1) {
    let planet = planets[index];
    planet.updateAll();
    planet.drawAll();
    
    for (let index2 = index + 1; index2 < planets.length; index2 += 1) {
      let planet2 = planets[index2];
      planet.handleAllWith(planet2);
    }
  }

  console.log(planets);
}
