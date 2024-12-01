"use client"

import * as React from "react"
import { useState } from "react"

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
import { ChevronRight, ChevronDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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

import tblData from './test.json'

console.log(tblData);

function NewlineText({ text }) {
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
                    {row.getIsExpanded() ? <ChevronDown />   : <ChevronRight />  }
                </Button>
            </div>
        ),
        minSize: 20,
        enableSorting: true,

    },
    {
        accessorKey: "User_A_Name",
        header: ({ column }) => <ColumnHeader column={column} title="User A Name" />,
        id: "User_A_Name",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("User_A_Name")}</div>
        ),
        minSize: 120,
        enableSorting: true,

    },
    {
        accessorKey: "User_B_Name",
        id: "User_B_Name",
        header: ({ column }) => <ColumnHeader column={column} title="User B Name" />,
        cell: ({ row }) => <div className="capitalize">{row.getValue("User_B_Name")}</div>,
        minSize: 120,
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
        minSize: 600,
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
        minSize: 600,
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
        minSize: 600,
        enableSorting: true
    },
    {
        accessorKey: "Ranking",
        header: ({ column }) => <ColumnHeader column={column} title="Ranking" />,
        id: "ecp_winner",
        cell: ({ row }) => (
            <div className="capitalize"></div>
        ),
        minSize: 200,
        enableSorting: true
    }
]

export default function DataTableDemo() {
    const [sorting, setSorting] = React.useState([])
    const [columnFilters, setColumnFilters] = React.useState(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState({})
    const [rowSelection, setRowSelection] = React.useState({})

    const [expanded, setExpanded] = useState({})

    const table = useReactTable({
        data: tblData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getRowCanExpand: (row) => true,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            expanded
        },
        onExpandedChange: setExpanded
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
