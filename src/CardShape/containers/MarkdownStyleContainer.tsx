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
        fontSize: "3rem",
        marginTop: 16,
        marginBottom: 16,
    },
    "& h2": {
        ...theme.typography.h2,
        fontSize: "2.5rem",
        marginTop: 12,
        marginBottom: 12,
    },
    "& h3": {
        ...theme.typography.h3,
        fontSize: "2rem",
        marginTop: 12,
        marginBottom: 12,
    },
    "& h4": {
        ...theme.typography.h4,
        fontSize: "1.5rem",
        marginTop: 12,
        marginBottom: 12,
    },
    "& h5": {
        ...theme.typography.h5,
        fontSize: "1.25rem",
        marginTop: 4,
        marginBottom: 4,
    },
    "& h6": {
        ...theme.typography.h6,
        fontSize: "1rem",
        marginTop: 4,
        marginBottom: 4,
    },
    "& p": {
        fontSize: "1.25rem",
        marginTop: 12,
        marginBottom: 12,
    },
    "& *:first-of-type": {
        marginTop: 0,
    },
    "& *:last-child": {
        marginBottom: 0,
    },
    "& li": {
        fontSize: "1.25rem",
        marginTop: 4,
        marginBottom: 4,
    },
    "& code": {
        lineHeight: 1.5,
        fontSize: "1.25rem",
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
