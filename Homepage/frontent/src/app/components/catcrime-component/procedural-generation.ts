// Dateiname: procedural-generation.ts
// Pfad: app/components/catcrime-component/procedural-generation.ts

import { LevelData, WFCCell, WFCGridData } from "./generation/wfc-types";
import { decorativeTiles, groundTiles, neighborhoodRules, skyTiles } from "./generation/wfc-rules";
import { findPlatformerPath } from "./validation/reachability";

export function generateWFCMap(columns: number, rows: number, possibleTileIndices: number[], seed: number | undefined, tileProbabilities: { [tileIndex: number]: number } | undefined, isFirstLevel: boolean): LevelData {
    if (seed !== undefined) {
        Math.random = seededRandom(seed);
    }

    const wfcGridData = initializeWFCGrid(columns, rows, possibleTileIndices);
    const wfcGrid = wfcGridData.grid;
    const collapsedGrid = collapseWFCGrid(wfcGridData, tileProbabilities);
    const maps = extractMapsFromWFCGrid(collapsedGrid);

    let leftDoorPosition: { x: number, y: number, direction: 'left' | 'right' } | null = null;
    let rightDoorPosition: { x: number, y: number, direction: 'left' | 'right' } | null = null;

    if (isFirstLevel) {
        rightDoorPosition = placeDoor(maps.graphical_map, maps.collision_map, columns, rows, 'right');
    } else {
        leftDoorPosition = placeDoor(maps.graphical_map, maps.collision_map, columns, rows, 'left');
        rightDoorPosition = placeDoor(maps.graphical_map, maps.collision_map, columns, rows, 'right');
    }

    return {
        graphical_map: maps.graphical_map,
        collision_map: maps.collision_map,
        door_positions: { left: leftDoorPosition, right: rightDoorPosition }
    };
}

function placeDoor(graphicalMap: number[], collisionMap: number[], columns: number, rows: number, doorDirection: 'left' | 'right'): { x: number, y: number, direction: 'left' | 'right' } | null {
    const lastColumnIndex = columns - 1;
    const firstColumnIndex = 0;

    let startColumnIndex = (doorDirection === 'right') ? lastColumnIndex : firstColumnIndex;
    let columnStep = (doorDirection === 'right') ? -1 : 1;

    for (let col = startColumnIndex; (doorDirection === 'right') ? col >= 0 : col < columns; col += columnStep) {
        for (let row = 0; row < rows - 1; row++) {
            const currentIndex = row * columns + col;
            const belowIndex = (row + 1) * columns + col;

            if (collisionMap[currentIndex] === 0 && collisionMap[belowIndex] > 0) {
                let adjacentCol = (doorDirection === 'right') ? col - 1 : col + 1;
                if (adjacentCol >= 0 && adjacentCol < columns) {
                    const adjacentIndex = row * columns + adjacentCol;
                    if (collisionMap[adjacentIndex] > 0) {
                        continue; 
                    }
                }

                graphicalMap[currentIndex] = 50; 
                collisionMap[currentIndex] = 0;  
                
                return { x: col, y: row, direction: doorDirection };
            }
        }
    }
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
            allCells.push({ x, y });
            let initialPossibleTiles = [...possibleTileIndices];

            if (y >= rows - bottomRows) {
                initialPossibleTiles = [...groundTiles];
            } else if (y < upperThirdRows) {
                initialPossibleTiles = [...skyTiles];
            }

            grid[y][x] = { possibleTiles: initialPossibleTiles, collapsed: false, tileIndex: undefined };
        }
    }
    return { grid, allCells };
}

function collapseWFCGrid(wfcGridData: WFCGridData, tileProbabilities?: { [tileIndex: number]: number }): WFCCell[][] {
    const wfcGrid = wfcGridData.grid;
    const allCells = wfcGridData.allCells;
    shuffleArray(allCells);

    for (const cellCoords of allCells) {
        if (!cellCoords) continue;
        const x = cellCoords.x;
        const y = cellCoords.y;
        const cell = wfcGrid[y][x];

        if (!cell.collapsed) {
            if (cell.possibleTiles.length === 0) return wfcGrid;

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

function chooseTileWithProbability(possibleTiles: number[], tileProbabilities: { [tileIndex: number]: number }): number {
    let probabilitySum = 0;
    for (const tileIndex of possibleTiles) probabilitySum += (tileProbabilities[tileIndex] || 0);

    let randomValue = Math.random() * probabilitySum;
    let cumulativeProbability = 0;

    for (const tileIndex of possibleTiles) {
        cumulativeProbability += (tileProbabilities[tileIndex] || 0);
        if (randomValue <= cumulativeProbability) return tileIndex;
    }
    return possibleTiles[0];
}

function propagateConstraints(wfcGrid: WFCCell[][], x: number, y: number, collapsedTileIndex: number): void {
    const rows = wfcGrid.length;
    const columns = wfcGrid[0].length;
    const directions = [
        { dx: 0, dy: -1, directionName: 'north' },
        { dx: 1, dy: 0, directionName: 'east' },
        { dx: 0, dy: 1, directionName: 'south' },
        { dx: -1, dy: 0, directionName: 'west' }
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
                        if (neighborCell.possibleTiles.length === 0) return;
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

        31: 0, 2: 15, 41: 15, 7: 15, 28: 15, 29: 15, 39: 0, 0: 15, 4: 15, 6: 15,
        26: 15, 3: 15, 1: 15, 5: 15, 24: 15, 12: 15, 17: 15, 13: 15, 14: 15, 15: 15,
        16: 15, 18: 15, 19: 15, 27: 15, 25: 25, 40: 15, 38: 15, 43: 15, 50: 0,
        36: 15, 30: 15, 47: 1, 10: 15, 11: 15, 8: 15, 22: 15, 23: 15, 34: 15,
        32: 15, 9: 15, 37: 15, 33:15, 20:15, 21:15, 35: 15, 42: 15, 48: 15, 49: 15

    };

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const tileIndex = wfcGrid[y][x].tileIndex !== undefined ? wfcGrid[y][x].tileIndex! : 0;
            graphicalMap.push(tileIndex);
            collisionMap.push(collisionValues[tileIndex] || 0);
        }
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            let currentCollisionValue = collisionMap[y * columns + x];
            if (currentCollisionValue === 13 || currentCollisionValue === 14 || currentCollisionValue === 15) {
                if (y + 1 < rows && skyTiles.includes(graphicalMap[(y + 1) * columns + x])) {
                    if (currentCollisionValue !== 15) collisionMap[y * columns + x] = 14;
                } else {
                    collisionMap[y * columns + x] = 11;
                }
            }
        }
    }

    return { graphical_map: graphicalMap, collision_map: collisionMap };
}

