// @ts-nocheck
import {Animator, MovingObject} from "./base";

export function Player(x, y, socket) {
    MovingObject.call(this, x, y, 16, 16);
    Animator.call(this, Player.prototype.frame_sets["idle-left"], 10);
    this.jumping = true;
    this.direction_x = -1;
    this.velocity_x = 0;
    this.velocity_y = 0;
    this.socket = socket;
}
Player.prototype = {
    frame_sets: {
        "idle-left": [0, 1, 2, 3, 4, 5, 6, 7],
        "jump-left": [8, 9, 10, 11],
        "move-left": [12, 13, 14, 15, 16, 17, 18, 19],
        "idle-right": [20, 21, 22, 23, 24, 25, 26, 27],
        "jump-right": [28, 29, 30, 31],
        "move-right": [32, 33, 34, 35, 36, 37, 38, 39]
    },
    jump: function () {
        if (!this.jumping && this.velocity_y < 10) {
            this.jumping = true;
            this.velocity_y -= 13;
        }
    },
    moveLeft: function () {
        this.direction_x = -1;
        this.velocity_x -= 0.55;
    },
    moveRight: function () {
        this.direction_x = 1;
        this.velocity_x += 0.55;
    },
    updateAnimation: function () {
        const idleVelocityThreshold = .5;
        if (this.velocity_y < 0) {
            if (this.direction_x < 0) this.changeFrameSet(this.frame_sets["jump-left"], "pause");
            else this.changeFrameSet(this.frame_sets["jump-right"], "pause");
        } else if (this.direction_x < 0) {
            if (Math.abs(this.velocity_x) > idleVelocityThreshold) {
                this.changeFrameSet(this.frame_sets["move-left"], "loop", 5);
            } else {
                this.changeFrameSet(this.frame_sets["idle-left"], "loop");
            }
        } else if (this.direction_x > 0) {
            if (Math.abs(this.velocity_x) > idleVelocityThreshold) {
                this.changeFrameSet(this.frame_sets["move-right"], "loop", 5);
            } else {
                this.changeFrameSet(this.frame_sets["idle-right"], "loop");
            }
        } else {
            if (Math.abs(this.velocity_x) > idleVelocityThreshold) {
                if (this.direction_x < 0) this.changeFrameSet(this.frame_sets["move-left"], "loop", 5);
                else this.changeFrameSet(this.frame_sets["move-right"], "loop", 5);
            } else {
                if (this.direction_x < 0) this.changeFrameSet(this.frame_sets["idle-left"], "loop");
                else this.changeFrameSet(this.frame_sets["idle-right"], "loop");
            }
        }
        this.animate();
    },
    updatePosition: function (gravity, friction) {
        this.x_old = this.x;
        this.y_old = this.y;
        this.velocity_y += gravity;
        this.velocity_x *= friction;
        if (Math.abs(this.velocity_x) > this.velocity_max) this.velocity_x = this.velocity_max * Math.sign(this.velocity_x);
        if (Math.abs(this.velocity_y) > this.velocity_max) this.velocity_y = this.velocity_max * Math.sign(this.velocity_y);
        this.x += this.velocity_x;
        this.y += this.velocity_y;
    }
};
Object.assign(Player.prototype, MovingObject.prototype);
Object.assign(Player.prototype, Animator.prototype);
Player.prototype.constructor = Player;
