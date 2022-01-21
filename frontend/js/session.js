class Session{

    constructor (socket, renderer){
        this.socket = socket;
        this.renderer = renderer;
        this.leaderBoard = null;
        this.lobby = new Lobby(this);

        this.socket.on('new-game', data => {
            this.start(data);
            console.log('new-game');
        });

        this.socket.on('update', status => {
            this.stateChange(status)
        });

        this.socket.on('new-map', mapData => {
            this.lobby.hideLeaderBoard();
            this.setupNewMap(mapData);
        });

        this.socket.on('require-next-map', data => {
            this.leaderBoard = data.leaderBoard;
            this.lobby.showLeaderBoard();
        });

        this.socket.on('game-over', () => {

        });
    }

    setBallReady (name) {
        this.socket.emit('player-ready',  {
            name: name
        })
    }

    start (data) {
        this.gameStarted = data.gameStarted;
        this.balls = data.balls;
        this.bounds = data.bounds;
        this.boundsPos = data.boundsPos;
        this.currentHole = data.currentHole;
        this.playerId = data.playerId;
        this.gameOver = data.gameOver;
        this.map = data.map;
        this.gameStarted = data.gameStarted;
        this.clientBall = this.getClientBall();
        this.renderer.clientShadow = null;
        this.leaderBoard = data.leaderBoard;
        this.renderer.trails = [];
        this.currentRound = data.rounds;
        console.log(this.playerId);
        this.renderer.render();
    }

    setupNewMap(mapData) {
        console.log(mapData.map);
        this.bounds = mapData.bounds;
        this.map = mapData.map;
        this.currentHole = mapData.currentHole;
        this.renderer.clientShadow = null;
        this.renderer.trails = [];
        console.log('got new map');
    }

    getClientBall () {
        for (let len = this.balls.length, i = 0; i < len; i++) {
            if (this.balls[i].id === this.playerId) {
                return this.balls[i];
            }
        }
    }

    getBallById (id) {
        for (let len = this.balls.length, i = 0; i < len; i++) {
            if (this.balls[i].id === id) {
                return this.balls[i];
            }
        }
    }

    stateChange (state) {
        this.balls = state.balls;
        this.gameStarted = state.gameStarted;
        this.currentRound = state.currentRound;
        this.ballShootAble = state.ballShootAble;
        this.lobby.update();
        let ball = this.getClientBall();
    }
}
