import React, { useEffect, useState } from "react";
// import { stringify } from "flatted";

import { Button, Typography, Stack } from "@mui/material";
import { Table } from "@tremor/react";
// import useAuth from "src/hooks/useAuth";
// import UploadDialog from "./UploadDialog";

interface TableComponentProps {
    children: React.ReactNode;
    // other props can be added here
}

interface TableData {
    [key: string]: any;
}

export function TableContainer(props: TableComponentProps) {
    // const { user } = useAuth();
    const [tableData, setTableData] = useState<TableData[] | null>(null);
    // const [sanitizedTableData, setSanitizedTableData] = useState<
    //     TableData[] | null
    // >(null);

    const downloadJSON = (data: TableData[]) => {
        const blob = new Blob([JSON.stringify(data)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "tableData.json";
        link.click();
    };

    const downloadCSV = (data: TableData[]) => {
        const replacer = (key: any, value: any) =>
            value === null ? "" : value; // specify how you want to handle null values here
        const header = Object.keys(data[0]);
        const csv = [
            header.join(","), // header row first
            ...data.map((row: any) =>
                header
                    .map((fieldName) =>
                        JSON.stringify(row[fieldName], replacer)
                    )
                    .join(",")
            ),
        ].join("\r\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "tableData.csv";
        link.click();

        // const csvData = data.map((row) => Object.values(row).join(',')).join('\n');
        // const headers = Object.keys(data[0]).join(',') + '\n';
        // const blob = new Blob([headers + csvData], { type: 'text/csv' });
        // const url = URL.createObjectURL(blob);
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = 'tableData.csv';
        // link.click();
    };

    useEffect(() => {
        try {
            if (!props.children || !Array.isArray(props.children)) {
                throw new Error("Invalid children prop");
            }

            const tableHeaderArray =
                props.children[0]?.props?.children?.props?.children;

            if (!tableHeaderArray) {
                throw new Error("Invalid table header structure");
            }

            const tableHeaders = tableHeaderArray.map((header: any) => {
                const arr = header.props.children;

                return arr
                    .map((el: any) => {
                        if (typeof el === "string") {
                            return el;
                        }
                        if (el.type === "strong") {
                            return `__`;
                        }
                        return el.props.children;
                    })
                    .join("");

                // return header.props.children[0];
            });

            const tableRows = props.children[1]?.props;

            if (!tableRows?.children) {
                throw new Error("Invalid table row structure");
            }

            const tableData = tableRows.children.map((row: any) => {
                const rowData = row.props.children.map(
                    (data: any) => data.props.children[0]
                );
                return rowData;
            });

            const data = tableData.map((data: any) => {
                const obj: any = {};
                tableHeaders.forEach((header: any, index: number) => {
                    obj[header] = data[index];
                });
                return obj;
            });
            // console.log(data);
            setTableData(data);

            // check if any of the data includes objects and json stringify them
            // const sanitizedTableData = data.map((row: any) => {
            //     const obj: any = {};
            //     Object.keys(row).forEach((key) => {
            //         if (typeof row[key] === "object") {
            //             try {
            //                 obj[key] = stringify(row[key].props);
            //             } catch (err) {
            //                 obj[key] = "Error parsing object";
            //             }
            //         } else {
            //             obj[key] = row[key];
            //         }
            //     });
            //     return obj;
            // });

            // setSanitizedTableData(sanitizedTableData);
        } catch (err) {
            console.log(err);
        }
    }, [props]);

    return (
        <div style={{ padding: "1rem" }}>
            <div style={{ alignSelf: "flex-start", padding: 2 }}>
                {/* <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => tableData && uploadToAthena(tableData)}
                    disabled={!tableData || user?.role !== 'admin'}
                    hidden={user?.role !== 'admin'}
                >
                    Upload to Athena
                </Button> */}
                {/* {user?.role === "admin" && sanitizedTableData && (
                    <UploadDialog
                        tableData={sanitizedTableData}
                        tableProps={props}
                    />
                )} */}
                <Stack direction="row" spacing={2} pb={1}>
                    <Typography variant="h6" pt={1}>
                        Table Output
                    </Typography>

                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => tableData && downloadJSON(tableData)}
                        disabled={!tableData}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        JSON
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => tableData && downloadCSV(tableData)}
                        disabled={!tableData}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        CSV
                    </Button>
                </Stack>
            </div>
            <Table {...props} style={{ border: "1px solid #cccccc" }} />
        </div>
    );
}

export default TableContainer;
