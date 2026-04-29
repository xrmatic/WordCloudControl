import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as d3 from "d3";
import cloud from "d3-cloud";

// ---------------------------------------------------------------------------
// Color palettes – ordered from most- to least-prominent so higher-frequency
// words pick up the first (typically darkest/most-saturated) colour.
// ---------------------------------------------------------------------------
const COLOR_PALETTES: Record<string, ReadonlyArray<string>> = {
    Rainbow:  ["#e41a1c", "#ff7f00", "#ffcc00", "#4daf4a", "#377eb8", "#984ea3", "#f781bf", "#a65628"],
    Blues:    ["#084594", "#2171b5", "#4292c6", "#6baed6", "#9ecae1", "#c6dbef"],
    Reds:     ["#67000d", "#a50f15", "#cb181d", "#ef3b2c", "#fb6a4a", "#fc9272", "#fcbba1"],
    Greens:   ["#005a32", "#238b45", "#41ab5d", "#74c476", "#a1d99b", "#c7e9c0"],
    Purples:  ["#3f007d", "#6a51a3", "#807dba", "#9e9ac8", "#bcbddc", "#dadaeb"],
    Warm:     ["#67000d", "#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf"],
    Cool:     ["#084081", "#0868ac", "#2b8cbe", "#4eb3d3", "#7bccc4", "#a8ddb5", "#ccebc5"],
};

// ---------------------------------------------------------------------------
// Font-family CSS values keyed by the manifest Enum names.
// ---------------------------------------------------------------------------
const FONT_FAMILIES: Record<string, string> = {
    Impact:      "Impact, Charcoal, sans-serif",
    Arial:       "Arial, Helvetica, sans-serif",
    Georgia:     "Georgia, 'Times New Roman', serif",
    TrebuchetMS: "'Trebuchet MS', Helvetica, sans-serif",
    Verdana:     "Verdana, Geneva, sans-serif",
    CourierNew:  "'Courier New', Courier, monospace",
};

// ---------------------------------------------------------------------------
// Internal word data shape used by the d3-cloud layout.
// ---------------------------------------------------------------------------
interface WordDatum {
    text: string;
    size: number;
    count: number;
    // Fields set by the layout algorithm:
    x?: number;
    y?: number;
    rotate?: number;
    font?: string;
    style?: string;
    weight?: string | number;
    padding?: number;
}

