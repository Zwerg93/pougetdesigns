// controller.ts
export class Controller {
    left: Controller.ButtonInput;
    right: Controller.ButtonInput;
    up: Controller.ButtonInput;

    constructor() {
        this.left = new Controller.ButtonInput();
        this.right = new Controller.ButtonInput();
        this.up = new Controller.ButtonInput();
    }

    
    keyDownUp(type: string, key_code: number): void {
        const down = type === "keydown";

        switch (key_code) {
            case 65: // Left arrow
                this.left.getInput(down);
                break;
            case 32: // Spacebar
                this.up.getInput(down);
                break;
            case 68: // Right arrow
                this.right.getInput(down);
                break;
        }
    }
}

export namespace Controller {
    export class ButtonInput {
        active: boolean;
        down: boolean;

        constructor() {
            this.active = false;
            this.down = false;
        }

        getInput(down: boolean): void {
            if (this.down !== down) this.active = down;
            this.down = down;
        }
    }
}