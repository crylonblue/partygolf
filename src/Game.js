const { Bodies, Bounds, Body,  Engine, World, Svg } = require('matter-js');
const Ball = require('./Ball');
const Hole = require('./Hole');
const LeaderBoard = require('./LeaderBoard');
const decomp = require('poly-decomp');
const fs = require('fs');

class Game{

  constructor (){

    this.config = {
      mapWidth: 1400,
      mapHeight: 800,
      maxFramesUntilWinning: 160,
      firstPlaceWinningPoints: 100,
      secondPlaceWinningPoints: 50,
      thirdPlaceWinningPoints: 30,
      fourthPlaceWinningPoints: 0,
      respawnPause: 2000,
      mapChangePause: 10000,
      frameRate: 60,
      maxShootVelocityX: 0.01,
      maxShootVelocityY: 0.01,
      ballFriction: 0.6,
      ballRestitution: 0.8
    };


    this.engine = Engine.create();
    this.loop = null;
    this.ballColors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabebe'];
    this.mapVertices = [];
    this.mapWinners = [];
    this.currentMap = [];
    this.bounds = [];
    this.leaderBoard = new LeaderBoard();

    this.hasStarted = false;
    this.requireNextMap = false;
    this.gameOver = false;
    this.mapLoaded = false;
    this.currentRound = 1;

    this.mapFiles = [
        'src/maps/map.json',
        'src/maps/map2.json',
        'src/maps/map3.json',
        'src/maps/map4.json'
    ];

    this.numMaps = this.mapFiles.length;

    this.balls =[];
    this.balls.forEach(ball => World.add(this.engine.world, ball.body));
  }

  getDistinctBallColor() {
    let index = Math.floor(Math.random() * this.ballColors.length);
    let color = this.ballColors[index];
    this.ballColors.splice(index, 1);
    return color;
  }

  checkGameOver(){
    if(this.currentRound >= this.numMaps){
      this.gameOver = true;
    }
  }

  newBall(id) {
    let newBall = new Ball(this.currentMap["spawnPoint"].x, this.currentMap["spawnPoint"].y, 10, this.getDistinctBallColor(), id, { friction: this.config.ballFriction, restitution: this.config.ballRestitution });
    this.balls.push(newBall);
    World.add(this.engine.world, newBall.body);
    this.leaderBoard.addPlayer(id);
  }

  removeBall(id) {
    let deleteIndex = null;
    for(let len = this.balls.length, i = 0; i < len; i++) {
      if(this.balls[i].id === id) {
        World.remove(this.engine.world, this.balls[i].body);
        deleteIndex = i;
      }
    }

    this.ballColors.push(this.balls[deleteIndex].color);

    if(deleteIndex != null) {
      this.balls.splice(deleteIndex, 1);
    }

    this.leaderBoard.removePlayer(id);
    this.removeBallFromMapWinners(id);
  }

  removeBallFromMapWinners(id) {
    let deleteIndex = null;

    for(let len = this.mapWinners.length, i = 0; i < len; i++) {
      if(this.mapWinners[i] === id) {
        deleteIndex = i;
      }
    }

    this.mapWinners.splice(deleteIndex, 1);
  }

  getBounds(){
    let bodyVertices = [];
    this.bounds.forEach(body => {
      for (let k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
        let verticeSet = [];
        let part = body.parts[k];
        part.vertices.forEach(vertex => {
          verticeSet.push({x: vertex.x, y: vertex.y});
        });

        bodyVertices.push(verticeSet)
      }
    });

    return bodyVertices;
  }

  getMap() {
    return this.mapVertices;
  }

  getBallById(id){
    for(let len = this.balls.length, i = 0; i < len; i++) {
      if (this.balls[i].id === id) {
        return this.balls[i];
      }
    }
  }

  getHole(){
    return {
        x: this.currentHole.body.position.x,
        y: this.currentHole.body.position.y,
        vertices: this.currentHole.body.vertices.map(vertex => {
            return {x: vertex.x, y: vertex.y}
        })
    }
  }

  getBoundsPos(){
    return this.bounds.map(bound =>{
      return bound.position
    })
  }

  getBalls(){
    return this.balls.map(ball => {
      return {
        x: ball.body.position.x,
        y: ball.body.position.y,
        radius: ball.radius,
        color: ball.color,
        id: ball.id,
        hasWon: ball.hasWon,
        isOutOfMap: this.isBallOutOfMap(ball),
        name: ball.name,
        isReady: ball.isReady
      }
    })

  }

  getPoints(id) {
    this.mapWinners.push(id);
    let position = this.mapWinners.length;
    switch(position) {
      case 1:
        return this.config.firstPlaceWinningPoints;
      case 2:
        return this.config.secondPlaceWinningPoints;
      case 3:
        return this.config.thirdPlaceWinningPoints;
      case 4:
        return this.config.fourthPlaceWinningPoints;
      default:
        return 0;
    }
  }

