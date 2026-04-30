export const skyTiles = [31, 39];
export const groundTiles = [0, 1, 2, 14, 27, 28];
export const decorativeTiles = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
    33, 34, 35, 36, 37, 38, 40, 41, 42, 43,
    48, 49
];

export const neighborhoodRules: {
    [tileIndex: number]: { north: number[]; east: number[]; south: number[]; west: number[] }
} = {
    0: {
        north: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        east: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        south: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        west: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41]
    },
    1: {
        north: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        east: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        south: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        west: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41]
    },
    2: {
        north: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        east: [...groundTiles, ...decorativeTiles, 41, 12, 13, 14, 15, 16, 17, 18, 19],
        south: groundTiles,
        west: [...groundTiles, ...decorativeTiles, 41, 12, 13, 14, 15, 16, 17, 18, 19]
    },
    3: {
        north: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        east: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        south: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        west: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41]
    },
    4: {
        north: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        east: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        south: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        west: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41]
    },
    5: {
        north: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        east: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        south: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        west: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41]
    },
    6: {
        north: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        east: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        south: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        west: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41]
    },
    7: {
        north: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        east: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        south: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41],
        west: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41]
    },
    31: {
        north: [...skyTiles, ...groundTiles, 31, 39, 41, 12, 13, 14, 15, 16, 17, 18, 19],
        east: [...skyTiles, ...groundTiles, 31, 39, 41, 12, 13, 14, 15, 16, 17, 18, 19],
        south: [...skyTiles, ...groundTiles, ...decorativeTiles, 31, 39, 41, 12, 13, 14, 15, 16, 17, 18, 19],
        west: [...skyTiles, ...groundTiles, 31, 39, 41, 12, 13, 14, 15, 16, 17, 18, 19]
    },
    47: {
        north: [...skyTiles, 31, 39],
        east: [...skyTiles, 31, 39],
        south: [...skyTiles, 31, 39],
        west: [...skyTiles, 31, 39]
    },
    39: {
        north: [...skyTiles, ...groundTiles, 31, 39, 41, 12, 13, 14, 15, 16, 17, 18, 19],
        east: [...skyTiles, ...groundTiles, 31, 39, 41, 12, 13, 14, 15, 16, 17, 18, 19],
        south: [...skyTiles, ...groundTiles, ...decorativeTiles, 31, 39, 41, 12, 13, 14, 15, 16, 17, 18, 19],
        west: [...skyTiles, ...groundTiles, 31, 39, 41, 12, 13, 14, 15, 16, 17, 18, 19]
    },
    50: {north: [...skyTiles], east: [...skyTiles], south: [...skyTiles], west: [...skyTiles]},
};