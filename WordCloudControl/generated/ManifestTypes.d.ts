// Auto-generated manifest types for the WordCloudControl PCF control.
// Do NOT edit manually — regenerate with: npm run refreshTypes

export type colorPaletteType =
    | "Rainbow"
    | "Blues"
    | "Reds"
    | "Greens"
    | "Purples"
    | "Warm"
    | "Cool";

export type fontFamilyType =
    | "Impact"
    | "Arial"
    | "Georgia"
    | "TrebuchetMS"
    | "Verdana"
    | "CourierNew";

export interface IInputs {
    /** The delimited list of words/phrases to display in the word cloud */
    delimitedList: ComponentFramework.PropertyTypes.StringProperty;
    /** The delimiter character used to split the list (default: ",") */
    delimiter: ComponentFramework.PropertyTypes.StringProperty;
    /** The color palette to use for rendering words */
    colorPalette: ComponentFramework.PropertyTypes.EnumProperty<colorPaletteType>;
    /** The font family to use for rendering words */
    fontFamily: ComponentFramework.PropertyTypes.EnumProperty<fontFamilyType>;
    /** The minimum font size in pixels (default: 12) */
    minFontSize: ComponentFramework.PropertyTypes.WholeNumberProperty;
    /** The maximum font size in pixels (default: 72) */
    maxFontSize: ComponentFramework.PropertyTypes.WholeNumberProperty;
}

export interface IOutputs {
    delimitedList?: string;
}
