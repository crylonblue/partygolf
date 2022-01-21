class LeaderBoard {

    constructor() {
        this.leaderBoard = [];
    }

    addPlayer(playerId) {
        this.leaderBoard.push({
            playerId: playerId,
            points: 0,
            name: null
        })
    }

    setPlayerName(playerId, name) {
        this.leaderBoard.forEach(player => {
            player.name = player.playerId === playerId ? name : player.name;
        });
    }

    addPoints(playerId, points) {
        this.leaderBoard.forEach(player => {
            player.points += player.playerId === playerId ? points : 0;
        })
    }

    removePlayer(playerId) {
        let deleteIndex = null;

        this.leaderBoard.forEach((player, index) => {
            deleteIndex = player.playerId === playerId ? index : deleteIndex;
        });

        this.leaderBoard.splice(deleteIndex, 1);
    }

    getLeaderBoard() {
        return this.leaderBoard;
    }

}

module.exports = LeaderBoard;
