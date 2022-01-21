class Shadow {

  constructor(map, mouse, config, camera) {
    this.mouse = mouse;
    this.config = config;
    this.camera = camera;
    this.engine = Matter.Engine.create();
    this.boundariesArray = this.createBounds(map);
    Matter.World.add(this.engine.world, this.boundariesArray);
  }

  createBounds(boundaries){
    let boundsArr = [];

    boundaries.forEach((bounds) => {
      let bound = Matter.Bodies.fromVertices(bounds.position.x, bounds.position.y, bounds.vertices,{isStatic: true});
      boundsArr.push(bound);
    });

    return boundsArr;
  }

  calculateCurrentForce(ball) {
    let scaleFactor = Math.max(window.innerWidth/this.config['mapWidth'], window.innerHeight/this.config['mapHeight']);
    let degreeX = (ball.position.x - (this.mouse.mouseX - this.camera.x)) / window.innerWidth;
    let degreeY = (ball.position.y - (this.mouse.mouseY - this.camera.y)) / window.innerHeight;

    return {
      x: this.config['forceFactorX'] * -degreeX,
      y: this.config['forceFactorY'] * -degreeY
    };
  }

  predictBallMovement(ball) {
    let tempBall = Matter.Bodies.circle(ball.x, ball.y, ball.radius, {friction: this.config['ballFriction'], restitution: this.config['ballRestitution']});
    Matter.World.add(this.engine.world, tempBall);
    let force = this.calculateCurrentForce(tempBall);
    Matter.Body.applyForce(tempBall, tempBall.position, force);
    this.positions = [];

    for(let i = 0; i < this.config['maxPredictionPoints']; i++) {
      Matter.Engine.update(this.engine);
      this.positions.push({
        x: tempBall.position.x,
        y: tempBall.position.y,
        alpha: this.config['shadowMaxAlpha'] / i
      });
    }

    Matter.Composite.remove(this.engine.world, tempBall);
    
    return this.positions;
  }

}
