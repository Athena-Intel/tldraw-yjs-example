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
    ListItemButton,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { track, useEditor, useToasts } from "@tldraw/tldraw";

const ANALYZE_PROMPT = `
Please provide an analysis and interpretation of the data presented in the image. Consider the following questions in your analysis:

What key patterns or trends can you identify from the data?
What are the highest and lowest values presented and what might be the reasons for these extremes?
What insights can be drawn from the data?
How might the data inform decision-making or strategy in its relevant context?"
`;

type AthenaRequestType = "analyze" | "transcribe" | "execute";

type EnabledRequestType = AthenaRequestType | "custom";

const requestPrompts: Record<AthenaRequestType, string> = {
    analyze: ANALYZE_PROMPT,
    transcribe: "Please transcribe the text in the image.",
    execute: "Please complete the task depicted in the image, if possible.",
};

export const ExportButton = track(() => {
    const editor = useEditor();
    const toast = useToasts();

    const [open, setOpen] = React.useState(false);

    const DEFAULT_REQUEST_TYPE = "analyze";
    const [requestType, setRequestType] =
        React.useState<EnabledRequestType>(DEFAULT_REQUEST_TYPE);
    const [request, setRequest] = React.useState<string>(
        requestPrompts[DEFAULT_REQUEST_TYPE]
    );

    const [responseLength, setResponseLength] = React.useState("standard");
    const [outputFormat, setOutputFormat] = React.useState<string>("markdown");

    const [openDrawer, setOpenDrawer] = React.useState(false);

    const handleOpenDrawer = () => setOpenDrawer(true);
    const handleCloseDrawer = () => setOpenDrawer(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChangeRequestType = (
        _e: React.MouseEvent<HTMLElement>,
        value: string
    ) => {
        setRequestType(value as EnabledRequestType);

        if (value === "custom") {
            setRequest("");
        } else {
            setRequest(requestPrompts[value as AthenaRequestType]);
        }
    };

    const handleAskAthena = () => {
        const userRequest =
            requestType === "custom" ? request : requestPrompts[requestType];

        const responseLengthText = `Please provide a ${responseLength} response length.`;

        const outputFormatText =
            outputFormat === "markdown"
                ? `Please provide a markdown response.`
                : `Please provide a text response (no markdown).`;

        const appendToRequest = `Don't reference "the image" just say "it" or "this". Save any limitations or caveats for the end of the request.`;

        localStorage.setItem(
            "athenaUserRequest",
            userRequest +
                "\n\n" +
                appendToRequest +
                "\n\n" +
                outputFormatText +
                "\n\n" +
                responseLengthText
        );

        localStorage.setItem("athenaOutputFormat", outputFormat);

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
    }, []);

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
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        p: 4,
                    }}
                >
                    <Typography variant="h6" p={1}>
                        Request
                    </Typography>
                    <ToggleButtonGroup
                        value={requestType}
                        exclusive
                        onChange={handleChangeRequestType}
                        aria-label="request type"
                    >
                        <ToggleButton value="analyze" aria-label="analyze">
                            Analyze
                        </ToggleButton>
                        <ToggleButton
                            value="transcribe."
                            aria-label="transcribe"
                        >
                            Transcribe
                        </ToggleButton>
                        <ToggleButton value="execute" aria-label="execute">
                            Execute
                        </ToggleButton>
                        <ToggleButton value="custom" aria-label="custom">
                            Custom
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {/* Conditionally render the TextField for custom request */}
                    {requestType === "custom" && (
                        <TextField
                            id="outlined-basic"
                            value={request}
                            onChange={(e) => setRequest(e.target.value)}
                            label="Custom Request"
                            variant="outlined"
                            fullWidth
                            autoFocus
                            sx={{
                                mt: 2,
                            }}
                        />
                    )}

                    <Divider
                        sx={{
                            mt: 2,
                        }}
                    />

                    <Typography variant="body1" p={1}>
                        Response Length
                    </Typography>
                    <ToggleButtonGroup
                        value={responseLength}
                        exclusive
                        onChange={(_e, value) => setResponseLength(value)}
                        aria-label="text alignment"
                    >
                        <ToggleButton
                            value="very concise"
                            aria-label="left aligned"
                        >
                            Concise
                        </ToggleButton>
                        <ToggleButton value="standard" aria-label="centered">
                            Default
                        </ToggleButton>
                        <ToggleButton
                            value="detailed"
                            aria-label="right aligned"
                        >
                            Detailed
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Divider
                        sx={{
                            mt: 2,
                        }}
                    />
                    <Typography variant="body2" p={1}>
                        Output
                    </Typography>
                    {/* Togglebutton group for Text or Markdown */}
                    <ToggleButtonGroup
                        value={outputFormat}
                        exclusive
                        onChange={(_e, value) => setOutputFormat(value)}
                        aria-label="output format"
                    >
                        <ToggleButton value="text" aria-label="text">
                            Text
                        </ToggleButton>
                        <ToggleButton value="markdown" aria-label="markdown">
                            Markdown
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Button
                        onClick={() => handleAskAthena()}
                        disabled={request === ""}
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
