// import { useMakeReal } from '../hooks/useMakeReal'

import * as React from "react";

import {
    Button,
    Box,
    // Typography,
    Modal,
    Container,
    TextField,
} from "@mui/material";

import { track, useEditor, useToasts } from "@tldraw/tldraw";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: 2,
    p: 4,
};

export const ExportButton = track(() => {
    const editor = useEditor();
    const toast = useToasts();

    console.log();

    const [open, setOpen] = React.useState(false);
    const [userRequest, setUserRequest] = React.useState("");

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAskAthena = () => {
        if (userRequest === "") {
            return;
        }

        localStorage.setItem("athenaUserRequest", userRequest);

        handleClose();

        editor.setCurrentTool("screenshot");

        toast.addToast({
            title: "Drag and select a region to provide Athena with context",
        });
    };

    // call handleAskAthena if the user presses enter
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                handleAskAthena();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleAskAthena]);

    return (
        <Container sx={{ p: 1 }}>
            <Button
                onClick={handleOpen}
                style={{
                    cursor: "pointer",
                    zIndex: 100000,
                    pointerEvents: "all",
                }}
                variant="contained"
            >
                Ask Athena
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                disableRestoreFocus={true}
                // BackdropProps={{ invisible: true }}
            >
                <Box sx={style}>
                    <TextField
                        id="outlined-basic"
                        value={userRequest}
                        onChange={(e) => setUserRequest(e.target.value)}
                        label="Enter your request"
                        variant="outlined"
                        fullWidth
                        autoFocus
                    />
                    <Button
                        onClick={handleAskAthena}
                        disabled={userRequest === ""}
                        variant="contained"
                        sx={{
                            mt: 2,
                            float: "right",
                        }}
                    >
                        Next
                    </Button>
                </Box>
            </Modal>
        </Container>
    );
});
