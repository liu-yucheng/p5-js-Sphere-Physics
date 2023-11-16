/**
 * Copyright (C) 2023 Yucheng Liu. AGPL3/3+ license.
 * 
 * Developers: Yucheng Liu
 * Emails: liu.r.yucheng@outlook.com
 *  
 * Planet.
 * 
 * Begin - References.
 * 
 * 1. https://p5js.org/examples/motion-circle-collision.html
 * 
 * End - References.
 */

/** Planet. */
class Planet {
  /** 
   * Constructs a planet.
   * @param {Number} radius Radius. Unit is pixels.
   * @param {Number} mass Mass. Unit is kilograms.
   * @param {*} color_ Color. Color mode HSB, H360, S100, B100, A100.
   * @param {p5.Vector} position Initial position. Unit is pixels.
   * @param {p5.Vector} velocity Initial velocity. Unit is pixels per second.
   */
  constructor(radius, mass, color_, position, velocity) {
    /** Collision detection interval. Unit is seconds. */
    this.collisionInterval = 0.2;
    /** Gravitational constant. Fine tune parameter. Different from the real world one. Unit is unit. */
    this.gravitationalConstant = 1e2;
    /** Tracer length. Unit is frames. */
    this.tracerLength = 30;

    /** Radius. Unit is pixels. */
    this.radius = radius;
    /** Mass. Unit is kilograms. */
    this.mass = mass;
    /** Color. Color mode HSB, H360, S100, B100, A100. */
    this.color_ = color_;
    /** Position. Unit is pixels. */
    this.position = position.copy();
    /** Velocity. Unit is pixels per second. */
    this.velocity = velocity.copy();

    /** Last collision time. 0 is when the program starts. Unit is seconds. */
    this.lastCollisionTime = 0 / 1e3;
    /** Traces. */
    this.traces = [];
  }

  /** Updates all of the planet's properties. */
  updateAll() {
    this.updateTraces();
    this.updatePosition();
    this.updateOutOfBounds();
  }

  /** Draws all of the planet's drawables. */
  drawAll() {
    this.drawTraces();
    this.drawEllipse();
  }

  /**
   * Handles all of the planet's interrelations.
   * @param {Planet} other Another planet. 
   */
  handleAllWith(other) {
    this.handleCollisionWith(other);
    this.handleGravityWith(other);
  }

  /** Updates traces. */
  updateTraces() {
    let trace = this.position.copy()
    this.traces.push(trace);
    this.traces = this.traces.slice(-30);
  }

  /** Updates the planet's position based on its velocity. */
  updatePosition() {
    let physicsVelocity = p5.Vector.mult(this.velocity, deltaTime / 1e3);
    this.position.add(physicsVelocity);
  }

  /**
   * Updates planet out of bounds events.
   */
  updateOutOfBounds() {
    let velocityFactor = 0.88;
    let radiusFraction = this.radius * 0.5;

    if (this.position.x < -radiusFraction) {
      this.position.x = width + radiusFraction;
      this.velocity.x *= velocityFactor;
    }

    if (this.position.x > width + radiusFraction) {
      this.position.x = -radiusFraction;
      this.velocity.x *= velocityFactor;
    }

    if (this.position.y < -radiusFraction) {
      this.position.y = height + radiusFraction;
      this.velocity.y *= velocityFactor;
    }

    if (this.position.y > height + radiusFraction) {
      this.position.y = -radiusFraction;
      this.velocity.y *= velocityFactor;
    }
  }

  /** Draws the planet's traces. */
  drawTraces() {
    colorMode(HSB, 360, 100, 100, 100);
    let [h, s, b, a] = this.color_;
    noStroke();

    for (let index = this.traces.length - 1; index > -1; index -= 1) {
      let trace = this.traces[index];
      a = 100 * (0.25 * index / this.traces.length);
      fill(h, s, b, a);
      let diameter = this.radius * 2;
      ellipse(trace.x, trace.y, diameter, diameter);
    }
  }

  /** Draws the planet's elliptical appearance. */
  drawEllipse() {
    colorMode(HSB, 360, 100, 100, 100);
    let [h, s, b, a] = this.color_;
    stroke(h, 0.75 * s, 0.75 * b, a);
    strokeWeight(2);
    fill(h, s, b, a);
    let diameter = this.radius * 2;
    ellipse(this.position.x, this.position.y, diameter, diameter);
  }

