class Lobby {

    constructor(session) {
        this.session = session;
        this.startScreen = document.getElementById('startScreen');
        this.leaderBoard = document.getElementById('leaderBoard');
        this.roundElement = document.getElementById('rounds');
        this.playerRankings = document.getElementById('playerRankings');
        this.playButton = document.getElementById('startButton');
        this.nameInput = document.getElementById('playerName');
        this.nameFailure = document.getElementById('nameFailure');
        this.lobbyStatusElement = document.getElementById('status');

        this.playButton.addEventListener('click', () => {
            let name = this.nameInput.value;
            if(name === "") {
                this.nameFailure.style.display = 'block';
            } else {
                this.nameFailure.style.display = 'none';
                this.playerIsReady(this.nameInput.value);
                this.playButton.style.display = 'none';
                this.nameInput.style.display = 'none';
                this.lobbyStatusElement.style.display = 'block';
                this.lobbyStatusElement.innerHTML = 'waiting for other players ...';
            }
        });
    }

    playerIsReady(name) {
        this.session.setBallReady(name)
    }

    showLeaderBoard() {
        this.leaderBoard.style.visibility = 'visible';
    }

    hideLeaderBoard() {
        this.leaderBoard.style.visibility = 'hidden';
    }

    update() {

        if (this.session.gameStarted && this.session.getClientBall().isReady) {
            this.startScreen.style.display = 'none';
        }


        this.roundElement.innerHTML = `Round ${this.session.currentRound} of 4`;
        let rankings = this.session.leaderBoard;
        var rankingHTML = '';

        rankings.sort((a, b) => {
            return b.points - a.points;
        });

        for(let i = 0, len = rankings.length; i < len; i++) {
            let color = this.session.getBallById(rankings[i].playerId).color;
            let name = rankings[i].name;
            let points = rankings[i].points;
            rankingHTML += `<div style="color: ${color}" class="rankedPlayer">${name} ${points}</div>`
        }

        if(this.session.gameOver){
            this.leaderBoard.style.visibility = 'visible';
        }

        this.playerRankings.innerHTML = rankingHTML;

    }

}
