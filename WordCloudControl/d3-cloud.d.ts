/**
 * Minimal ambient declaration for "d3-cloud" (v1.2.x).
 * The package exports a single factory function via CommonJS `module.exports`.
 * With esModuleInterop enabled, `import cloud from "d3-cloud"` provides
 * that function as the default import.
 */
declare module "d3-cloud" {
    interface Word {
        text?: string;
        font?: string;
        style?: string;
        weight?: string | number;
        rotate?: number;
        size?: number;
        padding?: number;
        x?: number;
        y?: number;
    }

    interface Cloud<T extends Word> {
        start(): Cloud<T>;
        stop(): Cloud<T>;

        timeInterval(): number;
        timeInterval(interval: number): Cloud<T>;

        words(): T[];
        words(words: T[]): Cloud<T>;

        size(): [number, number];
        size(size: [number, number]): Cloud<T>;

        font(): (datum: T, index: number) => string;
        font(font: string | ((datum: T, index: number) => string)): Cloud<T>;

        fontStyle(): (datum: T, index: number) => string;
        fontStyle(style: string | ((datum: T, index: number) => string)): Cloud<T>;

        fontWeight(): (datum: T, index: number) => string | number;
        fontWeight(weight: string | number | ((datum: T, index: number) => string | number)): Cloud<T>;

        rotate(): (datum: T, index: number) => number;
        rotate(rotate: number | ((datum: T, index: number) => number)): Cloud<T>;

        text(): (datum: T, index: number) => string;
        text(text: string | ((datum: T, index: number) => string)): Cloud<T>;

        fontSize(): (datum: T, index: number) => number;
        fontSize(size: number | ((datum: T, index: number) => number)): Cloud<T>;

        padding(): (datum: T, index: number) => number;
        padding(padding: number | ((datum: T, index: number) => number)): Cloud<T>;

        spiral(name: string): Cloud<T>;

        random(): Cloud<T>;
        random(fn: () => number): Cloud<T>;

        canvas(): Cloud<T>;
        canvas(fn: () => HTMLCanvasElement): Cloud<T>;

        on(type: "word", listener: (word: T) => void): Cloud<T>;
        on(
            type: "end",
            listener: (
                tags: T[],
                bounds: Array<{ x: number; y: number }>
            ) => void
        ): Cloud<T>;
        on(type: string, listener: (...args: unknown[]) => void): Cloud<T>;
    }

    // The package default export is the cloud factory function.
    function cloud<T extends Word>(): Cloud<T>;
    export default cloud;
}