function seededRandom(seed: number) {
    let currentSeed = seed;
    return function () {
        currentSeed = (1664525 * currentSeed + 1013904223) % Math.pow(2, 32);
        return currentSeed / Math.pow(2, 32);
    } as () => number;
}

function shuffleArray<T>(array: T[]) {
    if (!array || !Array.isArray(array)) return;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function generateLevel(
    columns: number, rows: number, possibleTileIndices: number[], 
    seed: number | undefined, tileProbabilities: { [tileIndex: number]: number } | undefined, 
    isFirstLevel: boolean, entryDirection: 'left' | 'right' = 'right'
): LevelData {
    
    const MAX_RETRIES = 50; 
    let attempt = 0;
    let currentSeed = seed !== undefined ? seed : Math.floor(Math.random() * 1000000);
    let bestLevel: LevelData | null = null;
    let lastPathForward: any = null;
    let lastPathBackward: any = null;

    while (attempt <= MAX_RETRIES) {
        const levelData = generateWFCMap(columns, rows, possibleTileIndices, currentSeed, tileProbabilities, isFirstLevel);
        bestLevel = levelData;

        let startX = 2; 
        let startY = 3; 
        let targetX = -1;
        let targetY = -1;

        if (isFirstLevel) {
            if (levelData.door_positions.right) {
                targetX = levelData.door_positions.right.x;
                targetY = levelData.door_positions.right.y;
            }
        } else {
            if (entryDirection === 'right' && levelData.door_positions.left && levelData.door_positions.right) {
                startX = levelData.door_positions.left.x + 1;
                startY = levelData.door_positions.left.y;
                targetX = levelData.door_positions.right.x;
                targetY = levelData.door_positions.right.y;
            } else if (entryDirection === 'left' && levelData.door_positions.right && levelData.door_positions.left) {
                startX = levelData.door_positions.right.x - 1;
                startY = levelData.door_positions.right.y;
                targetX = levelData.door_positions.left.x;
                targetY = levelData.door_positions.left.y;
            }
        }

        if (targetX !== -1 && startX >= 0) {
            // maxJumpHeight zurück auf 2 korrigiert
            const pathForward = findPlatformerPath(startX, startY, targetX, targetY, levelData.collision_map, columns, rows, 2);
            const pathBackward = findPlatformerPath(targetX, targetY, startX, startY, levelData.collision_map, columns, rows, 2);
            
            lastPathForward = pathForward;
            lastPathBackward = pathBackward;

            if (pathForward !== null && pathBackward !== null) {
                console.log(`[Validation] Level erfolgreich bidirektional validiert nach ${attempt} Re-Rolls!`);
                levelData.debug_path_forward = pathForward;
                levelData.debug_path_backward = pathBackward;
                return levelData;
            } else {
                if (pathForward === null) {
                    console.warn(`[Validation] Kein Hinweg zur Tür gefunden (Versuch ${attempt + 1}/${MAX_RETRIES + 1}).`);
                } else if (pathBackward === null) {
                    console.warn(`[Validation] Hinweg gefunden, aber kein Rückweg! Softlock-Falle erkannt. (Versuch ${attempt + 1}/${MAX_RETRIES + 1}).`);
                }
            }
        }

        attempt++;
        currentSeed += 999; 
    }

    console.warn("[Validation] SOFT VALIDATION: Maximale Versuche erreicht. Nutze unzugängliches Level als Fallback.");
    if (bestLevel) {
        bestLevel.debug_path_forward = lastPathForward || undefined;
        bestLevel.debug_path_backward = lastPathBackward || undefined;
    }
    return bestLevel!;
}