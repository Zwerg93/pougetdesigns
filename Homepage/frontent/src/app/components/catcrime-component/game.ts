// game.ts
const Game = function (socket) { // Socket im Game Konstruktor entgegennehmen
    this.world = new Game.World(undefined, undefined, socket); // Socket an World weitergeben

    this.update = function () {
        this.world.update();
    };
};
Game.prototype = {constructor: Game};

// Made the default animation type "loop":
Game.Animator = function (frame_set, delay, mode = "loop") {

    this.count = 0;
    this.delay = (delay >= 1) ? delay : 1;
    this.frame_set = frame_set;
    this.frame_index = 0;
    this.frame_value = frame_set[0];
    this.mode = mode;

};
Game.Animator.prototype = {

    constructor: Game.Animator,

    animate: function () {

        switch (this.mode) {

            case "loop" :
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

Game.Collider = function () {

    /* I changed this so all the checks happen in y first order. */
    this.collide = function (value, object, tile_x, tile_y, tile_size) {

        switch (value) {

            case  1:
                this.collidePlatformTop(object, tile_y);
                break;
            case  2:
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case  3:
                if (this.collidePlatformTop(object, tile_y)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case  4:
                this.collidePlatformBottom(object, tile_y + tile_size);
                break;
            case  5:
                if (this.collidePlatformTop(object, tile_y)) return;
                this.collidePlatformBottom(object, tile_y + tile_size);
                break;
            case  6:
                if (this.collidePlatformRight(object, tile_x + tile_size)) return;
                this.collidePlatformBottom(object, tile_y + tile_size);
                break;
            case  7:
                if (this.collidePlatformTop(object, tile_y)) return;
                if (this.collidePlatformBottom(object, tile_y + tile_size)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case  8:
                this.collidePlatformLeft(object, tile_x);
                break;
            case  9:
                if (this.collidePlatformTop(object, tile_y)) return;
                this.collidePlatformLeft(object, tile_x);
                break;
            case 10:
                if (this.collidePlatformLeft(object, tile_x)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case 11:
                if (this.collidePlatformTop(object, tile_y)) return;
                if (this.collidePlatformLeft(object, tile_x)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case 12:
                if (this.collidePlatformBottom(object, tile_y + tile_size)) return;
                this.collidePlatformLeft(object, tile_x);
                break;
            case 13:
                if (this.collidePlatformTop(object, tile_y)) return;
                if (this.collidePlatformBottom(object, tile_y + tile_size)) return;
                this.collidePlatformLeft(object, tile_x);
                break;
            case 14:
                if (this.collidePlatformBottom(object, tile_y + tile_size)) return;
                if (this.collidePlatformLeft(object, tile_x)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case 15:
                if (this.collidePlatformTop(object, tile_y)) return;
                if (this.collidePlatformBottom(object, tile_y + tile_size)) return;
                if (this.collidePlatformLeft(object, tile_x)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;

        }

    }

};
Game.Collider.prototype = {

    constructor: Game.Collider,

    collidePlatformBottom: function (object, tile_bottom) {

        if (object.getTop() < tile_bottom && object.getOldTop() >= tile_bottom) {

            object.setTop(tile_bottom);
            object.velocity_y = 0;
            return true;

        }
        return false;

    },

    collidePlatformLeft: function (object, tile_left) {

        if (object.getRight() > tile_left && object.getOldRight() <= tile_left) {

            object.setRight(tile_left - 0.01);
            object.velocity_x = 0;
            return true;

        }
        return false;

    },

    collidePlatformRight: function (object, tile_right) {

        if (object.getLeft() < tile_right && object.getOldLeft() >= tile_right) {

            object.setLeft(tile_right);
            object.velocity_x = 0;
            return true;

        }
        return false;

    },

    collidePlatformTop: function (object, tile_top) {

        if (object.getBottom() > tile_top && object.getOldBottom() <= tile_top) {

            object.setBottom(tile_top - 0.01);
            object.velocity_y = 0;
            object.jumping = false;
            return true;

        }
        return false;

    }

};

// Added default values of 0 for offset_x and offset_y
Game.Frame = function (x, y, width, height, offset_x = 0, offset_y = 0) {

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.offset_x = offset_x;
    this.offset_y = offset_y;

};
Game.Frame.prototype = {constructor: Game.Frame};

Game.Object = function (x, y, width, height) {

    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;

};
Game.Object.prototype = {

    constructor: Game.Object,

    /* Now does rectangular collision detection. */
    collideObject: function (object) {

        if (this.getRight() < object.getLeft() ||
            this.getBottom() < object.getTop() ||
            this.getLeft() > object.getRight() ||
            this.getTop() > object.getBottom()) return false;

        return true;

    },

    /* Does rectangular collision detection with the center of the object. */
    collideObjectCenter: function (object) {

        let center_x = object.getCenterX();
        let center_y = object.getCenterY();

        if (center_x < this.getLeft() || center_x > this.getRight() ||
            center_y < this.getTop() || center_y > this.getBottom()) return false;

        return true;

    },

    getBottom: function () {
        return this.y + this.height;
    },
    getCenterX: function () {
        return this.x + this.width * 0.5;
    },
    getCenterY: function () {
        return this.y + this.height * 0.5;
    },
    getLeft: function () {
        return this.x;
    },
    getRight: function () {
        return this.x + this.width;
    },
    getTop: function () {
        return this.y;
    },
    setBottom: function (y) {
        this.y = y - this.height;
    },
    setCenterX: function (x) {
        this.x = x - this.width * 0.5;
    },
    setCenterY: function (y) {
        this.y = y - this.height * 0.5;
    },
    setLeft: function (x) {
        this.x = x;
    },
    setRight: function (x) {
        this.x = x - this.width;
    },
    setTop: function (y) {
        this.y = y;
    }

};

Game.MovingObject = function (x, y, width, height, velocity_max = 15) {

    Game.Object.call(this, x, y, width, height);

    this.jumping = false;
    this.velocity_max = velocity_max;// added velocity_max so velocity can't go past 16
    this.velocity_x = 0;
    this.velocity_y = 0;
    this.x_old = x;
    this.y_old = y;

};
/* I added setCenterX, setCenterY, getCenterX, and getCenterY */
Game.MovingObject.prototype = {

    getOldBottom: function () {
        return this.y_old + this.height;
    },
    getOldCenterX: function () {
        return this.x_old + this.width * 0.5;
    },
    getOldCenterY: function () {
        return this.y_old + this.height * 0.5;
    },
    getOldLeft: function () {
        return this.x_old;
    },
    getOldRight: function () {
        return this.x_old + this.width;
    },
    getOldTop: function () {
        return this.y_old;
    },
    setOldBottom: function (y) {
        this.y_old = y - this.height;
    },
    setOldCenterX: function (x) {
        this.x_old = x - this.width * 0.5;
    },
    setOldCenterY: function (y) {
        this.y_old = y - this.height * 0.5;
    },
    setOldLeft: function (x) {
        this.x_old = x;
    },
    setOldRight: function (x) {
        this.x_old = x - this.width;
    },
    setOldTop: function (y) {
        this.y_old = y;
    }

};
Object.assign(Game.MovingObject.prototype, Game.Object.prototype);
Game.MovingObject.prototype.constructor = Game.MovingObject;

/* The carrot class extends Game.Object and Game.Animation. */
Game.Carrot = function (x, y) {

    Game.Object.call(this, x, y, 7, 14);
    Game.Animator.call(this, Game.Carrot.prototype.frame_sets["twirl"], 15);

    this.frame_index = Math.floor(Math.random() * 2);

    /* base_x and base_y are the point around which the carrot revolves. position_x
    and y are used to track the vector facing away from the base point to give the carrot
    the floating effect. */
    this.base_x = x;
    this.base_y = y;
    this.position_x = Math.random() * Math.PI * 2;
    this.position_y = this.position_x * 2;

};
Game.Carrot.prototype = {

    frame_sets: {"twirl": [12, 13]},

    updatePosition: function () {

        this.position_x += 0.1;
        this.position_y += 0.2;

        this.x = this.base_x + Math.cos(this.position_x) * 2;
        this.y = this.base_y + Math.sin(this.position_y);

    }

};
Object.assign(Game.Carrot.prototype, Game.Animator.prototype);
Object.assign(Game.Carrot.prototype, Game.Object.prototype);
Game.Carrot.prototype.constructor = Game.Carrot;

Game.Grass = function (x, y) {

    Game.Animator.call(this, Game.Grass.prototype.frame_sets["wave"], 25);

    this.x = x;
    this.y = y;

};
Game.Grass.prototype = {

    frame_sets: {

        "wave": [14, 15, 16, 15]

    }

};
Object.assign(Game.Grass.prototype, Game.Animator.prototype);

Game.Door = function (door) {

    Game.Object.call(this, door.x, door.y, door.width, door.height);

    this.destination_x = door.destination_x;
    this.destination_y = door.destination_y;
    this.destination_zone = door.destination_zone;

};
Game.Door.prototype = {};
Object.assign(Game.Door.prototype, Game.Object.prototype);
Game.Door.prototype.constructor = Game.Door;

Game.Player = function (x, y, socket) { // Socket im Player Konstruktor entgegennehmen

    Game.MovingObject.call(this, x, y, 16, 16);
    Game.Animator.call(this, Game.Player.prototype.frame_sets["idle-left"], 10);

    this.jumping = true;
    this.direction_x = -1;
    this.velocity_x = 0;
    this.velocity_y = 0;
    this.socket = socket; // Socket im Player Objekt speichern!

};

Game.Player.prototype = {

    frame_sets: {
        "idle-left": [0, 1, 2, 3, 4, 5, 6, 7],
        "jump-left": [8, 9, 10, 11],
        "move-left": [12, 13, 14, 15, 16, 17, 18, 19],
        "idle-right": [20, 21, 22, 23, 24, 25, 26, 27],
        "jump-right": [28, 29, 30, 31],
        "move-right": [32, 33, 34, 35, 36, 37, 38, 39]

    },

    jump: function () {

        /* Made it so you can only jump if you aren't falling faster than 10px per frame. */
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

        const idleVelocityThreshold = .5; // Definiere einen Schwellenwert für "Idle"-Geschwindigkeit

        if (this.velocity_y < 0) {
            if (this.direction_x < 0) this.changeFrameSet(this.frame_sets["jump-left"], "pause");
            else this.changeFrameSet(this.frame_sets["jump-right"], "pause");

        } else if (this.direction_x < 0) {
            if (Math.abs(this.velocity_x) > idleVelocityThreshold) { // Absoluter Betrag und Schwellenwert
                this.changeFrameSet(this.frame_sets["move-left"], "loop", 5);
            } else {
                this.changeFrameSet(this.frame_sets["idle-left"], "loop"); // **Wichtig: Zu "loop" ändern!**
            }

        } else if (this.direction_x > 0) {
            if (Math.abs(this.velocity_x) > idleVelocityThreshold) { // Absoluter Betrag und Schwellenwert
                this.changeFrameSet(this.frame_sets["move-right"], "loop", 5);
            } else {
                this.changeFrameSet(this.frame_sets["idle-right"], "loop"); // **Wichtig: Zu "loop" ändern!**
            }
        } else { // Fallback für direction_x = 0 (optional, falls direction_x nicht immer -1 oder 1 ist)
            if (Math.abs(this.velocity_x) > idleVelocityThreshold) {
                if (this.direction_x < 0) this.changeFrameSet(this.frame_sets["move-left"], "loop", 5); // Fallback zu links/rechts je nach Richtung
                else this.changeFrameSet(this.frame_sets["move-right"], "loop", 5);
            } else {
                if (this.direction_x < 0) this.changeFrameSet(this.frame_sets["idle-left"], "loop"); // Default zu links-idle wenn keine Richtung
                else this.changeFrameSet(this.frame_sets["idle-right"], "loop");
            }
        }

        this.animate();
    },

    updatePosition: function (gravity, friction) {
        // Use x and y for sending location to sockets

        this.x_old = this.x;
        this.y_old = this.y;


        this.velocity_y += gravity;
        this.velocity_x *= friction;

        /* Made it so that velocity cannot exceed velocity_max */
        if (Math.abs(this.velocity_x) > this.velocity_max)
            this.velocity_x = this.velocity_max * Math.sign(this.velocity_x);

        if (Math.abs(this.velocity_y) > this.velocity_max)
            this.velocity_y = this.velocity_max * Math.sign(this.velocity_y);

        this.x += this.velocity_x;
        this.y += this.velocity_y;


    }
};
Object.assign(Game.Player.prototype, Game.MovingObject.prototype);
Object.assign(Game.Player.prototype, Game.Animator.prototype);
Game.Player.prototype.constructor = Game.Player;


Game.TileSet = function (columns, tile_size) {

    this.columns = columns;
    this.tile_size = tile_size;

    let f = Game.Frame;

    this.frames = [
        new f(0, 11 * 20, 20, 20, 0, -4), new f(20, 11 * 20, 20, 20, 0, -4), new f(40, 11 * 20, 20, 20, 0, -4), new f(60, 11 * 20, 20, 20, 0, -4), new f(80, 11 * 20, 20, 20, 0, -4), new f(100, 11 * 20, 20, 20, 0, -4), new f(120, 11 * 20, 20, 20, 0, -4), new f(140, 11 * 20, 20, 20, 0, -4), // idle-left
        new f(80, 10 * 20, 20, 20, 0, -4), new f(100, 10 * 20, 20, 20, 0, -4), new f(120, 10 * 20, 20, 20, 0, -4), new f(140, 10 * 20, 20, 20, 0, -4), // jump-left
        new f(0, 9 * 20, 20, 20, 0, -4), new f(20, 9 * 20, 20, 20, 0, -4), new f(40, 9 * 20, 20, 20, 0, -4), new f(60, 9 * 20, 20, 20, 0, -4), new f(80, 9 * 20, 20, 20, 0, -4), new f(100, 9 * 20, 20, 20, 0, -4), new f(120, 9 * 20, 20, 20, 0, -4), new f(140, 9 * 20, 20, 20, 0, -4), // walk-left

        new f(0, 7 * 20, 20, 20, 0, -4), new f(20, 7 * 20, 20, 20, 0, -4), new f(40, 7 * 20, 20, 20, 0, -4), new f(60, 7 * 20, 20, 20, 0, -4), new f(80, 7 * 20, 20, 20, 0, -4), new f(100, 7 * 20, 20, 20, 0, -4), new f(120, 7 * 20, 20, 20, 0, -4), new f(140, 7 * 20, 20, 20, 0, -4), // idle-left

        new f(0, 10 * 20, 20, 20, 0, -4), new f(20, 10 * 20, 20, 20, 0, -4), new f(40, 10 * 20, 20, 20, 0, -4), new f(60, 10 * 20, 20, 20, 0, -4), // jump-right
        new f(0, 8 * 20, 20, 20, 0, -4), new f(20, 8 * 20, 20, 20, 0, -4), new f(40, 8 * 20, 20, 20, 0, -4), new f(60, 8 * 20, 20, 20, 0, -4), new f(80, 8 * 20, 20, 20, 0, -4), new f(100, 8 * 20, 20, 20, 0, -4), new f(120, 8 * 20, 20, 20, 0, -4), new f(140, 8 * 20, 20, 20, 0, -4), // walk-right

        new f(81, 7 * 20, 14, 20), new f(96, 7 * 20, 20, 16), // carrot
        new f(112, 1 * 20, 20, 4), new f(112, 1 * 20, 20, 4), new f(112, 1 * 20, 20, 4) // grass
    ];

};
Game.TileSet.prototype = {constructor: Game.TileSet};

Game.World = function (friction = 0.85, gravity = 1.5, socket = null) { // Socket als Parameter hinzufügen
    this.collider = new Game.Collider();

    this.friction = friction;
    this.gravity = gravity;

    this.columns = 20;
    this.rows = 9;

    // this.tile_set     = new Game.TileSet(12, 20);
    this.tile_set = new Game.TileSet(8, 20);
    // Socket an Game.Player weitergeben
    this.player = new Game.Player(32, 76, socket); // Socket hier weitergeben!

    this.zone_id = "00"; // Standardwert, wird aber nicht mehr aus JSON geladen, kann für Debugging bleiben

    this.carrots = [];// the array of carrots in this zone;
    this.carrot_count = 0;// the number of carrots you have.
    this.doors = [];
    this.door = undefined;

    this.height = this.tile_set.tile_size * this.rows;
    this.width = this.tile_set.tile_size * this.columns;
    this.socket = socket; // Socket im World Objekt speichern, falls benötigt

    this.graphical_map = []; // Init graphical map
    this.collision_map = []; // Init collision map
    // **doorPosition wird zu doorPositions (Plural) - Typ muss hier nicht deklariert werden, da es nur in Catcrime-component.ts verwendet wird.**
    this.doorPositions = null; // Initialisiere doorPositions im World Objekt
};

Game.World.prototype = {
    constructor: Game.World,

    collideObject: function (object) {


        /* I got rid of the world boundary collision. Now it's up to the tiles to keep
        the player from falling out of the world. */

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

    },

    setup: function () { // Entferne zone Parameter

        this.carrots = new Array();
        this.doors = new Array();
        this.grass = new Array();
        // Behalte die Zuweisungen der Maps und columns/rows aus Catcrime-component.ts
        // this.collision_map      = zone.collision_map;
        // this.graphical_map      = zone.graphical_map;
        // this.columns            = zone.columns;
        // this.rows               = zone.rows;
        // this.zone_id            = zone.id; // Brauchen wir nicht mehr aus dem JSON


        // *** KEINE ZONE DATEN MEHR LADEN AUS JSON ***
        // Stattdessen bleiben die Arrays leer, da Leveldaten jetzt
        // in Catcrime-component.ts gesetzt werden (graphical_map, collision_map usw.)

        // Beispiel für optionale Inhalte, falls gewünscht (z.B. Karotten zufällig platzieren)
        // (Kann später erweitert werden oder in procedural-generation.ts integriert)
        /*
        if(generateCarrots) { // Beispielparameter, falls wir Karotten wollen
            for (let i = 0; i < 5; i++) { // Beispiel: 5 Karotten
                let x = Math.floor(Math.random() * this.columns) * this.tile_set.tile_size + 5;
                let y = Math.floor(Math.random() * (this.rows - 2)) * this.tile_set.tile_size - 2; // Nicht im untersten Bereich
                this.carrots.push(new Game.Carrot(x, y));
            }
        }
        */


        if (this.door) {


            if (this.door.destination_x != -1) {

                this.player.setCenterX(this.door.destination_x);
                this.player.setOldCenterX(this.door.destination_x);// It's important to reset the old position as well.

            }

            if (this.door.destination_y != -1) {

                this.player.setCenterY(this.door.destination_y);
                this.player.setOldCenterY(this.door.destination_y);

            }

            this.door = undefined;// Make sure to reset this.door so we don't trigger a zone load.

        }

    },

    update: function () {

        this.player.updatePosition(this.gravity, this.friction);

        this.collideObject(this.player);

        // ***************************************************
        // Hier Position an den Server senden
        // ***************************************************
        //if (this.socket && this.socket.readyState === WebSocket.OPEN && (Math.floor(this.x_old) !== Math.floor(this.x) || this.y_old !== this.y)) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN && (Math.floor(this.player.x_old) !== Math.floor(this.player.x) || this.player.y_old !== this.player.y)) {
            // if (this.socket && this.socket.readyState === WebSocket.OPEN ) {
            //console.log("Sende Position an Server: x" + this.player.x + " ,y:  " +this.player.y);
            const positionData = {
                type: "position", // Typ der Nachricht definieren
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
            ;

        }

        for (let index = this.grass.length - 1; index > -1; --index) {

            let grass = this.grass[index];

            grass.animate();

        }

        this.player.updateAnimation();


    }

};
export default Game;