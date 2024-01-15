// import { useMakeReal } from '../hooks/useMakeReal'

import * as React from "react";
import {
    Button,
    Box,
    Modal,
    Stack,
    TextField,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    ListItemButton,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { track, useEditor, useToasts } from "@tldraw/tldraw";

export const ExportButton = track(() => {
    const editor = useEditor();
    const toast = useToasts();

    console.log();

    const [open, setOpen] = React.useState(false);
    const [userInput, setUserInput] = React.useState("");
    const [openDrawer, setOpenDrawer] = React.useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleOpenDrawer = () => setOpenDrawer(true);
    const handleCloseDrawer = () => setOpenDrawer(false);

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
    }, [handleAskAthena, userInput]);

    const list = () => (
        <Box
            sx={{ width: "auto" }}
            role="presentation"
            onClick={handleCloseDrawer}
            onKeyDown={handleCloseDrawer}
        >
            <List>
                {["Document", "Dataset", "Query", "Chart"].map(
                    (text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    {index % 2 === 0 ? (
                                        <AddIcon />
                                    ) : (
                                        <AddIcon />
                                    )}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    )
                )}
            </List>
            <Divider />
            <List>
                {["Conversation", "Report", "Notebook"].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <AddIcon /> : <AddIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Stack direction="row" spacing={1} p={1}>
            <Button
                variant="outlined"
                onClick={() => handleOpenDrawer()}
                style={{
                    cursor: "pointer",
                    zIndex: 100000,
                    pointerEvents: "all",
                }}
                endIcon={<AddIcon sx={{ mb: "3px" }} />}
            >
                Add
            </Button>
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
                                handleQuickRequest(
                                    "Respond to the request described in the image."
                                )
                            }
                        >
                            Execute
                        </Button>
                    </Box>

                    <TextField
                        id="outlined-basic"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        label="Custom Request"
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
            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={handleCloseDrawer}
            >
                <Box
                    sx={{
                        width: 400,
                        height: "100%",
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        p: 4,
                    }}
                >
                    <Typography variant="h6">Athena Objects</Typography>
                    <Typography variant="body2">
                        Add an object to your workspace.
                    </Typography>
                    {list()}
                </Box>
            </Drawer>
        </Stack>
    );
});
