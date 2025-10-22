export interface Enum {
    values: () => string[];
}

export class Enumeration<T> {
    public static builder<T>(definition: T): T & Enum {
        const enumObject = { ...definition };

        (enumObject as any).values = function () {
            return Object.values(definition as any);
        };

        return Object.freeze(enumObject) as any;
    }
}
