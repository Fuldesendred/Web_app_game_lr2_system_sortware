import { describe, it, expect } from '@jest/globals';
import { createBoard, move, checkWin, checkGameOver } from './engine';
import type { Board } from './engine';

describe('createBoard', () => {
    it('должна создавать матрицу 4x4 из нулей', () => {
        const board = createBoard();
        expect(board.length).toBe(4);
        expect(board[0].length).toBe(4);
        expect(board.every(row => row.every(cell => cell === 0))).toBe(true);
    });
});

describe('move', () => {
    it('должна сдвигать плитки влево и сливать одинаковые', () => {
        const board: Board = [
            [2, 2, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        const result = move(board, 'left');
        expect(result.board[0]).toEqual([4, 0, 0, 0]);
        expect(result.score).toBe(4);
        expect(result.moved).toBe(true);
    });

    it('не должна менять доску, если ход невозможен', () => {
        const board: Board = [
            [2, 4, 8, 16],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        const result = move(board, 'left');
        expect(result.moved).toBe(false);
    });

    it('должна правильно сдвигать вправо', () => {
        const board: Board = [
            [2, 2, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        const result = move(board, 'right');
        expect(result.board[0]).toEqual([0, 0, 0, 4]);
    });
});

describe('checkWin', () => {
    it('должна возвращать true при наличии плитки 2048', () => {
        const board = createBoard();
        board[0][0] = 2048;
        expect(checkWin(board)).toBe(true);
    });

    it('должна возвращать false, если нет 2048', () => {
        const board = createBoard();
        board[0][0] = 1024;
        expect(checkWin(board)).toBe(false);
    });
});

describe('checkGameOver', () => {
    it('должна возвращать true, если нет ходов', () => {
        // Поле полностью заполнено, и ни одна соседняя пара плиток не совпадает.
        const board: Board = [
            [2, 4, 2, 4],
            [4, 2, 4, 2],
            [2, 4, 2, 4],
            [4, 2, 4, 2]
        ];
        expect(checkGameOver(board)).toBe(true);
    });

    it('должна возвращать false, если есть пустые клетки', () => {
        const board = createBoard();
        expect(checkGameOver(board)).toBe(false);
    });
});