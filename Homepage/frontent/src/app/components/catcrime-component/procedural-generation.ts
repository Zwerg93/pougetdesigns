import { LevelData, LevelDoorPosition, Point } from "./generation/wfc-types";
import { findPlatformerPath } from "./validation/reachability";

// -------------------------------------------------------------------------
// 1. RAW GRID GENERATOR (Macro-Carvers)
// -------------------------------------------------------------------------

// Carver A: Der klassische Wurm (Organische Tunnel)
function carveWorm(grid: number[][], columns: number, rows: number, prng: () => number) {
    let currentY = Math.floor(rows / 2);
    let targetY = currentY;
    let radius = 2;

    for (let x = 1; x < columns - 1; x++) {
        if (currentY < targetY) currentY += 0.8;
        else if (currentY > targetY) currentY -= 0.8;

        if (prng() < 0.35) {
            const shift = Math.floor(prng() * 5) - 2;
            targetY = Math.max(3, Math.min(rows - 4, Math.floor(currentY) + shift));
        }

        if (prng() < 0.2) radius = prng() < 0.5 ? 2 : 3;

        const cyInt = Math.floor(currentY);
        for (let y = cyInt - radius; y <= cyInt + radius; y++) {
            for (let cx = x - 1; cx <= x + 1; cx++) {
                if (y >= 1 && y < rows - 1 && cx >= 1 && cx < columns - 1) {
                    if (Math.abs(cx - x) + Math.abs(y - cyInt) <= radius) {
                        grid[y][cx] = 0; // Luft
                    }
                }
            }
        }
    }
}

// Carver B: Die offene Höhle (Großer Raum mit schwebenden Plattformen)
function carveOpenCavern(grid: number[][], columns: number, rows: number, prng: () => number) {
    // Höhle komplett aushöhlen (bis auf Ränder)
    for (let y = 2; y < rows - 2; y++) {
        for (let x = 2; x < columns - 2; x++) {
            grid[y][x] = 0; // Alles Luft
        }
    }

    // Boden uneben machen
    for (let x = 1; x < columns - 1; x++) {
        if (prng() < 0.5) grid[rows - 2][x] = 0; 
        if (prng() < 0.2) grid[rows - 3][x] = 1; // Kleine Hügel
    }

    // Zufällige schwebende Plattformen generieren
    const numPlatforms = Math.floor(prng() * 3) + 2; // 2 bis 4 Plattformen
    for(let i = 0; i < numPlatforms; i++) {
        const platWidth = Math.floor(prng() * 3) + 2; // 2 bis 4 Blöcke breit
        const startX = Math.floor(prng() * (columns - 6)) + 2;
        const startY = Math.floor(prng() * (rows - 5)) + 2; // In der mittleren/oberen Höhe

        for(let px = 0; px < platWidth; px++) {
            grid[startY][startX + px] = 1;
        }
    }
}


function generateRawGrid(columns: number, rows: number, prng: () => number): number[][] {
    const grid = Array.from({ length: rows }, () => Array(columns).fill(1)); // 1 = Erde

    // Zufällig ein Level-Theme / Layout wählen
    const layoutType = prng();
    if (layoutType < 0.5) {
        carveWorm(grid, columns, rows, prng);
    } else {
        carveOpenCavern(grid, columns, rows, prng);
    }

    // Organisches Terrain verfeinern (Boden/Decken Details)
    for (let x = 1; x < columns - 1; x++) {
        if (prng() < 0.3) {
            for (let y = rows - 2; y > 1; y--) {
                if (grid[y][x] === 1 && grid[y - 1][x] === 0) {
                    grid[y - 1][x] = 1; 
                    break;
                }
            }
        }
    }

    // Garantierten Platz für Türen freiräumen
    for (let y = 2; y < rows - 2; y++) {
        if (grid[y][2] === 0) { grid[y][1] = 0; grid[y][0] = 0; }
        if (grid[y][columns - 3] === 0) { grid[y][columns - 2] = 0; grid[y][columns - 1] = 0; }
    }

    // Sicherheits-Grenzen oben und unten
    for (let x = 0; x < columns; x++) {
        grid[0][x] = 1; 
        grid[rows - 1][x] = 1; 
    }

    return grid;
}

// -------------------------------------------------------------------------
// 2. AUTO-TILING (4-Bit Bitmasking Architektur)
// -------------------------------------------------------------------------

