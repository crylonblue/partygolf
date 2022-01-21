class Mouse {
    constructor(canvas) {
        this.mouseX = 0;
        this.mouseY = 0;
        this.canvas = canvas;
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;
        });
    }

    onClick(clickFunction) {
        this.canvas.addEventListener('click', (event) => {
            clickFunction(event);
        })
    }
}
