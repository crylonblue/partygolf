class Camera {

	constructor(playGroundWidth, playGroundHeight) {
		this.x = 0;
		this.y = 0;
		this.toX = 0;
		this.toY = 0;
		this.playGroundWidth = playGroundWidth;
		this.playGroundHeight = playGroundHeight;
	}

	moveCamera(x, y) {
		this.toX = x;
		this.toY = y;
	}

	update() {
		this.x -= (this.x - this.toX) / 20;
		this.y -= (this.y - this.toY) / 20;
	}
}