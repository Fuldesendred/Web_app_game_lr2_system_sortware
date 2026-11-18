import type { Board } from '../game/engine';

/**
 * Фабрика DOM-элементов (паттерн «Фабрика»).
 * Позволяет централизованно создавать элементы с нужными классами и текстом, избавляя от дублирования кода.
 * @param tag Имя HTML-тега.
 * @param className CSS-класс элемента.
 * @param textContent Опциональный текстовый контент.
 * @returns Созданный DOM-элемент.
 */
function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className: string,
    textContent?: string
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    el.className = className;
    if (textContent !== undefined) {
        el.textContent = textContent;
    }
    return el;
}

/**
 * Отрисовывает интерфейс игры: заголовок, счёт, кнопки и игровое поле.
 * @param container Корневой элемент для монтирования.
 * @param board Текущее состояние игрового поля.
 * @param onRestart Колбэк для запуска новой игры.
 */
export function renderBoard(
    container: HTMLElement,
    board: Board,
    onRestart: () => void
): void {
    container.innerHTML = '';

    const header = createElement('div', 'header');
    const title = createElement('h1', '', '2048');
    const rightPanel = createElement('div', 'right-panel');

    const scores = createElement('div', 'scores');

    // Используем innerHTML для быстрой вставки статичной разметки блока счёта.
    const currentScore = createElement('div', 'score-box');
    currentScore.innerHTML = `<span>СЧЁТ</span><span id="score">0</span>`;

    const bestScore = createElement('div', 'score-box');
    bestScore.innerHTML = `<span>РЕКОРД</span><span id="best-score">0</span>`;

    scores.appendChild(currentScore);
    scores.appendChild(bestScore);

    const controls = createElement('div', 'controls');

    const restartBtn = createElement('button', 'btn-restart', 'Новая игра');
    restartBtn.addEventListener('click', onRestart);

    const statusBox = createElement('div', 'status-box hidden');
    statusBox.id = 'status-box';

    controls.appendChild(restartBtn);
    controls.appendChild(statusBox);

    rightPanel.appendChild(scores);
    rightPanel.appendChild(controls);

    header.appendChild(title);
    header.appendChild(rightPanel);

    const grid = createElement('div', 'board-grid');

    board.forEach(row => {
        row.forEach(cell => {
            const cellEl = createElement('div', 'cell');
            if (cell > 0) {
                cellEl.textContent = cell.toString();
                // Для значений больше 2048 применяем специальный класс 'super'.
                cellEl.classList.add(`tile-${cell > 2048 ? 'super' : cell}`);
            }
            grid.appendChild(cellEl);
        });
    });

    container.appendChild(header);
    container.appendChild(grid);
}

/**
 * Обновляет отображаемые значения счёта и рекорда.
 * @param score Текущий счёт.
 * @param best Лучший результат.
 */
export function updateScore(score: number, best: number): void {
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best-score');
    if (scoreEl) scoreEl.textContent = score.toString();
    if (bestEl) bestEl.textContent = best.toString();
}

/**
 * Показывает или скрывает баннер с результатом игры.
 * @param winner 'win' — победа, 'lose' — поражение, null — скрыть баннер.
 */
export function showResult(winner: 'win' | 'lose' | null): void {
    const statusBox = document.getElementById('status-box');
    if (!statusBox) return;

    // Сбрасываем все возможные классы перед установкой нового состояния.
    statusBox.className = 'status-box';

    if (winner === 'win') {
        statusBox.textContent = 'Победа!';
        statusBox.classList.add('win');
    } else if (winner === 'lose') {
        statusBox.textContent = 'Игра окончена';
        statusBox.classList.add('lose');
    } else {
        statusBox.textContent = '';
        statusBox.classList.add('hidden');
    }
}