  /**
   * Handles planet collision events.
   * Rules imported from reference 1.
   * @param {Planet} other Another planet.
   */
  handleCollisionWith(other) {
    // Get distances between the balls components
    let distanceVect = p5.Vector.sub(other.position, this.position);

    // Calculate magnitude of the vector separating the balls
    let distanceVectMag = distanceVect.mag();

    // Minimum distance before they are touching
    let minDistance = this.radius + other.radius;

    // The current time.
    let currentTime = millis() / 1e3;

    if (distanceVectMag < minDistance && currentTime - this.lastCollisionTime > this.collisionInterval) {
      this.lastCollisionTime = currentTime;

      let distanceCorrection = (minDistance - distanceVectMag) / 2.0;
      let d = distanceVect.copy();
      let correctionVector = d.normalize().mult(distanceCorrection);
      other.position.add(correctionVector);
      this.position.sub(correctionVector);

      // get angle of distanceVect
      let theta = distanceVect.heading();
      // precalculate trig values
      let sine = sin(theta);
      let cosine = cos(theta);

      /* 
       * bTemp will hold rotated ball this.positions. You 
       * just need to worry about bTemp[1] this.position
       */
      let bTemp = [new p5.Vector(), new p5.Vector()];

      /* 
       * this ball's this.position is relative to the other
       * so you can use the vector between them (bVect) as the 
       * reference point in the rotation expressions.
       * bTemp[0].this.position.x and bTemp[0].this.position.y will initialize
       * automatically to 0.0, which is what you want
       * since b[1] will rotate around b[0]
       */
      bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y;
      bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x;

      // rotate Temporary velocities
      let vTemp = [new p5.Vector(), new p5.Vector()];

      vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y;
      vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x;
      vTemp[1].x = cosine * other.velocity.x + sine * other.velocity.y;
      vTemp[1].y = cosine * other.velocity.y - sine * other.velocity.x;

      /*
       * Now that velocities are rotated, you can use 1D
       * conservation of momentum equations to calculate 
       * the final this.velocity along the x-axis.
       */
      let vFinal = [new p5.Vector(), new p5.Vector()];

      // final rotated this.velocity for b[0]
      vFinal[0].x =
        ((this.mass - other.mass) * vTemp[0].x + 2 * other.mass * vTemp[1].x) /
        (this.mass + other.mass);
      vFinal[0].y = vTemp[0].y;

      // final rotated this.velocity for b[0]
      vFinal[1].x =
        ((other.mass - this.mass) * vTemp[1].x + 2 * this.mass * vTemp[0].x) /
        (this.mass + other.mass);
      vFinal[1].y = vTemp[1].y;

      // hack to avoid clumping
      // bTemp[0].x += vFinal[0].x;
      // bTemp[0].y += vFinal[0].y;
      // bTemp[1].x += vFinal[1].x;
      // bTemp[1].y += vFinal[1].y;

      /*
       * Rotate ball this.positions and velocities back
       * Reverse signs in trig expressions to rotate 
       * in the opposite direction
       */
      // rotate balls
      let bFinal = [new p5.Vector(), new p5.Vector()];

      bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y;
      bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x;
      bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y;
      bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x;

      // update balls to screen this.position
      other.position.x = this.position.x + bFinal[1].x;
      other.position.y = this.position.y + bFinal[1].y;

      this.position.add(bFinal[0]);

      // update velocities
      this.velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y;
      this.velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x;
      other.velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y;
      other.velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x;
    }
  }

  /**
   * Handles gravity with another planet.
   * @param {Planet} other Another planet.
   */
  handleGravityWith(other) {
    let distanceVector = p5.Vector.sub(other.position, this.position);
    let distanceVectorMagnitude = distanceVector.mag();

    let gravitationalForce = this.gravitationalConstant * (this.mass * other.mass) / Math.pow(distanceVectorMagnitude, 2);
    let thisAcceleration = gravitationalForce / this.mass;
    let otherAcceleration = gravitationalForce / other.mass;

    let distanceVectorHeading = distanceVector.heading();
    let distanceSine = sin(distanceVectorHeading);
    let distanceCosine = cos(distanceVectorHeading);

    this.velocity.x += distanceCosine * thisAcceleration;
    this.velocity.y += distanceSine * thisAcceleration;
    other.velocity.x -= distanceCosine * otherAcceleration;
    other.velocity.y -= distanceSine * otherAcceleration;
  }
}
