export class AssetsManager {
    tile_set_image: HTMLImageElement | undefined;

    constructor() {
        this.tile_set_image = undefined;
    }

    requestImage(url: string, callback: (image: HTMLImageElement) => void) {
        const image = new Image();
        image.addEventListener("load", function () {
            callback(image);
        });
        image.src = url;
    }
}