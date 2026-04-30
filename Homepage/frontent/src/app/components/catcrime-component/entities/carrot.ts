// @ts-nocheck
import {Animator, GameObject} from "./base";

export function Carrot(x, y) {
    GameObject.call(this, x, y, 7, 14);
    Animator.call(this, Carrot.prototype.frame_sets["twirl"], 15);
    this.frame_index = Math.floor(Math.random() * 2);
    this.base_x = x;
    this.base_y = y;
    this.position_x = Math.random() * Math.PI * 2;
    this.position_y = this.position_x * 2;
}
Carrot.prototype = {
    frame_sets: {"twirl": [12, 13]},
    updatePosition: function () {
        this.position_x += 0.1;
        this.position_y += 0.2;
        this.x = this.base_x + Math.cos(this.position_x) * 2;
        this.y = this.base_y + Math.sin(this.position_y);
    }
};
Object.assign(Carrot.prototype, Animator.prototype);
Object.assign(Carrot.prototype, GameObject.prototype);
Carrot.prototype.constructor = Carrot;
