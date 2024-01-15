import {
    Box,
    StateNode,
    atom,
    copyAs,
    Editor,
    getSvgAsImage,
    createShapeId,
    TLTextShape,
    TLShapePartial,
    TLSvgOptions,
    TLShapeId,
    // useToasts,
    // exportAs,
} from "@tldraw/tldraw";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const SERVER_BASE_URL =
    import.meta.env.MODE === "development"
        ? "http://127.0.0.1:8008"
        : "https://causal-backend.onrender.com";

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
                    color: "black",
                    align: "start",
                    font: "sans",
                    autoSize: false,
                    w: 800,
                },
            });
            // const shape = editor.getShape(shapeId);
            // console.log(shape);
        };

        const updateTextShapeInEditor = (id: string, updatedText: string) => {
            const shapeId = createShapeId(id);

            const shapeUpdate: TLShapePartial<TLTextShape> = {
                id: shapeId,
                type: "text",
                props: {
                    text: updatedText,
                    font: "sans",
                },
            };
            editor.updateShapes([shapeUpdate]);
        };

        if (shapes.length === 0) {
            this.editor.setCurrentTool("select");
            return;
        }
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
                // // Export the shapes as a png
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
            const textId = Math.random().toString(36).substring(7);
            createTextShapeInEditor(textId, "Athena is thinking...");

            const blob = await exportToBlob(
                editor,
                shapes.map((s) => s.id),
                {
                    background: editor.getInstanceState().exportBackground,
                    bounds: box,
                }
            );
            const file = new File([blob], "tmpscreenshot", { type: blob.type });

            if (import.meta.env.MODE === "development") {
                downloadFile(file);
            }

            // convert to base64
            const base64ImageString = btoa(
                new Uint8Array(await blob.arrayBuffer()).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ""
                )
            );
            // console.log(base64ImageString);

            const data: string[] = [];

            const fetchData = async (message: string) => {
                await fetchEventSource(`${SERVER_BASE_URL}/api/vision/stream`, {
                    method: "POST",
                    headers: {
                        Accept: "text/event-stream",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: message,
                        base64_image: base64ImageString,
                    }),
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
                        data.push(event.data);
                        const concatData = data.join("");
                        updateTextShapeInEditor(textId, concatData);
                    },
                    onclose() {
                        console.log("Connection closed by the server");
                        // console.log(data);
                        if (data.length > 0) {
                            const concatData = data.join("");
                            updateTextShapeInEditor(textId, concatData);
                        }
                    },
                    onerror(err) {
                        console.log("There was an error from server", err);
                        updateTextShapeInEditor(
                            textId,
                            "Error while attempting to run this task."
                        );
                    },
                });
            };

            const userRequest =
                localStorage.getItem("athenaUserRequest") ||
                "Transcribe the image.";
            console.log(userRequest);
            fetchData(userRequest);
        }

        this.editor.setCurrentTool("select");
    };

    // [4]
    override onCancel = () => {
        this.editor.setCurrentTool("select");
    };
}

async function exportToBlob(
    editor: Editor,
    ids: TLShapeId[],
    opts = {} as Partial<TLSvgOptions>
) {
    const svg = await editor.getSvg(
        ids?.length ? ids : [...editor.getCurrentPageShapeIds()],
        opts
    );
    if (!svg) {
        throw new Error(`Failed to generate SVG`);
    }
    const image = await getSvgAsImage(svg, editor.environment.isSafari, {
        type: "png",
        quality: 3,
        scale: 3,
    });
    if (!image) {
        throw new Error(`Failed to generate image`);
    }
    return image;
}

function downloadFile(file: File) {
    const link = document.createElement("a");
    const url = URL.createObjectURL(file);
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
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
