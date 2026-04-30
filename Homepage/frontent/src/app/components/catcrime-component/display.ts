import { Point } from "./generation/wfc-types";

export class Display {

    public buffer: CanvasRenderingContext2D;
    public context: CanvasRenderingContext2D;

    constructor(canvas: any) {
        const bufferCanvas = document.createElement("canvas");
        if (canvas != null) {
            this.buffer = bufferCanvas.getContext("2d")!; 
            this.context = canvas.getContext("2d")!;
        }

    }

    public drawMap(image: HTMLImageElement, image_columns: number, map: number[], map_columns: number, tile_size: number): void {
        for (let index = map.length - 1; index > -1; --index) { 
            const value = map[index];
            const source_x = (value % image_columns) * tile_size;
            const source_y = Math.floor(value / image_columns) * tile_size;
            const destination_x = (index % map_columns) * tile_size;
            const destination_y = Math.floor(index / map_columns) * tile_size;

            this.buffer.drawImage(image, source_x, source_y, tile_size, tile_size, destination_x, destination_y, tile_size, tile_size);
        }
    }

    public drawObject(image: HTMLImageElement, source_x: number, source_y: number, destination_x: number, destination_y: number, width: number, height: number, color?: string): void {
        this.buffer.drawImage(image, source_x, source_y, width, height, Math.round(destination_x), Math.round(destination_y), width, height);

        if(color) {
            this.buffer.strokeStyle = color;
            this.buffer.strokeRect(Math.round(destination_x), Math.round(destination_y), width, height);
        }
    }

    // ECHTE PFADE AUF DAS CANVAS ZEICHNEN!
    public drawPath(path: Point[], tile_size: number, fillStyle: string, strokeStyle: string): void {
        if (!path || path.length === 0) return;

        this.buffer.fillStyle = fillStyle;
        for (const point of path) {
            this.buffer.fillRect(point.x * tile_size, point.y * tile_size, tile_size, tile_size);
        }

        this.buffer.strokeStyle = strokeStyle;
        this.buffer.lineWidth = 3;
        this.buffer.beginPath();
        for (let i = 0; i < path.length; i++) {
            const px = path[i].x * tile_size + tile_size / 2;
            const py = path[i].y * tile_size + tile_size / 2;
            if (i === 0) {
                this.buffer.moveTo(px, py);
            } else {
                this.buffer.lineTo(px, py);
            }
        }
        this.buffer.stroke();
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