export interface WFCCell {
    possibleTiles: number[];
    collapsed: boolean;
    tileIndex?: number;
}

export interface WFCGridData {
    grid: WFCCell[][];
    allCells: { x: number; y: number }[];
}

export interface LevelDoorPosition {
    x: number;
    y: number;
    direction: 'left' | 'right';
}

export interface Point {
    x: number;
    y: number;
}

export interface LevelData {
    graphical_map: number[];
    collision_map: number[];
    door_positions: {
        left: LevelDoorPosition | null;
        right: LevelDoorPosition | null;
    };
    // DEBUG-Pfade hinzufügen
    debug_path_forward?: Point[];
    debug_path_backward?: Point[];
}