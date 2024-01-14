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

export const ExportButton = track(() => {
    const editor = useEditor();
    const toast = useToasts();

    console.log();

    const [open, setOpen] = React.useState(false);
    const [userInput, setUserInput] = React.useState("");

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleQuickRequest = (request: string) => {
        // setUserRequest(request);
        handleAskAthena(request);
    };

    const handleAskAthena = (userRequest: string) => {
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
                handleAskAthena(userInput);
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
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        p: 4,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={() =>
                                handleQuickRequest("Analyze the image.")
                            }
                        >
                            Analyze
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() =>
                                handleQuickRequest("Transcribe the image.")
                            }
                        >
                            Transcribe
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() =>
                                handleQuickRequest("Describe the image.")
                            }
                        >
                            Describe
                        </Button>
                    </Box>

                    <TextField
                        id="outlined-basic"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        label="Enter a specific request"
                        variant="outlined"
                        fullWidth
                        autoFocus
                    />
                    <Button
                        onClick={() => handleAskAthena(userInput)}
                        disabled={userInput === ""}
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
