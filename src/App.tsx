import { useEffect, useState } from "react";
import { Tldraw, track, useEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useYjsStore } from "./useYjsStore";

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

export function YjsExample({ roomId }: { roomId: string }) {
    const store = useYjsStore({
        roomId: roomId,
        hostUrl: HOST_URL,
    });

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
