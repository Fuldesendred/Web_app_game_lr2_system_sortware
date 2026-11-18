/**
 * Функциональный декоратор (паттерн «Декоратор») для логирования вызовов функций.
 * Оборачивает целевую функцию, выводя аргументы и результат в консоль, не меняя её поведение.
 * @param fn Оборачиваемая функция.
 * @param label Метка для идентификации вызова в логах.
 * @returns Обёрнутая функция с тем же типом, что и оригинал.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withLogging<T extends (...args: any[]) => any>(
    fn: T,
    label: string
): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
        console.log(`[${label}] Вызов с аргументами:`, ...args);
        const result = fn(...args);
        console.log(`[${label}] Результат:`, result);
        return result;
    }) as T;
}