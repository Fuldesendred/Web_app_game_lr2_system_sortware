import './style.css';
import { createBoard, addRandomTile, move, checkWin, checkGameOver } from './game/engine';
import type { Board, Direction } from './game/engine';
import { renderBoard, updateScore, showResult } from './ui/renderer';
import { storage } from './services/storage';
import { withLogging } from './utils/decorators';

interface AppState {
    board: Board;
    score: number;
    bestScore: number;
    gameOver: boolean;
    won: boolean;
}

let state: AppState = {
    board: [],
    score: 0,
    // Используем синглтон StorageService для получения сохранённого рекорда.
    bestScore: storage.get<number>('2048_best_score', 0),
    gameOver: false,
    won: false,
};

const appContainer = document.getElementById('app');
if (!appContainer) throw new Error('Контейнер #app не найден');

/**
 * Сбрасывает состояние игры и запускает новую партию.
 */
function initGame(): void {
    let board = createBoard();
    board = addRandomTile(board);
    board = addRandomTile(board);

    state = {
        ...state,
        board,
        score: 0,
        gameOver: false,
        won: false,
    };

    render();
    showResult(null);
}

// Оборачиваем функцию хода в декоратор для отладки (паттерн «Декоратор»).
const loggedMove = withLogging(move, 'engine.move');

/**
 * Обрабатывает ход игрока.
 * @param direction Направление свайпа.
 */
function handleMove(direction: Direction): void {
    if (state.gameOver || state.won) return;

    const result = loggedMove(state.board, direction);

    if (result.moved) {
        const newBoard = addRandomTile(result.board);
        state.board = newBoard;
        state.score += result.score;

        if (state.score > state.bestScore) {
            state.bestScore = state.score;
            storage.set('2048_best_score', state.bestScore);
        }

        if (checkWin(newBoard) && !state.won) {
            state.won = true;
            showResult('win');
        } else if (checkGameOver(newBoard)) {
            state.gameOver = true;
            showResult('lose');
        }

        render();
    }
}

/**
 * Синхронизирует DOM с текущим состоянием игры.
 */
function render(): void {
    renderBoard(appContainer!, state.board, initGame);
    updateScore(state.score, state.bestScore);

    // Восстанавливаем баннер результата, если он был активен до перерисовки.
    if (state.won) showResult('win');
    else if (state.gameOver) showResult('lose');
}

// Используем `as const` для точного вывода типов клавиш (Лекция 12).
const KEY_MAP = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right',
} as const;

type KeyMapKeys = keyof typeof KEY_MAP;

document.addEventListener('keydown', (e: KeyboardEvent) => {
    // Оператор `in` работает как type guard для сужения типа ключа.
    if (e.key in KEY_MAP) {
        e.preventDefault();
        const direction = KEY_MAP[e.key as KeyMapKeys];
        handleMove(direction);
    }
});

initGame();