import { useEffect, useState } from "react";
import {
    Box,
    // track,
    TLEditorComponents,
    TLUiAssetUrlOverrides,
    TLUiOverrides,
    Tldraw,
    Vec,
    // toolbarItem,
    useEditor,
    useValue,
} from "@tldraw/tldraw";
import "./tailwind.css";
import "@tldraw/tldraw/tldraw.css";
import { useYjsStore } from "./useYjsStore";
import { ScreenshotTool } from "./ScreenshotTool/ScreenshotTool";
import { ScreenshotDragging } from "./ScreenshotTool/childStates/Dragging";
import { ExportButton } from "./components/ExportButton";
import { CardShapeTool } from "./CardShape/CardShapeTool";
import { CardShapeUtil } from "./CardShape/CardShapeUtil";
// import { fetchEventSource } from "@microsoft/fetch-event-source";

const HOST_URL = "wss://yjs.athenaintelligence.ai";

export default function App() {
    const [roomId, setRoomId] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const space = params.get("space");

        if (space) {
            setRoomId(space);
        } else {
            const newSpace = Math.random().toString(36).substring(2);
            setRoomId(newSpace);
        }
    }, []);

    if (!roomId) {
        return <div>Loading...</div>;
    } else {
        return <YjsExample roomId={roomId} />;
    }
}
// [1]
const customShapeUtils = [CardShapeUtil];
const customTools = [ScreenshotTool, CardShapeTool];

// [2]
const customUiOverrides: TLUiOverrides = {
    tools: (editor, tools) => {
        return {
            ...tools,
            screenshot: {
                id: "screenshot",
                label: "Screenshot",
                readonlyOk: false,
                icon: "tool-screenshot",
                kbd: "j",
                onSelect() {
                    editor.setCurrentTool("screenshot");
                },
            },
            card: {
                id: "card",
                icon: "color",
                label: "Card",
                kbd: "c",
                readonlyOk: false,
                onSelect: () => {
                    editor.setCurrentTool("card");
                },
            },
        };
    },
    // toolbar: (_editor, toolbarItems, { tools }) => {
    //     // toolbarItems.splice(4, 0, toolbarItem(tools.screenshot));
    //     toolbarItems.splice(4, 0, toolbarItem(tools.card));
    //     return toolbarItems;
    // },
};

// [3]
const customAssetUrls: TLUiAssetUrlOverrides = {
    icons: {
        "tool-screenshot": "/tool-screenshot.svg",
    },
};

// [4]
function ScreenshotBox() {
    const editor = useEditor();

    const screenshotBrush = useValue(
        "screenshot brush",
        () => {
            // Check whether the screenshot tool (and its dragging state) is active
            if (editor.getPath() !== "screenshot.dragging") return null;

            // Get screenshot.dragging state node
            const draggingState = editor.getStateDescendant<ScreenshotDragging>(
                "screenshot.dragging"
            )!;

            // Get the box from the screenshot.dragging state node
            const box = draggingState.screenshotBox.get();

            // The box is in "page space", i.e. panned and zoomed with the canvas, but we
            // want to show it in front of the canvas, so we'll need to convert it to
            // "page space", i.e. uneffected by scale, and relative to the tldraw
            // page's top left corner.
            const zoomLevel = editor.getZoomLevel();
            const { x, y } = Vec.Sub(
                editor.pageToScreen({ x: box.x, y: box.y }),
                editor.getViewportScreenBounds()
            );
            return new Box(x, y, box.w * zoomLevel, box.h * zoomLevel);
        },
        [editor]
    );

    if (!screenshotBrush) return null;

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                transform: `translate(${screenshotBrush.x}px, ${screenshotBrush.y}px)`,
                width: screenshotBrush.w,
                height: screenshotBrush.h,
                border: "1px solid var(--color-text-0)",
                zIndex: 999,
            }}
        />
    );
}

const customComponents: TLEditorComponents = {
    InFrontOfTheCanvas: () => {
        return <ScreenshotBox />;
    },
};

export function YjsExample({ roomId }: { roomId: string }) {
    const store = useYjsStore({
        roomId: roomId,
        hostUrl: HOST_URL,
        shapeUtils: customShapeUtils,
    });

    return (
        <div className="tldraw__editor">
            {/* <Tldraw autoFocus store={store} shareZone={<NameEditor />} /> */}
            <Tldraw
                // persistenceKey="tldraw_screenshot_example"
                autoFocus
                store={store}
                // shareZone={<NameEditor />}
                shareZone={
                    <div>
                        <ExportButton />
                        {/* <NameEditor /> */}
                    </div>
                }
                shapeUtils={customShapeUtils}
                tools={customTools}
                overrides={customUiOverrides}
                assetUrls={customAssetUrls}
                components={customComponents}
            />
        </div>
    );
}

// const NameEditor = track(() => {
//     const editor = useEditor();

//     const { color, name } = editor.user.getUserPreferences();

//     return (
//         <div style={{ pointerEvents: "all", display: "flex" }}>
//             <input
//                 type="color"
//                 value={color}
//                 onChange={(e) => {
//                     editor.user.updateUserPreferences({
//                         color: e.currentTarget.value,
//                     });
//                 }}
//             />
//             <input
//                 value={name}
//                 onChange={(e) => {
//                     editor.user.updateUserPreferences({
//                         name: e.currentTarget.value,
//                     });
//                 }}
//             />
//         </div>
//     );
// });
