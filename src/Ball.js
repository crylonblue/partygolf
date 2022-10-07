const { Bodies } = require('matter-js');

class Ball {

  constructor(x, y, radius, color, id, options){
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = radius;
    this.options = options;
    this.body = Bodies.circle(this.x, this.y, this.radius, this.options);
    this.id = id;
    this.hasWon = false;
    this.isReady = false;
    this.name = null;
    this.isInHoleCounter = 0;
    this.points = 0;
    this.outOfMapRespawnInitiated = false;
  }

}

module.exports = Ball;
