class Client {
  constructor(config) {
    console.log(config);
    this.playGround = document.getElementById('playground');
    this.mouse = new Mouse(this.playGround);
    this.renderer = new Renderer(this.playGround, this.mouse, config);
    this.playButton = document.getElementById("startButton");

    this.mouse.onClick((event) => {
      let ball = this.renderer.session.getClientBall();
      let cameraCorrectionX = this.renderer.camera.x;
      let cameraCorrectionY = this.renderer.camera.y;
      let degreeX = (ball.x - (event.offsetX - cameraCorrectionX)) / window.innerWidth;
      let degreeY = (ball.y - (event.offsetY - cameraCorrectionY)) / window.innerHeight;

      const force = {
        x: config['forceFactorX'] * -degreeX,
        y: config['forceFactorY'] * -degreeY
      };

      this.renderer.getSocket().emit('shoot', {
        force: force
      });

    });

  }
}

fetch('config.json').then(response => response.json()).then((config) => {
  new Client(config)
}).catch(err => {
  throw err
});