const TILE_MAP: Record<number, number> = {
    0:  1,   // 0000: Schwebender Block
    1:  17,  // 0001: N - Unteres Ende einer Säule
    2:  2,   // 0010: W - Gras rechtes Ende
    3:  18,  // 0011: N+W - Ecke Unten-Rechts
    4:  0,   // 0100: E - Gras linkes Ende
    5:  16,  // 0101: N+E - Ecke Unten-Links
    6:  1,   // 0110: W+E - Schwebende Plattform Mitte
    7:  17,  // 0111: N+W+E - Unterseite einer Decke
    8:  1,   // 1000: S - Oberes Ende einer Säule
    9:  9,   // 1001: N+S - Vertikale Säule Mitte
    10: 2,   // 1010: W+S - Gras rechte Ecke
    11: 10,  // 1011: N+W+S - Rechte Wand
    12: 0,   // 1100: E+S - Gras linke Ecke
    13: 8,   // 1101: N+E+S - Linke Wand
    14: 1,   // 1110: W+E+S - Gras Oberfläche Mitte
    15: 9    // 1111: Tiefe Erde
};

const INNER_CORNER_TOP_LEFT = 4;     
const INNER_CORNER_TOP_RIGHT = 3;    
const INNER_CORNER_BOTTOM_LEFT = 12; 
const INNER_CORNER_BOTTOM_RIGHT = 11;

function applyAutoTiling(grid: number[][], columns: number, rows: number): { graphical_map: number[], collision_map: number[] } {
    const graphical_map: number[] = [];
    const collision_map: number[] = [];
    const TILE_SKY = 31;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            if (grid[y][x] === 0) {
                graphical_map.push(TILE_SKY);
                collision_map.push(0); 
            } else {
                let mask = 0;
                const isSolid = (cx: number, cy: number) => {
                    if (cx < 0 || cx >= columns || cy < 0 || cy >= rows) return 1;
                    return grid[cy][cx];
                };

                if (isSolid(x, y - 1) === 1) mask += 1; // Nord
                if (isSolid(x - 1, y) === 1) mask += 2; // West
                if (isSolid(x + 1, y) === 1) mask += 4; // Ost
                if (isSolid(x, y + 1) === 1) mask += 8; // Süd

                let tileId = TILE_MAP[mask] !== undefined ? TILE_MAP[mask] : 9;

                if (mask === 15) {
                    const nw = isSolid(x - 1, y - 1);
                    const ne = isSolid(x + 1, y - 1);
                    const sw = isSolid(x - 1, y + 1);
                    const se = isSolid(x + 1, y + 1);

                    if (nw === 0) tileId = INNER_CORNER_BOTTOM_RIGHT;
                    else if (ne === 0) tileId = INNER_CORNER_BOTTOM_LEFT;
                    else if (sw === 0) tileId = INNER_CORNER_TOP_RIGHT;
                    else if (se === 0) tileId = INNER_CORNER_TOP_LEFT;
                }

                graphical_map.push(tileId);
                collision_map.push(15); 
            }
        }
    }
    return { graphical_map, collision_map };
}

// -------------------------------------------------------------------------
// 3. DECORATION PASS (Polish)
// -------------------------------------------------------------------------
function applyDecorations(graphical_map: number[], collision_map: number[], columns: number, rows: number, prng: () => number) {
    const TILE_SKY = 31;
    // Angenommene Deko-Tiles aus deinem Sheet (Gräser/Blumen ohne Kollision)
    // Ersetze diese IDs später durch echte Blumen/Steine aus deinem Sprite Sheet!
    const DECO_FLOWER = -1; 
    const DECO_GRASS = -1;  

    for (let y = 1; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const currentIndex = y * columns + x;
            const aboveIndex = (y - 1) * columns + x;

            // Wenn der aktuelle Block eine Gras-Oberfläche ist (Tile ID 1)
            // UND der Block darüber Himmel/Luft ist (Tile ID 31)
            if (graphical_map[currentIndex] === 1 && graphical_map[aboveIndex] === TILE_SKY) {
                
                // 15% Chance auf Deko
                if (prng() < 0.15) {
                    const decoTile = prng() < 0.5 ? DECO_FLOWER : DECO_GRASS;
                    
                    graphical_map[aboveIndex] = decoTile;
                    // WICHTIG: Deko hat keine Kollision!
                    collision_map[aboveIndex] = 0; 
                }
            }
        }
    }
}


