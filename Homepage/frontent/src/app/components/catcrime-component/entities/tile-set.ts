// @ts-nocheck
import {Frame} from "./base";

export function TileSet(columns, tile_size) {
    this.columns = columns;
    this.tile_size = tile_size;
    const frame = Frame;
    this.frames = [
        new frame(0, 11 * 20, 20, 20, 0, -4), new frame(20, 11 * 20, 20, 20, 0, -4), new frame(40, 11 * 20, 20, 20, 0, -4), new frame(60, 11 * 20, 20, 20, 0, -4), new frame(80, 11 * 20, 20, 20, 0, -4), new frame(100, 11 * 20, 20, 20, 0, -4), new frame(120, 11 * 20, 20, 20, 0, -4), new frame(140, 11 * 20, 20, 20, 0, -4),
        new frame(80, 10 * 20, 20, 20, 0, -4), new frame(100, 10 * 20, 20, 20, 0, -4), new frame(120, 10 * 20, 20, 20, 0, -4), new frame(140, 10 * 20, 20, 20, 0, -4),
        new frame(0, 9 * 20, 20, 20, 0, -4), new frame(20, 9 * 20, 20, 20, 0, -4), new frame(40, 9 * 20, 20, 20, 0, -4), new frame(60, 9 * 20, 20, 20, 0, -4), new frame(80, 9 * 20, 20, 20, 0, -4), new frame(100, 9 * 20, 20, 20, 0, -4), new frame(120, 9 * 20, 20, 20, 0, -4), new frame(140, 9 * 20, 20, 20, 0, -4),
        new frame(0, 7 * 20, 20, 20, 0, -4), new frame(20, 7 * 20, 20, 20, 0, -4), new frame(40, 7 * 20, 20, 20, 0, -4), new frame(60, 7 * 20, 20, 20, 0, -4), new frame(80, 7 * 20, 20, 20, 0, -4), new frame(100, 7 * 20, 20, 20, 0, -4), new frame(120, 7 * 20, 20, 20, 0, -4), new frame(140, 7 * 20, 20, 20, 0, -4),
        new frame(0, 10 * 20, 20, 20, 0, -4), new frame(20, 10 * 20, 20, 20, 0, -4), new frame(40, 10 * 20, 20, 20, 0, -4), new frame(60, 10 * 20, 20, 20, 0, -4),
        new frame(0, 8 * 20, 20, 20, 0, -4), new frame(20, 8 * 20, 20, 20, 0, -4), new frame(40, 8 * 20, 20, 20, 0, -4), new frame(60, 8 * 20, 20, 20, 0, -4), new frame(80, 8 * 20, 20, 20, 0, -4), new frame(100, 8 * 20, 20, 20, 0, -4), new frame(120, 8 * 20, 20, 20, 0, -4), new frame(140, 8 * 20, 20, 20, 0, -4),
        new frame(81, 7 * 20, 14, 20), new frame(96, 7 * 20, 20, 16),
        new frame(112, 1 * 20, 20, 4), new frame(112, 1 * 20, 20, 4), new frame(112, 1 * 20, 20, 4)
    ];
}
