export class Engine {
    private accumulated_time: number;
    private animation_frame_request: number | undefined;
    private time: number | undefined;
    private time_step: number;

    private updated: boolean;

    private update: (time_stamp: number) => void;
    private render: (time_stamp: number) => void;

    constructor(time_step: number, update: (time_stamp: number) => void, render: (time_stamp: number) => void) {
        this.accumulated_time = 0;
        this.animation_frame_request = undefined;
        this.time = undefined;
        this.time_step = time_step;

        this.updated = false;

        this.update = update;
        this.render = render;
    }

    run(time_stamp: number) {
        this.animation_frame_request = window.requestAnimationFrame(this.handleRun.bind(this)); // Bind this

        if (this.time === undefined) {
            this.time = time_stamp; // Initialize time on the first run
        }

        this.accumulated_time += time_stamp - this.time!; // Non-null assertion as time is initialized
        this.time = time_stamp;

        if (this.accumulated_time >= this.time_step * 3) {
            this.accumulated_time = this.time_step;
        }

        while (this.accumulated_time >= this.time_step) {
            this.accumulated_time -= this.time_step;

            this.update(time_stamp);

            this.updated = true;
        }

        if (this.updated) {
            this.updated = false;
            this.render(time_stamp);
        }
    }

    private handleRun(time_step: number) {
        this.run(time_step);
    }

    start() {
        this.accumulated_time = this.time_step;
        this.time = window.performance.now();
        this.animation_frame_request = window.requestAnimationFrame(this.handleRun.bind(this)); // Bind this
    }

    stop() {
        if (this.animation_frame_request) { // Check if animation_frame_request is defined
            window.cancelAnimationFrame(this.animation_frame_request);
        }
    }
}