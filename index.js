const socketio = require('socket.io');
const Game = require('./src/Game');
const express = require('express');
const path = require('path');


let webApp = express();

webApp.use(express.static(path.join(__dirname, 'frontend')));

webApp.listen(5002, () => {
  console.log('webapp started');
})



let app = express();
let websocketServer = require('http').Server(app);

const serverUpdatesPerSeconds = 50;
let connections = [];

websocketServer.listen(3000, err => {

  if (err) {
    console.error(err)
  }

  const game = new Game(this);
  game.start();
  const io = socketio(websocketServer);

  io.on('connection', socket => {
    console.log(socket.id);
    game.newBall(socket.id);

    connections.push(socket);

    socket.emit('new-game', {
      bounds: game.getBounds(),
      boundsPos: game.getBoundsPos(),
      balls: game.getBalls(),
      currentHole: game.getHole(),
      gameOver: game.getGameState(),
      playerId: socket.id,
      map: game.getMap(),
      leaderBoard: game.getLeaderBoard(),
      gameStarted: game.hasStarted
    });

    socket.on('player-ready', data => {
      if(connections.length >= 1) {
        game.hasStarted = true;
      }

      game.setPlayerReady(data.name, socket.id);

    });

    console.log('Connected: %s sockets', connections.length);

    // disconnect
    socket.on('disconnect', () => {
      let index = connections.indexOf(socket);
      connections.splice(index, 1);
      console.log('Disconnected: %s sockets', connections.length);
      game.removeBall(socket.id);
    });

    socket.on('shoot', data => {
      game.shoot(data.force, socket.id);
    });

    setInterval(() => {
      if(game.isBallInGame(socket.id)) {
        socket.emit('update', {
          balls: game.getBalls(),
          ballShootAble: game.isBallShootable(game.getBallById(socket.id)),
          mapLoaded: game.mapLoaded,
          gameStarted: game.hasStarted,
        });
      }

      if(game.requireNextMap) {
        socket.emit('require-next-map', {
          leaderBoard: game.getLeaderBoard()
        });
      }

      if(game.gameOver) {
        socket.emit('game-over');
      }

      if(game.mapLoaded && game.requireNextMap) {
        connections.forEach(socket => {
          socket.emit('new-map', {
            bounds: game.getBounds(),
            boundsPos: game.getBoundsPos(),
            map: game.getMap(),
            balls: game.getBalls(),
            currentHole: game.getHole(),
            leaderBoard: game.getLeaderBoard(),
            rounds: game.getCurrentRound()
          });
        });
        game.requireNextMap = false;
      }


    }, 1000/serverUpdatesPerSeconds);

  });

  console.log("Server running...");
});
