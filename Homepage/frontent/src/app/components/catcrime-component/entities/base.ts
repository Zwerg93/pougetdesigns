// @ts-nocheck
export function Animator(frame_set, delay, mode = "loop") {
    this.count = 0;
    this.delay = (delay >= 1) ? delay : 1;
    this.frame_set = frame_set;
    this.frame_index = 0;
    this.frame_value = frame_set[0];
    this.mode = mode;
}
Animator.prototype = {
    constructor: Animator,
    animate: function () {
        switch (this.mode) {
            case "loop":
                this.loop();
                break;
            case "pause":
                break;
        }
    },
    changeFrameSet(frame_set, mode, delay = 10, frame_index = 0) {
        if (this.frame_set === frame_set) {
            return;
        }
        this.count = 0;
        this.delay = delay;
        this.frame_set = frame_set;
        this.frame_index = frame_index;
        this.frame_value = frame_set[frame_index];
        this.mode = mode;
    },
    loop: function () {
        this.count++;
        while (this.count > this.delay) {
            this.count -= this.delay;
            this.frame_index = (this.frame_index < this.frame_set.length - 1) ? this.frame_index + 1 : 0;
            this.frame_value = this.frame_set[this.frame_index];
        }
    }
};

export function Frame(x, y, width, height, offset_x = 0, offset_y = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.offset_x = offset_x;
    this.offset_y = offset_y;
}
Frame.prototype = {constructor: Frame};

export function GameObject(x, y, width, height) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
}
GameObject.prototype = {
    constructor: GameObject,
    collideObject: function (object) {
        if (this.getRight() < object.getLeft() ||
            this.getBottom() < object.getTop() ||
            this.getLeft() > object.getRight() ||
            this.getTop() > object.getBottom()) return false;
        return true;
    },
    collideObjectCenter: function (object) {
        let center_x = object.getCenterX();
        let center_y = object.getCenterY();
        if (center_x < this.getLeft() || center_x > this.getRight() ||
            center_y < this.getTop() || center_y > this.getBottom()) return false;
        return true;
    },
    getBottom: function () { return this.y + this.height; },
    getCenterX: function () { return this.x + this.width * 0.5; },
    getCenterY: function () { return this.y + this.height * 0.5; },
    getLeft: function () { return this.x; },
    getRight: function () { return this.x + this.width; },
    getTop: function () { return this.y; },
    setBottom: function (y) { this.y = y - this.height; },
    setCenterX: function (x) { this.x = x - this.width * 0.5; },
    setCenterY: function (y) { this.y = y - this.height * 0.5; },
    setLeft: function (x) { this.x = x; },
    setRight: function (x) { this.x = x - this.width; },
    setTop: function (y) { this.y = y; }
};

export function MovingObject(x, y, width, height, velocity_max = 15) {
    GameObject.call(this, x, y, width, height);
    this.jumping = false;
    this.velocity_max = velocity_max;
    this.velocity_x = 0;
    this.velocity_y = 0;
    this.x_old = x;
    this.y_old = y;
}
MovingObject.prototype = {
    getOldBottom: function () { return this.y_old + this.height; },
    getOldCenterX: function () { return this.x_old + this.width * 0.5; },
    getOldCenterY: function () { return this.y_old + this.height * 0.5; },
    getOldLeft: function () { return this.x_old; },
    getOldRight: function () { return this.x_old + this.width; },
    getOldTop: function () { return this.y_old; },
    setOldBottom: function (y) { this.y_old = y - this.height; },
    setOldCenterX: function (x) { this.x_old = x - this.width * 0.5; },
    setOldCenterY: function (y) { this.y_old = y - this.height * 0.5; },
    setOldLeft: function (x) { this.x_old = x; },
    setOldRight: function (x) { this.x_old = x - this.width; },
    setOldTop: function (y) { this.y_old = y; }
};
Object.assign(MovingObject.prototype, GameObject.prototype);
MovingObject.prototype.constructor = MovingObject;
