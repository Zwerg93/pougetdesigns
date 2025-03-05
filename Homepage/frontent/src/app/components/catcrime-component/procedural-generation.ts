// procedural-generation.ts

interface TilePossibilities {
    [tileIndex: number]: number;
}

interface WFCGridData {
    grid: WFCCell[][];
    allCells: { x: number; y: number }[];
}


interface WFCCell {
    possibleTiles: number[];
    collapsed: boolean;
    tileIndex?: number;
}

const skyTiles = [31, 39];
const groundTiles = [0, 1, 2, 14, 27, 28,];
const decorativeTiles = [3,4,5,6,7,8,9,10,11,12, 13, 14, 15, 16, 17, 18, 19,20,21,22,23, 24, 25, 26, 27, 28, 29, 30,31,32,33,34,35, 36, 37, 38, 40, 41, 42, 43, 48, 49];


const neighborhoodRules: {
    [tileIndex: number]: { north: number[], east: number[], south: number[], west: number[] }
} = {
    0: {
        north: [...groundTiles, ...skyTiles, ...decorativeTiles, 31, 39, 41,],
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

// **Geänderte Interface für Rückgabe von generateWFCMap und generateLevel**
interface LevelData {
    graphical_map: number[];
    collision_map: number[];
    door_positions: { // Jetzt door_positions (Plural), ein Objekt mit linken und rechten Türpositionen
        left: { x: number, y: number, direction: 'left' | 'right' } | null; // Allow 'left' or 'right'
        right: { x: number, y: number, direction: 'left' | 'right' } | null; // Allow 'left' or 'right'
    };
}


// **Geänderte Rückgabe Typ in generateWFCMap und generateLevel**
// **Parameter `isFirstLevel` zu generateWFCMap hinzugefügt**
export function generateWFCMap(columns: number, rows: number, possibleTileIndices: number[], seed: number | undefined, tileProbabilities: {
    [tileIndex: number]: number
} | undefined, isFirstLevel: boolean): LevelData { // Türrichtung Parameter entfernt
    if (seed !== undefined) {
        Math.random = seededRandom(seed);
    } else {
        Math.random = Math.random;
    }

    const wfcGridData = initializeWFCGrid(columns, rows, possibleTileIndices);
    const wfcGrid = wfcGridData.grid;
    const collapsedGrid = collapseWFCGrid(wfcGridData, tileProbabilities);
    const maps = extractMapsFromWFCGrid(collapsedGrid);

    let leftDoorPosition: { x: number, y: number, direction: 'left' | 'right' } | null = null;
    let rightDoorPosition: { x: number, y: number, direction: 'left' | 'right' } | null = null;


    if (isFirstLevel) {
        // Nur rechte Tür für das erste Level
        console.error("test")
        rightDoorPosition = placeDoor(maps.graphical_map, maps.collision_map, columns, rows, 'right');
    } else {
        console.error("tesasdt")

        // Linke und rechte Türen für alle anderen Level
        leftDoorPosition = placeDoor(maps.graphical_map, maps.collision_map, columns, rows, 'left');
        rightDoorPosition = placeDoor(maps.graphical_map, maps.collision_map, columns, rows, 'right');
    }


    return {
        graphical_map: maps.graphical_map,
        collision_map: maps.collision_map,
        door_positions: { // Rückgabe eines Objekts mit beiden Türpositionen
            left: leftDoorPosition,
            right: rightDoorPosition
        }
    };
}

function placeDoor(graphicalMap: number[], collisionMap: number[], columns: number, rows: number, doorDirection: 'left' | 'right'): {
    x: number,
    y: number,
    direction: 'left' | 'right'
} | null {
    const lastColumnIndex = columns - 1;
    const firstColumnIndex = 0;
    const groundTileIndices = [0, 1, 2, 3, 4, 5, 6, 7];
    const skyTileIndices = [31, 39];

    let doorPlaced = false;
    let doorX, doorY;

    let startColumnIndex = (doorDirection === 'right') ? lastColumnIndex : firstColumnIndex;
    let columnStep = (doorDirection === 'right') ? -1 : 1;


    for (let col = startColumnIndex; (doorDirection === 'right') ? col >= 0 : col < columns; col += columnStep) {
        for (let row = 0; row < rows - 1; row++) { // Bis rows - 1, damit Boden unter der Tür sein kann
            if (row >= rows - 1) continue;

            doorX = col;
            doorY = row;
            const tileIndex = graphicalMap[row * columns + col];

            // Überprüfe Tiles SEITLICH der potenziellen Türposition - RICHTUNGSABHÄNGIG, jetzt KORRIGIERT
            let sideTileIndex;
            if (doorDirection === 'right') {
                sideTileIndex = (col > 0) ? graphicalMap[row * columns + (col - 1)] : null; // Tile links für rechte Tür
            } else { // doorDirection === 'left'
                sideTileIndex = (col < columns - 1) ? graphicalMap[row * columns + (col + 1)] : null; // Tile rechts für linke Tür
            }

            const isSideTileSky = sideTileIndex === null || skyTileIndices.includes(sideTileIndex);

            if (groundTileIndices.includes(tileIndex) && isSideTileSky) {
                graphicalMap[row * columns + col] = 50;
                collisionMap[row * columns + col] = 0;
                doorPlaced = true;
                console.log("[placeDoor] TÜR PLATZIERT in Spalte:", col, "Reihe:", row, "Richtung:", doorDirection);
                return {x: doorX, y: doorY, direction: doorDirection};
            }
        }
        if (doorPlaced) break;
    }

    console.warn("[placeDoor] KEINE TÜR PLATZIERT (kein geeigneter Platz in Randspalte gefunden). Richtung:", doorDirection);
    return null;
}


function initializeWFCGrid(columns: number, rows: number, possibleTileIndices: number[]): WFCGridData {
    const grid: WFCCell[][] = [];
    const allCells: { x: number, y: number }[] = [];


    const upperThirdRows = Math.floor(rows / 4);
    const bottomRows = 1;

    for (let y = 0; y < rows; y++) {
        grid[y] = [];
        for (let x = 0; x < columns; x++) {
            allCells.push({x, y});
            let initialPossibleTiles = [...possibleTileIndices];

            if (y >= rows - bottomRows) {
                initialPossibleTiles = [...groundTiles];
            } else if (y < upperThirdRows) {
                initialPossibleTiles = [...skyTiles];
            }

            grid[y][x] = {
                possibleTiles: initialPossibleTiles,
                collapsed: false,
                tileIndex: undefined
            };
        }
    }
    return {grid, allCells};
}


function collapseWFCGrid(wfcGridData: WFCGridData, tileProbabilities?: { [tileIndex: number]: number }): WFCCell[][] {
    const wfcGrid = wfcGridData.grid;
    const allCells = wfcGridData.allCells;

    const rows = wfcGrid.length;
    const columns = wfcGrid[0].length;

    shuffleArray(allCells);


    for (const cellCoords of allCells) {
        if (!cellCoords) {
            continue;
        }
        const x = cellCoords.x;
        const y = cellCoords.y;
        const cell = wfcGrid[y][x];

        if (!cell.collapsed) {
            if (cell.possibleTiles.length === 0) {
                console.error("Konflikt: Keine möglichen Tiles für Zelle!", x, y);
                return wfcGrid;
            }

            let selectedTileIndex: number;

            if (tileProbabilities) {
                selectedTileIndex = chooseTileWithProbability(cell.possibleTiles, tileProbabilities);
            } else {
                const randomIndex = Math.floor(Math.random() * cell.possibleTiles.length);
                selectedTileIndex = cell.possibleTiles[randomIndex];
            }

            cell.collapsed = true;
            cell.tileIndex = selectedTileIndex;
            cell.possibleTiles = [selectedTileIndex];

            propagateConstraints(wfcGrid, x, y, selectedTileIndex);
        }
    }
    return wfcGrid;
}

function chooseTileWithProbability(possibleTiles: number[], tileProbabilities: {
    [tileIndex: number]: number
}): number {

    let probabilitySum = 0;
    for (const tileIndex of possibleTiles) {
        probabilitySum += (tileProbabilities[tileIndex] || 0);
    }

    let randomValue = Math.random() * probabilitySum;
    let cumulativeProbability = 0;

    for (const tileIndex of possibleTiles) {
        const probability = tileProbabilities[tileIndex] || 0;
        cumulativeProbability += probability;
        if (randomValue <= cumulativeProbability) {
            return tileIndex;
        }
    }

    console.error("Fehler bei der gewichteten Zufallsauswahl! Fallback auf gleichverteilte Auswahl.");
    return possibleTiles[0];
}


function propagateConstraints(wfcGrid: WFCCell[][], x: number, y: number, collapsedTileIndex: number): void {
    const rows = wfcGrid.length;
    const columns = wfcGrid[0].length;

    const directions = [
        {dx: 0, dy: -1, directionName: 'north'},
        {dx: 1, dy: 0, directionName: 'east'},
        {dx: 0, dy: 1, directionName: 'south'},
        {dx: -1, dy: 0, directionName: 'west'}
    ];

    for (const direction of directions) {
        const neighborX = x + direction.dx;
        const neighborY = y + direction.dy;

        if (neighborX >= 0 && neighborX < columns && neighborY >= 0 && neighborY < rows) {
            const neighborCell = wfcGrid[neighborY][neighborX];

            if (!neighborCell.collapsed) {
                const allowedNeighborTiles = neighborhoodRules[collapsedTileIndex]?.[direction.directionName as keyof typeof neighborhoodRules[number]];

                if (allowedNeighborTiles) {
                    const nextPossibleTiles = neighborCell.possibleTiles.filter(tileIndex => allowedNeighborTiles.includes(tileIndex));

                    if (nextPossibleTiles.length < neighborCell.possibleTiles.length) {
                        neighborCell.possibleTiles = nextPossibleTiles;

                        if (neighborCell.possibleTiles.length === 0) {
                            console.error("Konflikt in Constraint Propagation!", neighborX, neighborY);
                            return;
                        }
                    }
                }
            }
        }
    }
}


function extractMapsFromWFCGrid(wfcGrid: WFCCell[][]): { graphical_map: number[], collision_map: number[] } {
    const rows = wfcGrid.length;
    const columns = wfcGrid[0].length;
    const graphicalMap: number[] = [];
    const collisionMap: number[] = [];
    const collisionValues: { [tileIndex: number]: number } = {
        31: 0,
        2: 15,
        41: 15,
        7: 15,
        28: 15,
        29: 15,
        39: 0,
        0: 15,
        4: 15, // Initial 13 für dynamische Anpassung
        6: 15,
        26: 15,
        3: 15,
        1: 15,
        5: 15,
        24: 15,
        12: 15,
        17: 15,
        13: 15, // Initial 13 für dynamische Anpassung
        14: 15,
        15: 15,
        16: 15,
        18: 15,
        19: 15,
        27: 15,
        25: 25,
        40: 15,
        38: 15,
        43: 15,
        50: 0,
        36: 15,
        30: 15,
        47: 1
    };

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const cell = wfcGrid[y][x];
            const tileIndex = cell.tileIndex !== undefined ? cell.tileIndex : 0;
            graphicalMap.push(tileIndex);
            collisionMap.push(collisionValues[tileIndex] || 0);
        }
    }


    // Dynamische Anpassung der Kollisionswerte
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const tileIndex = graphicalMap[y * columns + x];
            let currentCollisionValue = collisionMap[y * columns + x];

            if (currentCollisionValue === 13 || currentCollisionValue === 14 || currentCollisionValue === 15) {
                if (y + 1 < rows && skyTiles.includes(graphicalMap[(y + 1) * columns + x])) {
                    // Tile unterhalb ist Himmel
                    if (currentCollisionValue !== 15) {
                        collisionMap[y * columns + x] = 14; // Unten, links, rechts
                    }
                } else {
                    // Tile unterhalb ist kein Himmel
                    // @ts-ignore
                    if (currentCollisionValue !== 11) {
                        collisionMap[y * columns + x] = 11; // Oben, links, rechts
                    }
                }
            }
        }
    }

    return {graphical_map: graphicalMap, collision_map: collisionMap};
}


function seededRandom(seed: number) {
    let currentSeed = seed;

    return function () {
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);

        currentSeed = (a * currentSeed + c) % m;
        return currentSeed / m;
    } as () => number;
}


function shuffleArray<T>(array: T[]) {
    if (!array) {
        return;
    }
    if (!Array.isArray(array)) {
        return;
    }

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        if (array[i] === undefined || array[j] === undefined) {
            console.error("shuffleArray: Undefined Element entdeckt! i:", i, "j:", j, "array[i]:", array[i], "array[j]:", array[j]);
        }
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// **Geänderte generateLevel Funktion, um `isFirstLevel` Parameter zu akzeptieren und an `generateWFCMap` weiterzuleiten**
export function generateLevel(columns: number, rows: number, possibleTileIndices: number[], seed: number | undefined, tileProbabilities: {
    [tileIndex: number]: number
} | undefined, isFirstLevel: boolean): LevelData {
    return generateWFCMap(columns, rows, possibleTileIndices, seed, tileProbabilities, isFirstLevel);
}