"use client"

import * as React from "react"
import { useState, useRef } from "react"

import * as csv2json from "csvjson-csv2json";

import { mkConfig, generateCsv, download } from 'export-to-csv'


import {
    CaretSortIcon,
    ChevronDownIcon,
    DotsHorizontalIcon,
} from "@radix-ui/react-icons"
import {
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    useReactTable,
} from "@tanstack/react-table"

import Paginator from './table-components/paginator'
import ColumnHeader from './table-components/columnHeader'

import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, LucideUpload, LucideDownload } from "lucide-react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import Markdown from 'react-markdown'

function NewlineText({ text = '' }) {
    return (
        <div>
            {text.split('\n').map((line, index) => (
                <span key={index}>
                    {line}
                    <br />
                </span>
            ))}
        </div>
    );
}

export const columns = [
    {
        accessorKey: "expand",
        header: "",
        id: "expand",
        cell: ({ row }) => (
            <div >
                <Button onClick={row.getToggleExpandedHandler()} variant="outline" size="icon">
                    {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
                </Button>
            </div>
        ),
        size: 50,
        enableSorting: true,

    },
    {
        accessorKey: "User_A_Name",
        header: ({ column }) => <ColumnHeader column={column} title="User A Name" />,
        id: "User_A_Name",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("User_A_Name")}</div>
        ),
        size: 120,
        enableSorting: true,

    },
    {
        accessorKey: "User_B_Name",
        id: "User_B_Name",
        header: ({ column }) => <ColumnHeader column={column} title="User B Name" />,
        cell: ({ row }) => <div className="capitalize">{row.getValue("User_B_Name")}</div>,
        size: 120,
        enableSorting: true
    },
    {
        accessorKey: "conversation",
        id: "conversation",
        header: ({ column }) => <ColumnHeader column={column} title="Conversation" />,
        cell: ({ row }) => (
            <div>
                <NewlineText text={row.getValue('conversation')} />
            </div>
        ),
        size: 600,
        enableSorting: true
    },
    {
        accessorKey: "summary-1",
        id: "summary-1",
        header: ({ column }) => <ColumnHeader column={column} title="Summary 1" />,
        cell: ({ row }) => (
            <div>
                <Markdown>{row.getValue("summary-1")}</Markdown>
            </div>
        ),
        size: 600,
        enableSorting: true
    },
    {
        accessorKey: "summary-2",
        id: "summary-2",
        header: ({ column }) => <ColumnHeader column={column} title="Summary 2" />,
        cell: ({ row }) => (
            <div>
                <Markdown>{row.getValue("summary-2")}</Markdown>
            </div>
        ),
        size: 600,
        enableSorting: true
    },
    {
        accessorKey: "ranking",
        header: ({ column }) => <ColumnHeader column={column} title="Ranking" />,
        id: "ranking",
        cell: ({ row, column, table }) => {
            console.log(row.getValue("ranking"));
            const ranking = row.getValue("ranking");

            console.log(row, column, table)

            function onChange(e) {
                console.log('changed');
                console.log(e);

                table.options.meta.updateData(row.index, column.id, e)
            }

            return (
                <div>
                    <RadioGroup value={ranking} onValueChange={onChange}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Summary 1" />
                            <Label htmlFor="r1">Summary 1</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Summary 2" />
                            <Label htmlFor="r2">Summary 2</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="No Difference" />
                            <Label htmlFor="r3">No Difference</Label>
                        </div>
                    </RadioGroup>
                </div>
            )
        },
        size: 200,
        enableSorting: true
    }
]

function useSkipper() {
    const shouldSkipRef = React.useRef(true)
    const shouldSkip = shouldSkipRef.current

    // Wrap a function with this to skip a pagination reset temporarily
    const skip = React.useCallback(() => {
        shouldSkipRef.current = false
    }, [])

    React.useEffect(() => {
        shouldSkipRef.current = true
    })

    return [shouldSkip, skip]
}


export default function DataTableDemo() {
    const [sorting, setSorting] = React.useState([])
    const [columnFilters, setColumnFilters] = React.useState(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState({})
    const [rowSelection, setRowSelection] = React.useState({})

    const [expanded, setExpanded] = useState({})

    const [data, setData] = useState([])

    const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getRowCanExpand: (row) => true,
        initialState: {
            pagination: {
                pageSize: 3,
            }
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            expanded
        },
        onExpandedChange: setExpanded,
        meta: {
            updateData: (rowIndex, columnId, value) => {

                // Skip page index reset until after next rerender
                skipAutoResetPageIndex()
                setData(old =>
                    old.map((row, index) => {
                        if (index === rowIndex) {
                            return {
                                ...old[rowIndex],
                                [columnId]: value,
                            }
                        }
                        return row
                    })
                )
            },
        }
    })

    return (
        <div className="w-full">
            {/*<div className="flex items-center py-4">
                <Input
                    placeholder="Filter Polling Stations By Name..."
                    value={(table.getColumn("ps")?.getFilterValue()) ?? ""}
                    onChange={(event) =>
                        table.getColumn("ps")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
            </div>*/}
            <div className="flex items-center justify-between py-4">
                <div className="flex flex-1 items-center space-x-2">
                    <FileUpload setData={setData} />
                </div>
                <div className="flex items-center space-x-2">
                    <FileExport rows={table.getCoreRowModel().rows} />
                </div>
            </div>
            <div className="rounded-md border max-w-[100%]">
                <Table>
                    <TableHeader className="bg-gray-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const minSize = header.getSize();
                                    console.log(minSize)
                                    return (
                                        <TableHead key={header.id} style={{ minWidth: minSize }}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table?.getRowModel()?.rows?.length ? (
                            table?.getRowModel().rows.map((row) => {
                                console.log(row, row.getIsExpanded())
                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell className="align-top" key={cell.id}>
                                                {
                                                    !row.getIsExpanded()
                                                        ?
                                                        (<div className="max-h-[200px] overflow-hidden">
                                                            {flexRender(
                                                                cell.column.columnDef.cell,
                                                                cell.getContext()
                                                            )}
                                                        </div>)
                                                        :
                                                        flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )
                                                }
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Paginator table={table} />
            </div>
        </div>
    )
}

function FileUpload({ setData }) {

    const inputRef = useRef(null);

    function handleFileUpload(e) {
        const files = e.target.files;
        if (!files) return;

        const file = files[0];
        const reader = new FileReader();

        // use the file
        console.log(file);

        reader.readAsText(file);

        reader.onload = (e) => {
            const text = e.target.result;

            var a = csv2json.csv2json(text);

            a = a.map(d => ({ ...d, 'ranking': 'No Difference' }))
            console.log(a);
            setData(a);
        };
    }

    function handleButtonClick(e) {
        e.preventDefault();
        if (!inputRef || !inputRef.current) return;

        inputRef.current.click();
    }

    return (
        <>
            <Button onClick={handleButtonClick}>
                <LucideUpload /> Upload
            </Button>
            <input ref={inputRef} type={"file"} hidden accept={".csv"} onChange={handleFileUpload} />
        </>
    )
}

function FileExport({ rows }) {
    const csvConfig = mkConfig({
        fieldSeparator: ',',
        filename: 'sample',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
    })

    const exportExcel = () => {
        const rowData = rows.map((row) => row.original)
        const csv = generateCsv(csvConfig)(rowData)
        download(csvConfig)(csv)
    }

    return (
        <>
            <Button className="bg-blue-600" onClick={exportExcel}>
                <LucideDownload /> Download
            </Button>
        </>
    )
}