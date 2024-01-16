import { styled } from "@mui/material/styles";

const MarkdownStyleContainer = styled("span")(({ theme }) => ({
    display: "block",
    width: "100%",
    whiteSpace: "pre-line",
    // wordWrap: 'break-word',
    "&:empty::before, & > span:empty::before": {
        content: '""',
        display: "inline-block",
    },
    "& h1": {
        ...theme.typography.h1,
        marginTop: 16,
        marginBottom: 16,
    },
    "& h2": {
        ...theme.typography.h2,
        marginTop: 12,
        marginBottom: 12,
    },
    "& h3": {
        ...theme.typography.h3,
        marginTop: 12,
        marginBottom: 12,
    },
    "& h4": {
        ...theme.typography.h4,
        marginTop: 12,
        marginBottom: 12,
    },
    "& h5": {
        ...theme.typography.h5,
        marginTop: 4,
        marginBottom: 4,
    },
    "& h6": {
        ...theme.typography.h6,
        marginTop: 4,
        marginBottom: 4,
    },
    "& p": {
        marginTop: 12,
        marginBottom: 12,
    },
    "& *:first-of-type": {
        marginTop: 0,
    },
    "& *:last-child": {
        marginBottom: 0,
    },
    "& code": {
        lineHeight: 1.5,
        fontFamily: "monospace",
        padding: 4,
        borderRadius: 4,
        fontWeight: 600,
        // '&::before': {
        //     content: '"`"', // Content before the inline code
        // },
        // '&::after': {
        //     content: '"`"', // Content after the inline code
        // },
    },
}));
export default MarkdownStyleContainer;