// ---------------------------------------------------------------------------
// PCF control implementation
// ---------------------------------------------------------------------------
export class WordCloudControl
    implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _container!: HTMLDivElement;
    private _svgWrapper!: HTMLDivElement;
    private _emptyMsg!: HTMLDivElement;
    private _resizeObserver: ResizeObserver | null = null;

    /** Cache the last context parameters so ResizeObserver can re-render. */
    private _lastParams: IInputs | null = null;

    // -----------------------------------------------------------------------
    // init – called once when the control is first attached to the DOM.
    // -----------------------------------------------------------------------
    public init(
        context: ComponentFramework.Context<IInputs>,
        _notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._container = container;
        this._container.classList.add("wcc-root");

        this._svgWrapper = document.createElement("div");
        this._svgWrapper.classList.add("wcc-svg-wrapper");
        this._container.appendChild(this._svgWrapper);

        this._emptyMsg = document.createElement("div");
        this._emptyMsg.classList.add("wcc-empty");
        this._emptyMsg.textContent = "No data to display. Bind the delimitedList property.";
        this._emptyMsg.style.display = "none";
        this._container.appendChild(this._emptyMsg);

        // Re-render whenever the container is resized.
        this._resizeObserver = new ResizeObserver(() => {
            if (this._lastParams) {
                this._render(this._lastParams);
            }
        });
        this._resizeObserver.observe(this._container);
    }

    // -----------------------------------------------------------------------
    // updateView – called whenever bound values or properties change.
    // -----------------------------------------------------------------------
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._lastParams = context.parameters;
        this._render(context.parameters);
    }

    // -----------------------------------------------------------------------
    // getOutputs – called after notifyOutputChanged().
    // -----------------------------------------------------------------------
    public getOutputs(): IOutputs {
        return {};
    }

    // -----------------------------------------------------------------------
    // destroy – teardown.
    // -----------------------------------------------------------------------
    public destroy(): void {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
    }

    // =======================================================================
    // Private helpers
    // =======================================================================

    private _render(params: IInputs): void {
        const rawText       = params.delimitedList.raw ?? "";
        const delimiter     = params.delimiter.raw      ?? ",";
        const palette       = params.colorPalette.raw   ?? "Rainbow";
        const fontKey       = params.fontFamily.raw     ?? "Impact";
        const minSize       = Math.max(1, params.minFontSize.raw ?? 12);
        const maxSize       = Math.max(minSize + 1, params.maxFontSize.raw ?? 72);

        const fontCss = FONT_FAMILIES[fontKey] ?? FONT_FAMILIES["Impact"];
        // d3-cloud accepts a plain font-family string (first element in the stack).
        const fontName = fontCss.split(",")[0].replace(/['"]/g, "").trim();

        const words = this._parseWords(rawText, delimiter, minSize, maxSize);

        if (words.length === 0) {
            this._svgWrapper.innerHTML = "";
            this._emptyMsg.style.display = "flex";
            return;
        }
        this._emptyMsg.style.display = "none";

        const width  = Math.max(100, this._container.offsetWidth);
        const height = Math.max(60,  this._container.offsetHeight);
        const colors = COLOR_PALETTES[palette] ?? COLOR_PALETTES["Rainbow"];

        // Build & start the layout; drawing happens in the "end" callback.
        cloud<WordDatum>()
            .size([width, height])
            .words(words)
            .padding(4)
            .rotate(() => (Math.round(Math.random() * 4) - 2) * 15)
            .font(fontName)
            .fontSize((d) => d.size)
            .on("end", (laid: WordDatum[]) => {
                this._draw(laid, width, height, colors, fontCss);
            })
            .start();
    }

    /** Parse delimited text → WordDatum[], sizes mapped to [minSize, maxSize]. */
    private _parseWords(
        raw: string,
        delimiter: string,
        minSize: number,
        maxSize: number
    ): WordDatum[] {
        if (!raw.trim()) return [];

        // Count word frequencies (case-insensitive key, original casing displayed).
        const freqMap = new Map<string, { display: string; count: number }>();
        raw.split(delimiter)
            .map((w) => w.trim())
            .filter((w) => w.length > 0)
            .forEach((w) => {
                const key = w.toLowerCase();
                if (freqMap.has(key)) {
                    freqMap.get(key)!.count++;
                } else {
                    freqMap.set(key, { display: w, count: 1 });
                }
            });

        if (freqMap.size === 0) return [];

        const counts  = Array.from(freqMap.values()).map((v) => v.count);
        const maxFreq = Math.max(...counts);
        const minFreq = Math.min(...counts);
        const freqRange = maxFreq === minFreq ? 1 : maxFreq - minFreq;

        return Array.from(freqMap.values()).map(({ display, count }) => {
            const norm = (count - minFreq) / freqRange;           // 0 … 1
            const size = Math.round(minSize + norm * (maxSize - minSize));
            return { text: display, size, count };
        });
    }

    /** Render the laid-out words into an SVG. */
    private _draw(
        words: WordDatum[],
        width: number,
        height: number,
        colors: ReadonlyArray<string>,
        fontCss: string
    ): void {
        // Clear previous render.
        this._svgWrapper.innerHTML = "";

        const svg = d3
            .select(this._svgWrapper)
            .append("svg")
            .attr("class", "wcc-svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("aria-label", "Word cloud visualization");

        const g = svg
            .append("g")
            .attr("class", "wcc-words")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        g.selectAll<SVGTextElement, WordDatum>("text")
            .data(words)
            .join("text")
            .attr("class", "wcc-word")
            .style("font-size",   (d) => `${d.size}px`)
            .style("font-family", fontCss)
            .style("fill",        (_, i) => colors[i % colors.length] as string)
            .attr("text-anchor",  "middle")
            .attr("transform",    (d) =>
                `translate(${d.x ?? 0},${d.y ?? 0}) rotate(${d.rotate ?? 0})`
            )
            .text((d) => d.text)
            .append("title")
            .text((d) => `${d.text} (${d.count})`);
    }
}
