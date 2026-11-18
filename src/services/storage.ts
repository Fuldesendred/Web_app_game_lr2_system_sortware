/**
 * Синглтон (паттерн «Одиночка») для работы с localStorage.
 * Использование ES6-модуля гарантирует, что экземпляр класса будет создан только один раз.
 */
class StorageService {
    /**
     * Читает значение из localStorage с приведением к заданному типу.
     * @param key Ключ хранилища.
     * @param defaultValue Значение по умолчанию, если ключ отсутствует или данные повреждены.
     * @returns Значение заданного типа.
     */
    public get<T>(key: string, defaultValue: T): T {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;

        try {
            return JSON.parse(item) as T;
        } catch {
            // Если данные в хранилище повреждены (невалидный JSON), возвращаем безопасное значение.
            return defaultValue;
        }
    }

    /**
     * Сохраняет значение в localStorage с сериализацией в JSON.
     * @param key Ключ хранилища.
     * @param value Значение для сохранения.
     */
    public set<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

// Экспортируем единственный экземпляр, который будет использоваться во всём приложении.
export const storage = new StorageService();