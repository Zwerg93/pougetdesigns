export class Display {

    private buffer: CanvasRenderingContext2D;
    private context: CanvasRenderingContext2D;

    constructor(canvas: any) {
        const bufferCanvas = document.createElement("canvas");
        if (canvas != null) {
            this.buffer = bufferCanvas.getContext("2d")!; // Non-null assertion as getContext will not return null if the type is correct.
            this.context = canvas.getContext("2d")!;
        }

    }

    /* This function draws the map to the buffer. */
    public drawMap(image: HTMLImageElement, image_columns: number, map: number[], map_columns: number, tile_size: number): void {

        for (let index = map.length - 1; index > -1; --index) { // Now map is correctly typed as number[]

            const value = map[index];
            const source_x = (value % image_columns) * tile_size;
            const source_y = Math.floor(value / image_columns) * tile_size;
            const destination_x = (index % map_columns) * tile_size;
            const destination_y = Math.floor(index / map_columns) * tile_size;

            this.buffer.drawImage(image, source_x, source_y, tile_size, tile_size, destination_x, destination_y, tile_size, tile_size);

        }
    }

    public drawObject(image: HTMLImageElement, source_x: number, source_y: number, destination_x: number, destination_y: number, width: number, height: number): void {

        this.buffer.drawImage(image, source_x, source_y, width, height, Math.round(destination_x), Math.round(destination_y), width, height);

    }

    public resize(width: number, height: number, height_width_ratio: number): void {

        if (height / width > height_width_ratio) {

            this.context.canvas.height = width * height_width_ratio;
            this.context.canvas.width = width;

        } else {

            this.context.canvas.height = height;
            this.context.canvas.width = height / height_width_ratio;

        }

        this.context.imageSmoothingEnabled = false;

    }

    public render(): void {
        this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height);
    }

}