import { TLBaseShape, TLDefaultColorStyle } from "@tldraw/tldraw";

// A type for our custom card shape
export type ICardShape = TLBaseShape<
    "card",
    {
        w: number;
        h: number;
        color: TLDefaultColorStyle;
        text: string;
        isComplete: boolean;
    }
>;
