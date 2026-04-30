// Dateiname: reachability.ts
// Pfad: app/components/catcrime-component/validation/reachability.ts

export interface Point {
    x: number;
    y: number;
}

interface PathNode {
    x: number;
    y: number;
    jumpEnergy: number; 
    g: number; 
    h: number; 
    f: number; 
    parent: PathNode | null;
}

export function findPlatformerPath(
    startX: number, startY: number,
    targetX: number, targetY: number,
    collisionMap: number[], columns: number, rows: number,
    maxJumpHeight: number = 2
): Point[] | null {
    
    // Prüft, ob ein Tile massiv ist (Kollision ungleich 0)
    const isSolid = (x: number, y: number) => {
        if (x < 0 || x >= columns || y < 0 || y >= rows) return true; 
        return collisionMap[y * columns + x] !== 0;
    };

    const getHeuristic = (x: number, y: number) => Math.abs(targetX - x) + Math.abs(targetY - y);

    const getStateKey = (x: number, y: number, energy: number) => `${x},${y},${energy}`;

    const openList: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: PathNode = {
        x: startX, y: startY, jumpEnergy: maxJumpHeight,
        g: 0, h: getHeuristic(startX, startY), f: 0, parent: null
    };
    
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    while (openList.length > 0) {
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift()!;

        // Ziel-Tür erreicht?
        if (current.x === targetX && Math.abs(current.y - targetY) <= 1) {
            const path: Point[] = [];
            let curr: PathNode | null = current;
            while (curr !== null) {
                path.unshift({ x: curr.x, y: curr.y });
                curr = curr.parent;
            }
            return path;
        }

        const stateKey = getStateKey(current.x, current.y, current.jumpEnergy);
        if (closedSet.has(stateKey)) continue;
        closedSet.add(stateKey);

        const isGrounded = isSolid(current.x, current.y + 1);
        let currentEnergy = isGrounded ? maxJumpHeight : current.jumpEnergy;

        const moves: {dx: number, dy: number, cost: number, energyCost: number}[] = [];

        // 1. Bewegungen am Boden
        if (isGrounded) {
            moves.push({ dx: -1, dy: 0, cost: 1, energyCost: 0 }); // Laufen Links
            moves.push({ dx: 1, dy: 0, cost: 1, energyCost: 0 });  // Laufen Rechts
            moves.push({ dx: 0, dy: 1, cost: 1, energyCost: 0 });  // Kante runterfallen
        } 
        // 2. Bewegungen im Fallen
        else {
            moves.push({ dx: 0, dy: 1, cost: 1, energyCost: 0 });    // Gerade fallen
            moves.push({ dx: -1, dy: 1, cost: 1.4, energyCost: 0 }); // Diagonal fallen (Links)
            moves.push({ dx: 1, dy: 1, cost: 1.4, energyCost: 0 });  // Diagonal fallen (Rechts)
        }

        // 3. Bewegungen für den Sprung (aufwärts), solange Energie da ist
        if (currentEnergy > 0) {
            moves.push({ dx: 0, dy: -1, cost: 1, energyCost: 1 });    // Gerade hoch springen
            moves.push({ dx: -1, dy: -1, cost: 1.4, energyCost: 1 }); // Diagonal springen (Links)
            moves.push({ dx: 1, dy: -1, cost: 1.4, energyCost: 1 });  // Diagonal springen (Rechts)
        }

        for (const move of moves) {
            const nx = current.x + move.dx;
            const ny = current.y + move.dy;

            // Ist das Zielfeld massiv?
            if (isSolid(nx, ny)) continue;

            // ==========================================
            // DER FIX: KUGELSICHERES CORNER-CLIPPING
            // ==========================================
            if (move.dx !== 0 && move.dy !== 0) {
                // Bei jeder diagonalen Bewegung MÜSSEN die beiden angrenzenden orthogonalen Felder geprüft werden.
                const blockX = isSolid(current.x + move.dx, current.y);
                const blockY = isSolid(current.x, current.y + move.dy);
                
                // Wenn auch nur eines der beiden Felder in der Ecke massiv ist, passt die Katze nicht durch!
                if (blockX || blockY) {
                    continue; 
                }
            }

            let nextEnergy = currentEnergy - move.energyCost;

            // Wenn die Schwerkraft zuschlägt (Bewegung nach unten), geht alle Sprungkraft sofort verloren
            if (move.dy > 0) {
                nextEnergy = 0;
            }

            // Wenn man vom Boden geradeaus in die Luft läuft (Kante), verliert man den Sprung
            if (isGrounded && move.dy === 0) {
                if (!isSolid(nx, ny + 1)) {
                    nextEnergy = 0; 
                }
            }

            if (nextEnergy < 0) nextEnergy = 0;

            const neighborKey = getStateKey(nx, ny, nextEnergy);
            if (closedSet.has(neighborKey)) continue;

            const gScore = current.g + move.cost;
            const existingNode = openList.find(n => n.x === nx && n.y === ny && n.jumpEnergy === nextEnergy);
            if (existingNode && gScore >= existingNode.g) continue;

            const neighborNode: PathNode = {
                x: nx, y: ny, jumpEnergy: nextEnergy,
                g: gScore,
                h: getHeuristic(nx, ny),
                f: gScore + getHeuristic(nx, ny),
                parent: current
            };

            if (!existingNode) {
                openList.push(neighborNode);
            } else {
                existingNode.g = neighborNode.g;
                existingNode.f = neighborNode.f;
                existingNode.parent = neighborNode.parent;
            }
        }
    }

    return null;
}