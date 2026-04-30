import {Collider} from "./collision/collider";
import {LevelDoorPosition, Point} from "./generation/wfc-types";

type DoorPositions = {
    left: LevelDoorPosition | null;
    right: LevelDoorPosition | null;
} | null;

type WorldDependencies = {
    collider: Collider;
    tile_set: any;
    player: any;
    socket: WebSocket | null;
    friction?: number;
    gravity?: number;
};

export class World {
    collider: Collider;
    friction: number;
    gravity: number;
    columns: number;
    rows: number;
    tile_set: any;
    player: any;
    zone_id: string;
    carrots: any[];
    carrot_count: number;
    doors: any[];
    door: any;
    height: number;
    width: number;
    socket: WebSocket | null;
    graphical_map: number[];
    collision_map: number[];
    doorPositions: DoorPositions;
    grass: any[];
    
    // Hinzugefügt für das Debugging
    debug_path_forward?: Point[];
    debug_path_backward?: Point[];

    constructor(dependencies: WorldDependencies) {
        this.collider = dependencies.collider;
        this.friction = dependencies.friction ?? 0.85;
        this.gravity = dependencies.gravity ?? 1.5;
        this.columns = 20;
        this.rows = 9;
        this.tile_set = dependencies.tile_set;
        this.player = dependencies.player;
        this.zone_id = "00";
        this.carrots = [];
        this.carrot_count = 0;
        this.doors = [];
        this.door = undefined;
        this.height = this.tile_set.tile_size * this.rows;
        this.width = this.tile_set.tile_size * this.columns;
        this.socket = dependencies.socket;
        this.graphical_map = [];
        this.collision_map = [];
        this.doorPositions = null;
        this.grass = [];
    }

    collideObject(object: any) {
        var bottom, left, right, top, value;

        top = Math.floor(object.getTop() / this.tile_set.tile_size);
        left = Math.floor(object.getLeft() / this.tile_set.tile_size);
        value = this.collision_map[top * this.columns + left];
        this.collider.collide(value, object, left * this.tile_set.tile_size, top * this.tile_set.tile_size, this.tile_set.tile_size);

        top = Math.floor(object.getTop() / this.tile_set.tile_size);
        right = Math.floor(object.getRight() / this.tile_set.tile_size);
        value = this.collision_map[top * this.columns + right];
        this.collider.collide(value, object, right * this.tile_set.tile_size, top * this.tile_set.tile_size, this.tile_set.tile_size);

        bottom = Math.floor(object.getBottom() / this.tile_set.tile_size);
        left = Math.floor(object.getLeft() / this.tile_set.tile_size);
        value = this.collision_map[bottom * this.columns + left];
        this.collider.collide(value, object, left * this.tile_set.tile_size, bottom * this.tile_set.tile_size, this.tile_set.tile_size);

        bottom = Math.floor(object.getBottom() / this.tile_set.tile_size);
        right = Math.floor(object.getRight() / this.tile_set.tile_size);
        value = this.collision_map[bottom * this.columns + right];
        this.collider.collide(value, object, right * this.tile_set.tile_size, bottom * this.tile_set.tile_size, this.tile_set.tile_size);
    }

    setup() {
        this.carrots = new Array();
        this.doors = new Array();
        this.grass = new Array();

        if (this.door) {
            if (this.door.destination_x != -1) {
                this.player.setCenterX(this.door.destination_x);
                this.player.setOldCenterX(this.door.destination_x);
            }

            if (this.door.destination_y != -1) {
                this.player.setCenterY(this.door.destination_y);
                this.player.setOldCenterY(this.door.destination_y);
            }

            this.door = undefined;
        }
    }

    update() {
        this.player.updatePosition(this.gravity, this.friction);
        this.collideObject(this.player);

        if (this.socket && this.socket.readyState === WebSocket.OPEN && (Math.floor(this.player.x_old) !== Math.floor(this.player.x) || this.player.y_old !== this.player.y)) {
            const positionData = {
                type: "position",
                x: this.player.x,
                y: this.player.y
            };
            this.socket.send(JSON.stringify(positionData));
        }

        for (let index = this.carrots.length - 1; index > -1; --index) {
            let carrot = this.carrots[index];
            carrot.updatePosition();
            carrot.animate();

            if (carrot.collideObject(this.player)) {
                this.carrots.splice(this.carrots.indexOf(carrot), 1);
                this.carrot_count++;
            }
        }

        for (let index = this.doors.length - 1; index > -1; --index) {
            let door = this.doors[index];
            if (door.collideObjectCenter(this.player)) {
                this.door = door;
            }
        }

        for (let index = this.grass.length - 1; index > -1; --index) {
            let grass = this.grass[index];
            grass.animate();
        }

        this.player.updateAnimation();
    }
}