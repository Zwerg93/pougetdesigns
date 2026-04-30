// Dateiname: catcrime-component.ts
// Pfad: app/components/catcrime-component/catcrime-component.ts

import {html, render} from "lit-html";
// @ts-ignore
import {Controller} from "./controller.ts"
// @ts-ignore
import {Display} from "./display.ts"
// @ts-ignore
import {Engine} from "./engine.ts";

import GameFunction from "./game"
import {AssetsManager} from "./assets/assets-manager";
import {LevelDoorPosition} from "./generation/wfc-types";

import rabitTrap from "./cat1newAnimations_indexed.png";

// @ts-ignore
import {generateLevel} from "./procedural-generation.ts";

class Catcrime extends HTMLElement {
    private socket: WebSocket | null = null;
    private playerName: string = "";
    private game: any;
    private controller: any;
    private display: any;
    private engine: any;

    private assets_manager: any;
    private otherPlayers: { [playerName: string]: { x: number, y: number } } = {};
    private previousLevelSeeds: number[] = []; 
    private proceduralMapColumns = 20;
    private proceduralMapRows = 9;
    private possibleTileIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,];
    private tileProbabilities = {
        31: 1.3,
        39: 0.2,
        47: 0.1,
        0: 0.04,
        1: 0.2,
        2: 0.06,
        3: 0.03,
        4: 0.04,
        5: 0.03,
        6: 0.02,
        7: 0.02,
        8: 0.05,
        9: 0.05,
        10: 0.03,
        11: 0.03,
        20: 0.03,
        21: 0.03,
        22: 0.03,
        23: 0.03,
        32: 0.03,
        33: 0.03,
        34: 0.03,
        35: 0.03,
        37: 0.03,
        41: 0.03,
        12: 0.02, 13: 0.015, 14: 0.015, 15: 0.01, 16: 0.01, 17: 0.01, 18: 0.01, 19: 0.01,
        24: 0.008, 25: 0.008, 26: 0.008, 27: 0.008, 28: 0.008, 29: 0.008, 30: 0.008,
        36: 0.004, 38: 0.004, 40: 0.004, 42: 0.004, 43: 0.004, 48: 0.004, 49: 0.004
    };

    private currentLevelSeed: number = 3123; 
    private doorPositions: {
        left: LevelDoorPosition | null;
        right: LevelDoorPosition | null;
    } | null = null;
    private gameId: string = ""; 
    private levelSeedBroadcasted: boolean = false; 
    private isFirstLevel: boolean = true; 

    // Debug Paths Variable
    private debugPathForward: any = null;
    private debugPathBackward: any = null;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.game = null;
        this.controller = new Controller();
        this.display = new Display(document.createElement('canvas') as HTMLCanvasElement);
        this.engine = new Engine(1000 / 30, this.renderGame.bind(this), this.updateGame.bind(this));
        this.assets_manager = new AssetsManager();
    }

    connectedCallback() {
        this.render();
    }

    connectWebSocket() {
        const nameInput = this.shadowRoot?.querySelector<HTMLInputElement>("#nameInput");
        const gameIdInput = this.shadowRoot?.querySelector<HTMLInputElement>("#gameIdInput"); 
        if (nameInput && gameIdInput) {
            this.playerName = nameInput.value.trim();
            this.gameId = gameIdInput.value.trim(); 
            this.socket = new WebSocket(`ws://localhost:8080/start-websocket/test/test`); 

            this.socket.onopen = () => {
                console.log("WebSocket connected!");
                this.game = new (GameFunction as any)(this.socket);
                this.startGame();
            };

            this.socket.onmessage = (event) => {
                this.handleServerMessage(event);
            };

            this.socket.onclose = () => {
                console.log("WebSocket closed!");
                this.socket = null;
                this.render();
            };
        }
    }

    render() {
        const template = html`
            <div>
                <h2>WebSocket Game</h2>
                <input type="text" id="nameInput" placeholder="Enter your name">
                <input type="text" id="gameIdInput" placeholder="Enter Game ID">
                <button @click=${() => this.connectWebSocket()}>Connect</button>
                <canvas></canvas>
            </div>
        `;
        render(template, this.shadowRoot!);

        const canvas = this.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
        if (canvas) {
            this.display.context = canvas.getContext('2d');
        } else {
            console.error("Canvas element not found in shadowRoot");
        }
        this.connectWebSocket();
    }

    startGame() {
        if (!this.game) return;
        
        window.addEventListener("keydown", (event) => this.keyDownUp(event));
        window.addEventListener("keyup", (event) => this.keyDownUp(event));
        window.addEventListener("resize", (event) => this.resize(event));

        this.display.buffer.canvas.height = this.game.world.height;
        this.display.buffer.canvas.width = this.game.world.width;
        this.display.buffer.imageSmoothingEnabled = false;

        this.loadLevel(this.currentLevelSeed); 

        this.assets_manager.requestImage(rabitTrap, (image: HTMLImageElement) => {
            this.assets_manager.tile_set_image = image;
            this.resize(new Event('resize'));
            this.engine.start();
        });
    }

    handleServerMessage(event: MessageEvent) {
        try {
            const messageData = JSON.parse(event.data);

            if (messageData.type === "playerPositions") {
                this.handlePlayerPositions(messageData);
            } else if (messageData.type === "levelSeed") {
                this.handleLevelSeed(messageData);
            }
        } catch (error) {
            console.error("Fehler beim Verarbeiten:", error);
        }
    }

    handleLevelSeed(messageData: any) {
        const seed = messageData.seed;
        this.currentLevelSeed = seed;

        if (!this.levelSeedBroadcasted) {
            this.loadLevel(this.currentLevelSeed); 
            this.levelSeedBroadcasted = true; 
        }
    }

    handlePlayerPositions(messageData: any) {
        this.otherPlayers = {};
        const playersData = messageData.players;

        playersData.forEach((player: any) => {
            if (player.name !== this.playerName) {
                this.otherPlayers[player.name] = {x: player.x, y: player.y};
            }
        });
        this.renderGame();
    }

    keyDownUp(event: Event) {
        this.controller.keyDownUp(event.type, (event as KeyboardEvent).keyCode);
    }

    resize(event: Event) {
        this.display.resize(document.documentElement.clientWidth, document.documentElement.clientHeight, this.game.world.height / this.game.world.width);
        this.display.render();
    }

    renderGame() {
        if (!this.assets_manager.tile_set_image) return;

        // 1. Level Map zeichnen
        this.display.drawMap(this.assets_manager.tile_set_image,
            this.game.world.tile_set.columns, this.game.world.graphical_map, this.game.world.columns, this.game.world.tile_set.tile_size);

        // 2. DEBUG: ECHTE PFADE ZEICHNEN
        if (this.debugPathForward) {
            this.display.drawPath(this.debugPathForward, this.game.world.tile_set.tile_size, "rgba(0, 255, 0, 0.3)", "rgba(0, 255, 0, 0.9)");
        }
        if (this.debugPathBackward) {
            this.display.drawPath(this.debugPathBackward, this.game.world.tile_set.tile_size, "rgba(0, 0, 255, 0.3)", "rgba(0, 0, 255, 0.9)");
        }

        // 3. Andere Spieler zeichnen
        for (const playerName in this.otherPlayers) {
            const player = this.otherPlayers[playerName];
            let frame = this.game.world.tile_set.frames[0];
            this.display.drawObject(this.assets_manager.tile_set_image,
                frame.x, frame.y,
                player.x + Math.floor(this.game.world.player.width * 0.5 - frame.width * 0.5) + frame.offset_x,
                player.y + frame.offset_y, frame.width, frame.height, "red");
        }

        // 4. Spieler zeichnen
        let frame = this.game.world.tile_set.frames[this.game.world.player.frame_value];
        this.display.drawObject(this.assets_manager.tile_set_image,
            frame.x, frame.y,
            this.game.world.player.x + Math.floor(this.game.world.player.width * 0.5 - frame.width * 0.5) + frame.offset_x,
            this.game.world.player.y + frame.offset_y, frame.width, frame.height);

        this.display.render();
    }

    async generateNewLevel(doorDirection: 'right' | 'left' = 'right') { 
        let nextLevelDoorDirection: 'left' | 'right';
        if (doorDirection === 'right') {
            nextLevelDoorDirection = 'left';
            this.previousLevelSeeds.push(this.currentLevelSeed);
            this.currentLevelSeed = Math.random(); 
        } else { 
            nextLevelDoorDirection = 'right';
            const previousSeed = this.previousLevelSeeds.pop(); 
            if (previousSeed !== undefined) {
                this.currentLevelSeed = previousSeed; 
            } else {
                this.currentLevelSeed = Math.random(); 
            }
        }

        await this.loadLevel(this.currentLevelSeed, doorDirection); 
    }

    async loadLevel(seed: number, doorDirection: 'left' | 'right' = 'right') { 
        
        const levelData = generateLevel(
            this.proceduralMapColumns,
            this.proceduralMapRows,
            this.possibleTileIndices,
            seed,
            this.tileProbabilities,
            this.isFirstLevel,
            doorDirection 
        );

        this.game.world.graphical_map = levelData.graphical_map;
        this.game.world.collision_map = levelData.collision_map;
        this.game.world.doorPositions = levelData.door_positions;
        
        // Debug-Pfade ins Component holen
        this.debugPathForward = levelData.debug_path_forward || null;
        this.debugPathBackward = levelData.debug_path_backward || null;

        this.doorPositions = levelData.door_positions; 

        this.game.world.columns = this.proceduralMapColumns;
        this.game.world.rows = this.proceduralMapRows;

        this.game.world.setup();

        if (doorDirection === 'right') {
            if (levelData.door_positions.left) {
                this.game.world.player.setCenterX((levelData.door_positions.left.x + 1 + 0.5) * this.game.world.tile_set.tile_size);
                this.game.world.player.setCenterY(levelData.door_positions.left.y * this.game.world.tile_set.tile_size);
            } else {
                this.setDefaultSpawn();
            }
        } else if (doorDirection === 'left') { 
            if (levelData.door_positions.right) { 
                this.game.world.player.setCenterX((levelData.door_positions.right.x - 1 + 0.5) * this.game.world.tile_set.tile_size); 
                this.game.world.player.setCenterY(levelData.door_positions.right.y * this.game.world.tile_set.tile_size);
            } else {
                this.setDefaultSpawn();
            }
        }

        if (this.isFirstLevel) {
            this.isFirstLevel = false; 
        }
    }

    setDefaultSpawn() {
        const startX = 2 * this.game.world.tile_set.tile_size + 0.5 * this.game.world.tile_set.tile_size;
        this.game.world.player.setCenterX(startX);
        this.game.world.player.setCenterY(76);
    }

    async updateGame() {
        if (!this.game) return;

        if (this.controller.left.active) {
            this.game.world.player.moveLeft();
        }
        if (this.controller.right.active) {
            this.game.world.player.moveRight();
        }
        if (this.controller.up.active) {
            this.game.world.player.jump();
            this.controller.up.active = false;
        }

        this.game.update();

        if (this.doorPositions) {
            if (this.doorPositions.right) {
                const playerTileX = Math.floor(this.game.world.player.x / this.game.world.tile_set.tile_size);
                const playerTileY = Math.floor(this.game.world.player.y / this.game.world.tile_set.tile_size);

                if (playerTileX === this.doorPositions.right.x && playerTileY === this.doorPositions.right.y) {
                    await this.generateNewLevel('right'); 
                    this.game.world.door = false; 
                    this.levelSeedBroadcasted = false; 
                }
            }
            if (this.doorPositions.left) {
                const playerTileX = Math.floor(this.game.world.player.x / this.game.world.tile_set.tile_size);
                const playerTileY = Math.floor(this.game.world.player.y / this.game.world.tile_set.tile_size);

                if (playerTileX === this.doorPositions.left.x && playerTileY === this.doorPositions.left.y) {
                    await this.generateNewLevel('left'); 
                    this.game.world.door = false; 
                    this.levelSeedBroadcasted = false; 
                }
            }
        }
    }
}

customElements.define("catcrime-component", Catcrime);