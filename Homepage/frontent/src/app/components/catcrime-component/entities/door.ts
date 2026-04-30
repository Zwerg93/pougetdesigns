// @ts-nocheck
import {GameObject} from "./base";

export function Door(door) {
    GameObject.call(this, door.x, door.y, door.width, door.height);
    this.destination_x = door.destination_x;
    this.destination_y = door.destination_y;
    this.destination_zone = door.destination_zone;
}
Door.prototype = {};
Object.assign(Door.prototype, GameObject.prototype);
Door.prototype.constructor = Door;
