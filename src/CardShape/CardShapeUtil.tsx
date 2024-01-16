import {
    HTMLContainer,
    Rectangle2d,
    ShapeUtil,
    TLOnResizeHandler,
    // getDefaultColorTheme,
    resizeBox,
} from "@tldraw/tldraw";
// import { useState } from "react";
import Markdown from "markdown-to-jsx";
import {
    TableHead,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
} from "@tremor/react";
import MarkdownStyleContainer from "./containers/MarkdownStyleContainer";
import ListComponent from "./containers/ListComponent";
import OrderedListComponent from "./containers/OrderedListComponent";
import TableContainer from "./containers/TableContainer";
import PreBlock from "./containers/CodeComponent";

import { cardShapeMigrations } from "./card-shape-migrations";
import { cardShapeProps } from "./card-shape-props";
import { ICardShape } from "./card-shape-types";

const specialToken = "_";
const preprocessMarkdown = (markdown: string) => {
    // Replace special tokens
    let processedMarkdown = markdown.replace(/__/g, specialToken);

    // // Add two new lines before any code block (```), if they don't already exist
    // processedMarkdown = processedMarkdown.replace(/(^|\n)(```)/g, (match, p1, p2) => {
    //     return p1.endsWith('\n\n') ? match : `${p1}\n\n${p2}`;
    // });
    // Matches a colon ":", followed by any number of whitespaces, newlines, or tabs "\\s*", and then "```"
    processedMarkdown = processedMarkdown.replace(/:\s*```/g, ":\n\n```");

    // Replace ":\n|" with ":\n\n|"
    processedMarkdown = processedMarkdown.replace(/:\n\|/g, ":\n\n|");

    return processedMarkdown;
};

// There's a guide at the bottom of this file!

export class CardShapeUtil extends ShapeUtil<ICardShape> {
    static override type = "card" as const;
    // [1]
    static override props = cardShapeProps;
    // [2]
    static override migrations = cardShapeMigrations;

    // [3]
    override isAspectRatioLocked = (_shape: ICardShape) => false;
    override canResize = (_shape: ICardShape) => true;
    override canBind = (_shape: ICardShape) => true;

    // [4]
    getDefaultProps(): ICardShape["props"] {
        return {
            w: 600,
            h: 300,
            color: "black",
            text: "",
        };
    }

    // [5]
    getGeometry(shape: ICardShape) {
        return new Rectangle2d({
            width: shape.props.w,
            height: shape.props.h,
            isFilled: true,
        });
    }

    // [6]
    component(shape: ICardShape) {
        // const bounds = this.editor.getShapeGeometry(shape).bounds;

        // const theme = getDefaultColorTheme({
        //     isDarkMode: this.editor.user.getIsDarkMode(),
        // });

        //[a]
        // eslint-disable-next-line react-hooks/rules-of-hooks
        // const [count, setCount] = useState(0);

        const processedMarkdown = preprocessMarkdown(shape.props.text);

        return (
            <HTMLContainer
                id={shape.id}
                style={{
                    border: "1px solid black",
                    display: "flex",
                    flexDirection: "column",
                    // padding: "1rem",
                    // alignItems: "center",
                    // justifyContent: "center",
                    // zIndex: 99999,
                    pointerEvents: "all",
                    // backgroundColor: theme[shape.props.color].semi,
                    // light grey color
                    color: "#333333",
                    // light grey shadow
                    boxShadow: "0 0 0.5rem 0.25rem rgba(0, 0, 0, 0.1)",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                }}
            >
                <div
                    className="markdown prose w-full break-words dark:prose-invert light"
                    style={{ padding: "1rem" }}
                >
                    <MarkdownStyleContainer>
                        <Markdown
                            options={{
                                wrapper: "article",
                                overrides: {
                                    p: (props) =>
                                        props.children.some(
                                            (child: any) =>
                                                typeof child === "string"
                                        ) ? (
                                            <p {...props} />
                                        ) : (
                                            <div {...props} />
                                        ),
                                    pre: {
                                        component: PreBlock,
                                    },
                                    ul: {
                                        component: ListComponent,
                                    },
                                    ol: {
                                        component: OrderedListComponent,
                                    },
                                    td: TableCell,
                                    tbody: TableBody,
                                    table: TableContainer,
                                    thead: TableHead,
                                    th: TableHeaderCell,
                                    tr: TableRow,
                                },
                            }}
                        >
                            {processedMarkdown}
                        </Markdown>
                    </MarkdownStyleContainer>
                </div>
                {/* <h2>Clicks: {count}</h2> */}
                {/* <button
                    // [b]
                    onClick={() => setCount((count) => count + 1)}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {bounds.w.toFixed()}x{bounds.h.toFixed()}
                </button> */}
            </HTMLContainer>
        );
    }

    // [7]
    indicator(shape: ICardShape) {
        return <rect width={shape.props.w} height={shape.props.h} />;
    }

    // [8]
    override onResize: TLOnResizeHandler<ICardShape> = (shape, info) => {
        return resizeBox(shape, info);
    };
}
/* 
A utility class for the card shape. This is where you define the shape's behavior, 
how it renders (its component and indicator), and how it handles different events.

[1]
A validation schema for the shape's props (optional)
Check out card-shape-props.ts for more info.

[2]
Migrations for upgrading shapes (optional)
Check out card-shape-migrations.ts for more info.

[3]
Letting the editor know if the shape's aspect ratio is locked, and whether it 
can be resized or bound to other shapes. 

[4]
The default props the shape will be rendered with when click-creating one.

[5]
We use this to calculate the shape's geometry for hit-testing, bindings and
doing other geometric calculations. 

[6]
Render method — the React component that will be rendered for the shape. It takes the 
shape as an argument. HTMLContainer is just a div that's being used to wrap our text 
and button. We can get the shape's bounds using our own getGeometry method.
	
- [a] Check it out! We can do normal React stuff here like using setState.
   Annoying: eslint sometimes thinks this is a class component, but it's not.

- [b] You need to stop the pointer down event on buttons, otherwise the editor will
	   think you're trying to select drag the shape.

[7]
Indicator — used when hovering over a shape or when it's selected; must return only SVG elements here

[8]
Resize handler — called when the shape is resized. Sometimes you'll want to do some 
custom logic here, but for our purposes, this is fine.
*/
