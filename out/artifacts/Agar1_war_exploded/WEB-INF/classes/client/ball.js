class Ball {

    constructor (x,y,r){
        this.pos = createVector(x, y);
        this.r = r;
        this.vel = createVector(0, 0);
    };

    update = function() {
        var newVel = createVector(mouseX - width / 2, mouseY - height / 2);
        newVel.div(10);
        newVel.limit(3);
        this.vel.lerp(newVel, 0.2);
        this.pos.add(this.vel);
    };

    eats = function(other) {
        let d = p5.Vector.dist(this.pos, other.pos);
        if (d < this.r + other.r) {
            var sum = PI * this.r * this.r + PI * other.r * other.r;
            this.r = sqrt(sum / PI);
            return true;
        } else {
            return false;
        }
    };

    show = function() {
        fill(255);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    };

    constrain = function() {
        ballPlayer.pos.x = constrain(ballPlayer.pos.x, MIN_WIDTH , MAX_WIDTH);
        ballPlayer.pos.y = constrain(ballPlayer.pos.y, MIN_HEIGHT, MAX_HEIGHT );
    };

}