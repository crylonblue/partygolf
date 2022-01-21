const { Bodies } = require('matter-js');

class Hole {

    constructor(x, y, options){

        let defaultOptions = {
            isStatic: true,
            isSensor: true
        };

        this.x = x;
        this.y = y;
        this.options = (typeof options === 'undefined')? defaultOptions : options;
        this.body = Bodies.rectangle(this.x, this.y, 50,50, this.options);

    }

}

module.exports = Hole;