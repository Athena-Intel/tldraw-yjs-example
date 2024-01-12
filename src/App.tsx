import { Tldraw, track, useEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useYjsStore } from "./useYjsStore";
// import { getOrCreateDocAndToken } from "@y-sweet/sdk";
// import { useEffect, useState } from "react";

// const HOST_URL =
//     import.meta.env.MODE === "development"
//         ? "ws://34.28.137.204"
//         : "wss:/athenaintelligence.ngrok.io";

const HOST_URL = "ws://34.28.137.204";

export default function YjsExample() {
    const store = useYjsStore({
        roomId: "example17",
        hostUrl: HOST_URL,
    });

    // // const clientToken = await getOrCreateDocAndToken(CONNECTION_STRING, docId);

    // useEffect(() => {

    //     setClientToken(clientToken);
    // }, []);

    // console.log("clientToken", clientToken);

    return (
        <div className="tldraw__editor">
            <Tldraw autoFocus store={store} shareZone={<NameEditor />} />
        </div>
    );
}

const NameEditor = track(() => {
    const editor = useEditor();

    const { color, name } = editor.user;

    return (
        <div style={{ pointerEvents: "all", display: "flex" }}>
            <input
                type="color"
                value={color}
                onChange={(e) => {
                    editor.user.updateUserPreferences({
                        color: e.currentTarget.value,
                    });
                }}
            />
            <input
                value={name}
                onChange={(e) => {
                    editor.user.updateUserPreferences({
                        name: e.currentTarget.value,
                    });
                }}
            />
        </div>
    );
});