// Hilfsfunktion: Türen in der Höhle intelligent finden
function findDoorPosition(grid: number[][], col: number, rows: number, direction: 'left' | 'right'): LevelDoorPosition | null {
    let bestY = -1;
    let maxAir = 0;

    for (let y = 1; y < rows; y++) {
        if (grid[y][col] === 1 && grid[y - 1][col] === 0) {
            let airCount = 0;
            for(let checkY = y - 1; checkY >= 0; checkY--) {
                if(grid[checkY][col] === 0) airCount++;
                else break;
            }
            if (airCount > maxAir) {
                maxAir = airCount;
                bestY = y - 1;
            }
        }
    }
    
    if (bestY !== -1) {
        return { x: col, y: bestY, direction: direction };
    }
    return null;
}

function seededRandom(seed: number) {
    let currentSeed = seed;
    return function () {
        currentSeed = (1664525 * currentSeed + 1013904223) % Math.pow(2, 32);
        return currentSeed / Math.pow(2, 32);
    };
}

// -------------------------------------------------------------------------
// 4. MAIN GENERATOR
// -------------------------------------------------------------------------
export function generateLevel(
    columns: number, rows: number, possibleTileIndices: number[], 
    seed: number | undefined, tileProbabilities: { [tileIndex: number]: number } | undefined, 
    isFirstLevel: boolean, entryDirection: 'left' | 'right' = 'right'
): LevelData {
    const MAX_RETRIES = 30; 
    let attempt = 0;
    let currentSeed = seed !== undefined ? seed : Math.floor(Math.random() * 1000000);
    
    let bestLevel: LevelData | null = null;

    while (attempt <= MAX_RETRIES) {
        const prng = seededRandom(currentSeed);
        
        // 1. Raw Grid generieren (Wurm oder Höhle)
        const rawGrid = generateRawGrid(columns, rows, prng);
        
        // 2. Auto Tiling anwenden
        const { graphical_map, collision_map } = applyAutoTiling(rawGrid, columns, rows);

        // 3. Dekorationen hinzufügen (NEU!)
        applyDecorations(graphical_map, collision_map, columns, rows, prng);

        let leftDoorPosition = null;
        let rightDoorPosition = null;

        if (isFirstLevel) {
            rightDoorPosition = findDoorPosition(rawGrid, columns - 1, rows, 'right');
        } else {
            leftDoorPosition = findDoorPosition(rawGrid, 0, rows, 'left');
            rightDoorPosition = findDoorPosition(rawGrid, columns - 1, rows, 'right');
        }

        const TILE_DOOR = 50; 

        if (leftDoorPosition) {
            const idx = leftDoorPosition.y * columns + leftDoorPosition.x;
            graphical_map[idx] = TILE_DOOR;
            collision_map[idx] = 0; 
        }
        if (rightDoorPosition) {
            const idx = rightDoorPosition.y * columns + rightDoorPosition.x;
            graphical_map[idx] = TILE_DOOR;
            collision_map[idx] = 0; 
        }

        const levelData: LevelData = {
            graphical_map,
            collision_map,
            door_positions: { left: leftDoorPosition, right: rightDoorPosition }
        };

        bestLevel = levelData;

        let startX = -1, startY = -1, targetX = -1, targetY = -1;

        if (isFirstLevel && rightDoorPosition) {
            startX = 1; 
            for (let y = 1; y < rows; y++) {
                if (rawGrid[y][startX] === 1) { startY = y - 1; break; }
            }
            targetX = rightDoorPosition.x; targetY = rightDoorPosition.y;
        } else if (leftDoorPosition && rightDoorPosition) {
            if (entryDirection === 'right') {
                startX = leftDoorPosition.x + 1; startY = leftDoorPosition.y;
                targetX = rightDoorPosition.x; targetY = rightDoorPosition.y;
            } else {
                startX = rightDoorPosition.x - 1; startY = rightDoorPosition.y;
                targetX = leftDoorPosition.x; targetY = leftDoorPosition.y;
            }
        }

        if (startX >= 0 && targetX >= 0 && startY >= 0) {
            const pathForward = findPlatformerPath(startX, startY, targetX, targetY, collision_map, columns, rows, 2);

            if (pathForward) {
                console.log(`[Validation] Höhle spielbar nach ${attempt + 1} Versuchen!`);
                levelData.debug_path_forward = pathForward;
                return levelData;
            }
        }

        attempt++;
        currentSeed += 999;
    }

    console.warn("[Validation] Keine perfekten Wege gefunden. Nutze Fallback.");
    return bestLevel!;
}