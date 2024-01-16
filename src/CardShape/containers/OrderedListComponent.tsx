// OrderedListComponent.tsx

import * as React from "react";
import { List } from "@mui/material";

interface OrderedListComponentProps {
    children?: React.ReactNode;
    start: number;
}

const OrderedListComponent: React.FC<OrderedListComponentProps> = ({
    children,
    start,
}) => (
    <List start={start} component="ol" sx={{ listStyleType: "decimal", pl: 4 }}>
        {children}
    </List>
);

export default OrderedListComponent;
