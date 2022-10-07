class Renderer {

    constructor(canvas, mouse, config) {
        this.config = config;
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.background = new Image();
        this.mouse = mouse;
        this.background.src = 'assets/gray.png';
        this.camera = new Camera(this.config['mapWidth'], this.config['mapHeight']);

        this.background.onload = () => {
            this.socket = io.connect('http://localhost:3000/');
            this.session = new Session(this.socket, this);
        };

        new AssetLoader()
            .loadAssets([
                {name: 'flag', url: 'assets/flag.png'}
            ])
            .then(assets => {
                this.assets = assets
            });


        this.trails = [];
        this.Shadow = null;

        this.resize();
        window.onresize = () => {
            this.resize()
        };
    }


    hexToRgb(hex) {
        let bigint = parseInt(hex, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return {r: r, g: g, b: b}
    }

    getSession() {
        return this.session;
    }

    getSocket() {
        return this.socket;
    }

    resize() {
        this.scaleFactor = Math.max(window.innerWidth / this.config['mapWidth'], window.innerHeight / this.config['mapHeight']);
        this.context.canvas.width = window.innerWidth;
        this.context.canvas.height = window.innerHeight;
        //this.context.scale(this.scaleFactor, this.scaleFactor);
        //this.context.scale(this.scaleFactor, this.scaleFactor)
    }

    drawShadow(ball) {
        if(this.clientShadow === null) {
            this.clientShadow = new Shadow(this.session.map, this.mouse, this.config, this.camera);
        }
        
        if(this.session.ballShootAble) {
            let shadowPoints = this.clientShadow.predictBallMovement(ball);
            this.context.save();
            this.context.lineWidth = this.config['shadowLineWidth'];
            this.context.beginPath();
            this.context.moveTo(ball.x + this.camera.x, ball.y + this.camera.y);
            this.context.setLineDash(this.config['shadowLineDash']);

            shadowPoints.forEach((point) => {
                this.context.strokeStyle = `rgba(255, 255, 255, ${point.alpha})`;
                this.context.lineTo(point.x + this.camera.x, point.y + this.camera.y);
                this.context.lineCap = 'round';
                this.context.lineJoin = 'round';
                this.context.stroke();
            });

            this.context.closePath();
            this.context.restore();
        }
    }

    drawTrail(ball) {
        if(this.session.playerId === ball.id) {
            let trailExists = false;

            this.trails.forEach((trail) => {
                if(trail.id === ball.id) {
                    trailExists = true;
                    if(ball.isOutOfMap){
                        trail.trailPoints.pop();
                    } else {
                        trail.addTrailPoint(ball.x, ball.y);
                        this.context.lineWidth = ball.radius * 2;
                        this.context.beginPath();
                        this.context.lineCap = 'round';
                        this.context.lineJoin = 'round';
                        this.context.moveTo(trail.trailPoints[0][0] + this.camera.x, trail.trailPoints[0][1] + this.camera.y);
                        let rgb = this.hexToRgb(ball.color.substr(1));
                        for (let j = 1, len = trail.trailPoints.length; j < len; j++) {
                            this.context.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.config['trailAlpha']/j})`;
                            this.context.lineTo(trail.trailPoints[j][0] + this.camera.x, trail.trailPoints[j][1] + this.camera.y);
                            this.context.stroke();
                        }
                        this.context.closePath();
                    }
                }
            });

            if(!trailExists) {
                this.trails.push(new Trail(ball.id, this.config['maxTrailPoints']));
            }
        }
    }

    drawBall(ball) {
        this.context.lineWidth = ball.radius * 2;
        this.context.beginPath();
        this.context.lineCap = 'round';
        this.context.lineJoin = 'round';
        this.context.stroke();
        this.context.closePath();

        this.context.beginPath();
        this.context.arc(ball.x + this.camera.x, ball.y + this.camera.y, ball.radius, 0, Math.PI * 2);
        this.context.lineWidth = this.config['ballBorderWidth'];
        this.context.fillStyle = ball.color;
        this.context.strokeStyle = this.config['ballBorderColor'];
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
    }

    drawBound(bound) {
        this.context.beginPath();

        this.context.moveTo(bound[0].x + this.camera.x, bound[0].y + this.camera.y);
        for (let j = 1; j < bound.length; j++) {
            this.context.lineTo(bound[j].x + this.camera.x, bound[j].y + this.camera.y);
        }
        this.context.lineTo(bound[0].x + this.camera.x, bound[0].y + this.camera.y);
        this.context.fillStyle = this.config['boundsBackground'];
        this.context.strokeStyle = this.config['boundsBackground'];

        this.context.fill();
        this.context.stroke();
        this.context.closePath();

    }

    drawFlag() {
        this.context.drawImage(this.assets['flag'], 0, 0, 100, 200, this.session.currentHole.x + this.config['flagXCorrection'] + this.camera.x, this.session.currentHole.y + this.config['flagYCorrection'] + this.camera.y, 40, 80);
    }

    clearStage() {
        this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    drawBackground() {
        this.context.drawImage(this.background, 0, 0, window.innerWidth, window.innerHeight);
    }

    cameraAdjust(ball) {
        if(this.session.playerId === ball.id) {
            this.camera.moveCamera((window.innerWidth/2) - ball.x, (window.innerHeight - 200) - ball.y);
            this.camera.update();
        }
    }

    render() {

        this.clearStage();
        this.drawBackground();
        this.drawFlag();

        this.session.bounds.forEach((bound) => {
            this.drawBound(bound);
        });

        this.session.balls.forEach((ball) => {
            this.cameraAdjust(ball);
            if(ball.id == this.session.playerId) {
                this.drawShadow(ball);
            }
            this.drawTrail(ball);
            this.drawBall(ball);
        });


        window.requestAnimationFrame(() => {
            this.render();
        });

    }
}
