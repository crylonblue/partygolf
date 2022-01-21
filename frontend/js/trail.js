class Trail {
    constructor(ballId, maxTrailPoints) {
        this.id = ballId;
        this.trailPoints = [];
        this.maxTrailPoints = maxTrailPoints;
    }

    addTrailPoint(x, y) {
        this.trailPoints.unshift([x, y]) > this.maxTrailPoints ? this.trailPoints.pop() : null;
    }
}