  checkBallEvents() {
    this.balls.forEach( ball => {
      if (!ball.hasWon) {
        if (Bounds.overlaps(ball.body.bounds, this.currentHole.body.bounds)) {
          ball.isInHoleCounter = ball.isInHoleCounter + 1;
          if (ball.isInHoleCounter > this.config.maxFramesUntilWinning) {
            console.log('ball ' + ball.id + ' has won');
            ball.isInHoleCounter = 0;
            ball.hasWon = true;
            this.leaderBoard.addPoints(ball.id, this.getPoints(ball.id));
          }
        } else {
          ball.isInholeCounter = 0;
        }
      }

      if(this.isBallOutOfMap(ball)) {
        if(!ball.outOfMapRespawnInitiated) {
          ball.outOfMapRespawnInitiated = true;
          setTimeout(() => {
            this.respawnBall(ball)
          }, this.config.respawnPause)
        }
      }

      if(!this.requireNextMap) {
        if(this.allBallsFinishedMap()) {
          this.checkGameOver();
          if(!this.gameOver) {
            this.mapLoaded = false;
            this.requireNextMap = true;
            setTimeout(() => {
              this.setupNewMap();
            }, this.config.mapChangePause)
          } else {
            this.requireNextMap = false;
          }
        }
      }

    });
  }

  getCurrentRound (){
    return this.currentRound;
  }

  setupNewMap () {
    this.currentRound++;
    clearInterval(this.loop);
    this.loop = null;
    console.log(this.leaderBoard);

    this.bounds.forEach(bound => {
      World.remove(this.engine.world, bound);
    });

    this.bounds = [];

    this.loadMap(this.mapFiles[this.currentRound - 1], () => {

      this.balls.forEach(ball => {
        this.respawnBall(ball);
        ball.hasWon = false;
      });

      this.mapWinners = [];

    });

    this.loop = setInterval(() => {
      Engine.update(this.engine, 1000 / this.config.frameRate);
      this.checkBallEvents();
    }, 1000 / this.config.frameRate);
  }

  allBallsFinishedMap() {
    let allWon = true;

    this.balls.forEach((ball) => {
      allWon = !ball.hasWon ? false : allWon;
    });

    return allWon;
  }

  respawnBall(ball) {
    Body.set(ball.body, {
      position: {
        x: this.currentMap['spawnPoint'].x,
        y: this.currentMap['spawnPoint'].y
      },
      velocity: {
        x: 0,
        y: 0
      }
    });

    ball.outOfMapRespawnInitiated = false;
  }

  isBallOutOfMap(ball) {
    return ball.body.position.y > this.config.mapHeight || ball.body.position.x > this.config.mapWidth || ball.body.position.y < 0 || ball.body.position.x < 0;
  }

  getGameState(){
    return this.gameOver;
  }

  loadMap(map, callBack) {
    this.currentMap = JSON.parse(fs.readFileSync(map));

    this.currentHole = new Hole(this.currentMap["hole"].x, this.currentMap["hole"].y);
    World.add(this.engine.world, this.currentHole);

    this.mapVertices = this.currentMap["shapes"];
    this.mapVertices.forEach(convexShape => {
      this.bounds.push(Bodies.fromVertices(convexShape.position.x, convexShape.position.y, convexShape.vertices, {isStatic: true}));
    });

    this.bounds.forEach(bound => World.add(this.engine.world, bound));
    this.mapLoaded = true;
    callBack();
  }

  getLeaderBoard(){
    return this.leaderBoard.leaderBoard;
  }

  setPlayerReady(name, id) {
    let ball = this.getBallById(id);
    this.leaderBoard.setPlayerName(id, name);
    ball.name = name;
    ball.isReady = true;
  }

  start(){
    this.loadMap(this.mapFiles[0], () => {
      this.loop = setInterval(() => {
        Engine.update(this.engine, 1000 / this.config.frameRate);
        this.checkBallEvents();
      }, 1000 / this.config.frameRate);
    });
  }

  stop () {
    if (this.loop) {
      clearInterval(this.loop);
      this.loop = null;
    }
  }

  isBallInGame(id) {
    return !(typeof this.getBallById(id) === "undefined");
  }

  isBallShootable(ball) {
    if(this.hasStarted && ball.isReady && !this.gameOver) {
      const ballBody = ball.body;
      let velocity = ballBody.velocity;
      const isCollidingWithBound = this.bounds.reduce((isCollidingWithBound, bound) => {

        if (isCollidingWithBound) {
          return true;
        }

        return Bounds.overlaps(ballBody.bounds, bound.bounds);
      }, false);

      return velocity.x <= this.config.maxShootVelocityX && velocity.y <= this.config.maxShootVelocityY && isCollidingWithBound && !ball.hasWon;
    }

    return false;
  }

  shoot (force, playerId) {
      const ball = this.getBallById(playerId);
      if(this.isBallShootable(ball)) {
        Body.applyForce(ball.body, ball.body.position, force);
      }
  }

}


module.exports = Game;
