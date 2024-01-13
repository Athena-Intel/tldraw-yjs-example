import {
    Box,
    StateNode,
    atom,
    copyAs,
    // exportAs
    getSvgAsImage,
    createShapeId,
    TLTextShape,
    TLShapePartial,
} from "@tldraw/tldraw";
import { fetchEventSource } from "@microsoft/fetch-event-source";
// There's a guide at the bottom of this file!

export class ScreenshotDragging extends StateNode {
    static override id = "dragging";

    // [1]
    screenshotBox = atom("screenshot brush", new Box());

    // [2]
    override onEnter = () => {
        this.update();
    };

    override onPointerMove = () => {
        this.update();
    };

    override onKeyDown = () => {
        this.update();
    };

    override onKeyUp = () => {
        this.update();
    };

    private update() {
        const {
            inputs: { shiftKey, altKey, originPagePoint, currentPagePoint },
        } = this.editor;

        const box = Box.FromPoints([originPagePoint, currentPagePoint]);

        if (shiftKey) {
            if (box.w > box.h * (16 / 9)) {
                box.h = box.w * (9 / 16);
            } else {
                box.w = box.h * (16 / 9);
            }

            if (currentPagePoint.x < originPagePoint.x) {
                box.x = originPagePoint.x - box.w;
            }

            if (currentPagePoint.y < originPagePoint.y) {
                box.y = originPagePoint.y - box.h;
            }
        }

        if (altKey) {
            box.w *= 2;
            box.h *= 2;
            box.x = originPagePoint.x - box.w / 2;
            box.y = originPagePoint.y - box.h / 2;
        }

        this.screenshotBox.set(box);
    }

    // [3]
    override onPointerUp = async () => {
        const { editor } = this;
        const box = this.screenshotBox.get();

        // get all shapes contained by or intersecting the box
        const shapes = editor.getCurrentPageShapes().filter((s) => {
            const pageBounds = editor.getShapeMaskedPageBounds(s);
            if (!pageBounds) return false;
            return box.includes(pageBounds);
        });

        const createTextShapeInEditor = (id: string, initialText: string) => {
            const shapeId = createShapeId(id);

            const center = editor.getViewportPageCenter();
            editor.createShape({
                id: shapeId,
                type: "text",
                x: center.x,
                y: center.y,
                props: {
                    text: initialText,
                    font: "sans",
                },
            });
        };

        const updateTextShapeInEditor = (id: string, updatedText: string) => {
            const shapeId = createShapeId(id);
            // const shape = editor.getShape<TLTextShape>(shapeId)!;
            const shapeUpdate: TLShapePartial<TLTextShape> = {
                id: shapeId,
                type: "text",
                props: {
                    text: updatedText,
                },
            };

            // Update the shape
            editor.updateShapes([shapeUpdate]);
        };

        const textId = Math.random().toString(36).substring(7);

        createTextShapeInEditor(textId, "Athena is thinking...");

        // const shapeId2 = createShapeId(textId);

        if (shapes.length) {
            if (editor.inputs.ctrlKey) {
                // Copy the shapes to the clipboard
                copyAs(
                    editor,
                    shapes.map((s) => s.id),
                    "png",
                    {
                        bounds: box,
                        background: editor.getInstanceState().exportBackground,
                    }
                );
            } else {
                // Export the shapes as a png
                // exportAs(
                //     editor,
                //     shapes.map((s) => s.id),
                //     "png",
                //     {
                //         bounds: box,
                //         background: editor.getInstanceState().exportBackground,
                //     }
                // );
            }
        }
        if (shapes.length) {
            // Render the shapes to a canvas and get the base64 image string
            const image = await generateImage(editor, shapes);
            console.log(image);

            // convert to base64
            // const base64ImageString = btoa(
            //     new Uint8Array(await image.arrayBuffer()).reduce(
            //         (data, byte) => data + String.fromCharCode(byte),
            //         ""
            //     )
            // );
            // // console.log(base64ImageString);

            const data: string[] = [];

            const serverBaseURL = "http://127.0.0.1:8008";

            const fetchData = async (message: string) => {
                await fetchEventSource(`${serverBaseURL}/api/vision/stream`, {
                    method: "POST",
                    headers: {
                        Accept: "text/event-stream",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message }),
                    onopen(res): Promise<void> {
                        if (res.ok && res.status === 200) {
                            console.log("Connection made ", res);
                        } else if (
                            res.status >= 400 &&
                            res.status < 500 &&
                            res.status !== 429
                        ) {
                            console.log("Client-side error ", res);
                        }
                        return Promise.resolve();
                    },
                    onmessage(event) {
                        // console.log(event.data);
                        // setData((data) => [...data, event.data]);
                        data.push(event.data);
                        console.log(event.data);
                        const concatData = data.join("");
                        updateTextShapeInEditor(textId, concatData);
                    },
                    onclose() {
                        console.log("Connection closed by the server");
                        if (data.length > 0) {
                            const concatData = data.join("");
                            updateTextShapeInEditor(textId, concatData);
                        }
                    },
                    onerror(err) {
                        console.log("There was an error from server", err);
                    },
                });
            };

            fetchData("write a 10 word poem");

            // Now you can use the base64ImageString variable as needed
            // For example, you could assign it to a state variable or perform further actions
        }

        this.editor.setCurrentTool("select");
    };

    // [4]
    override onCancel = () => {
        this.editor.setCurrentTool("select");
    };
}

// This is a placeholder function for rendering shapes to a canvas and converting to base64
async function generateImage(editor: any, shapes: any) {
    const svg = await editor.getSvg(shapes, {
        // TODO: bigger scale = better line sharpness, but blurry image...
        scale: 1,
        background: false,
    });
    if (!svg) {
        throw new Error(`Failed to generate SVG`);
    }
    const image = await getSvgAsImage(svg, false, {
        type: "png",
        quality: 1,
        scale: 1,
    });
    if (!image) {
        throw new Error(`Failed to generate image`);
    }
    return image;
}

/*
[1] 
This state has a reactive property (an Atom) called "screenshotBox". This is the box
that the user is drawing on the screen as they drag their pointer. We use an Atom here
so that our UI can subscribe to this property using `useValue` (see the ScreenshotBox
component in ScreenshotToolExample).

[2]
When the user enters this state, or when they move their pointer, we update the 
screenshotBox property to be drawn between the place where the user started pointing
and the place where their pointer is now. If the user is holding Shift, then we modify
the dimensions of this box so that it is in a 16:9 aspect ratio.

[3]
When the user makes a pointer up and stops dragging, we export the shapes contained by
the screenshot box as a png. If the user is holding the ctrl key, we copy the shapes
to the clipboard instead.

[4]
When the user cancels (esc key) or makes a pointer up event, we transition back to the
select tool.
*/
