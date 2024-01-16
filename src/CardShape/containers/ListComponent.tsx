// ListComponent.tsx

import * as React from "react";
import { List } from "@mui/material";

interface ListComponentProps {
    children?: React.ReactNode;
}

const ListComponent: React.FC<ListComponentProps> = ({ children }) => (
    <List sx={{ listStyleType: "disc", pl: 4 }}>{children}</List>
);

export default ListComponent;
