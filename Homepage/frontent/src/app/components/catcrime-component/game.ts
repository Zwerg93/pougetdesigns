// @ts-nocheck
// game.ts
import {Animator, Frame, GameObject, MovingObject} from "./entities/base";
import {Carrot} from "./entities/carrot";
import {Door} from "./entities/door";
import {Grass} from "./entities/grass";
import {Player} from "./entities/player";
import {TileSet} from "./entities/tile-set";
import {Collider} from "./collision/collider";
import {World} from "./world";

const Game = function (socket) {
    const tile_set = new Game.TileSet(8, 20);
    const player = new Game.Player(32, 76, socket);
    this.world = new World({
        collider: new Collider(),
        tile_set,
        player,
        socket,
    });

    this.update = function () {
        this.world.update();
    };
};
Game.prototype = {constructor: Game};

Game.Animator = Animator;
Game.Frame = Frame;
Game.Object = GameObject;
Game.MovingObject = MovingObject;
Game.Carrot = Carrot;
Game.Grass = Grass;
Game.Door = Door;
Game.Player = Player;
Game.TileSet = TileSet;

export default Game;
