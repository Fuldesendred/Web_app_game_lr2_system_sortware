/**
 * Игровая логика «2048» в виде чистых функций.
 * Модуль не импортирует DOM-типы, что позволяет тестировать его в изоляции через Jest.
 */

export type Board = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';
export const SIZE = 4;

export interface MoveResult {
    board: Board;
    score: number;
    moved: boolean;
}

/**
 * Создаёт пустое игровое поле 4x4, заполненное нулями.
 * @returns Двумерный массив 4x4 с нулями.
 */
export function createBoard(): Board {
    return Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));
}

/**
 * Добавляет случайную плитку (2 или 4) в случайную пустую ячейку.
 * Используется генератор случайных чисел, поэтому функция не является чистой.
 * @param board Текущее состояние поля.
 * @returns Новое поле с добавленной плиткой или исходное, если пустых ячеек нет.
 */
export function addRandomTile(board: Board): Board {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) emptyCells.push({ r, c });
        }
    }

    if (emptyCells.length === 0) return board;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map(row => [...row]);
    // Согласно классическим правилам 2048, вероятность выпадения 2 составляет 90%, а 4 — 10%.
    newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;

    return newBoard;
}

/**
 * Транспонирует матрицу (меняет строки и столбцы местами).
 * Необходима для того, чтобы свести все направления свайпов к одному алгоритму сдвига влево.
 * @param board Исходное поле.
 * @returns Транспонированное поле.
 */
function transpose(board: Board): Board {
    return board[0].map((_, c) => board.map(row => row[c]));
}

/**
 * Выполняет сдвиг и слияние одной строки влево.
 * @param row Исходная строка.
 * @returns Объект с новой строкой и количеством начисленных очков.
 */
function slideRowLeft(row: number[]): { newRow: number[]; score: number } {
    // Убираем нули, чтобы плитки «схлопнулись» влево.
    const filtered = row.filter(val => val !== 0);
    const newRow: number[] = [];
    let score = 0;

    for (let i = 0; i < filtered.length; i++) {
        // Если текущая плитка равна следующей, они сливаются в одну с удвоенным номиналом.
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            const merged = filtered[i] * 2;
            newRow.push(merged);
            score += merged;
            i++; // Пропускаем следующую плитку, так как она уже участвовала в слиянии.
        } else {
            newRow.push(filtered[i]);
        }
    }

    // Добиваем строку нулями до исходной длины.
    while (newRow.length < SIZE) {
        newRow.push(0);
    }

    return { newRow, score };
}

/**
 * Выполняет ход в заданном направлении.
 * Использует иммутабельный подход: исходная доска не изменяется.
 * @param board Текущее состояние поля.
 * @param direction Направление свайпа.
 * @returns Объект с новым полем, начисленными очками и флагом изменения поля.
 */
export function move(board: Board, direction: Direction): MoveResult {
    let newBoard = board.map(row => [...row]);
    let totalScore = 0;
    let moved = false;

    // Для вертикальных свайпов транспонируем доску, чтобы использовать единый алгоритм сдвига влево.
    const getRows = (b: Board): number[][] => {
        if (direction === 'up' || direction === 'down') return transpose(b);
        return b;
    };

    const rows = getRows(newBoard);
    const newRows: number[][] = [];

    for (let r = 0; r < SIZE; r++) {
        const row = [...rows[r]];

        // Для сдвига вправо и вниз разворачиваем строку, чтобы снова свести всё к сдвигу влево.
        if (direction === 'right' || direction === 'down') {
            row.reverse();
        }

        const { newRow, score } = slideRowLeft(row);
        const processedRow = newRow;

        // Возвращаем строку в исходное положение после сдвига.
        if (direction === 'right' || direction === 'down') {
            processedRow.reverse();
        }

        // Если строка изменилась, значит, ход был возможен.
        if (JSON.stringify(processedRow) !== JSON.stringify(rows[r])) {
            moved = true;
        }

        totalScore += score;
        newRows.push(processedRow);
    }

    newBoard = newRows;
    if (direction === 'up' || direction === 'down') {
        newBoard = transpose(newBoard);
    }

    return { board: newBoard, score: totalScore, moved };
}

/**
 * Проверяет, достиг ли игрок победы (есть ли плитка номиналом 2048 или больше).
 * @param board Текущее поле.
 * @returns true, если победа достигнута.
 */
export function checkWin(board: Board): boolean {
    return board.some(row => row.some(cell => cell >= 2048));
}

/**
 * Проверяет, закончилась ли игра поражением (нет доступных ходов).
 * @param board Текущее поле.
 * @returns true, если больше нет ходов.
 */
export function checkGameOver(board: Board): boolean {
    // Игра продолжается, если есть пустые клетки.
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) return false;
        }
    }

    // Проверяем возможность слияния с соседями по горизонтали и вертикали.
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const val = board[r][c];
            if (c < SIZE - 1 && val === board[r][c + 1]) return false;
            if (r < SIZE - 1 && val === board[r + 1][c]) return false;
        }
    }

    return true;
}