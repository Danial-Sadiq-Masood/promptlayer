"use client"

import * as React from "react"
import { useState } from "react"

import markDownstyles from './markdown.module.css'

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
import DataTableViewOptions from './table-components/dataTableViewOptions'
import FileUpload from './table-components/FileUpload'
import FileExport from './table-components/FileExport'

import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown } from "lucide-react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
        <div className="leading-7">
            {text.split('\n').map((line, index) => (
                <span key={index}>
                    {line}
                    <br />
                </span>
            ))}
        </div>
    );
}

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

const getTHPinningStyles = (column) => {
    const isPinned = column.getIsPinned()
    const isLastLeftPinnedColumn =
        isPinned === 'left' && column.getIsLastColumn('left')
    const isFirstRightPinnedColumn =
        isPinned === 'right' && column.getIsFirstColumn('right')

    return {
        boxShadow: isLastLeftPinnedColumn
            ? '-2px 0 2px -2px gray inset'
            : isFirstRightPinnedColumn
                ? '2px 0 2px -2px gray inset'
                : undefined,
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        position: isPinned ? 'sticky' : 'relative',
        width: column.getSize(),
        backgroundColor : isPinned ? '#f9fafb' : undefined,
        zIndex: isPinned ? 1 : 0,
    }
}

const getTDPinningStyles = (column) => {
    const isPinned = column.getIsPinned()
    const isLastLeftPinnedColumn =
        isPinned === 'left' && column.getIsLastColumn('left')
    const isFirstRightPinnedColumn =
        isPinned === 'right' && column.getIsFirstColumn('right')

    return {
        boxShadow: isLastLeftPinnedColumn
            ? '-2px 0 2px -2px gray inset'
            : isFirstRightPinnedColumn
                ? '2px 0 2px -2px gray inset'
                : undefined,
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        position: isPinned ? 'sticky' : 'relative',
        width: column.getSize(),
        opacity: isPinned ? 0.95 : 1,
        backgroundColor : isPinned ? 'white' : undefined,
        zIndex: isPinned ? 1 : 0,
    }
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

    const [loadedTable, setLoadedTable] = useState(false);

    const columns = React.useMemo(
        () => {
            if (!loadedTable) {
                return [];
            }

            const columnNames = Object.keys(data[0])

            const markdownColumns = columnNames
                .filter(d => d.includes('summary'))
                .map((d, i) => ({
                    accessorKey: d,
                    id: d,
                    header: ({ column }) => <ColumnHeader column={column} title={`Summary ${i + 1}`} />,
                    cell: ({ row }) => (
                        <div className={markDownstyles.markdown}>
                            <Markdown>{row.getValue(d)}</Markdown>
                        </div>
                    ),
                    size: 600,
                    enableSorting: false
                }))

            return [
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
                    enableSorting: false,
                    enableHiding: false,
                },
                {
                    accessorKey: "User_A_Name",
                    header: ({ column }) => <ColumnHeader column={column} title="User A Name" />,
                    id: "User_A_Name",
                    cell: ({ row }) => (
                        <div className="capitalize">{row.getValue("User_A_Name")}</div>
                    ),
                    size: 120,
                    enableSorting: false,

                },
                {
                    accessorKey: "User_B_Name",
                    id: "User_B_Name",
                    header: ({ column }) => <ColumnHeader column={column} title="User B Name" />,
                    cell: ({ row }) => <div className="capitalize">{row.getValue("User_B_Name")}</div>,
                    size: 120,
                    enableSorting: false
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
                    enableSorting: false
                },
                ...markdownColumns,
                ,
                {
                    accessorKey: "ranking",
                    header: ({ column }) => <ColumnHeader column={column} title="Ranking" />,
                    id: "ranking",
                    cell: ({ row, column, table }) => {
                        const ranking = row.getValue("ranking");

                        function onChange(e) {
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
                    enableSorting: false
                }
            ]
        },
        [loadedTable]
    )

    const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

    const [columnPinning, setColumnPinning] = useState({
        left: [],
        right: [],
    });

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
            },
            columnPinning: {
                left: ['expand']
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
            <div className="flex items-center justify-between py-4">
                <div className="flex flex-1 items-center space-x-2">
                    <FileUpload setLoadedTable={setLoadedTable} setData={setData} />
                </div>
                <div className="flex items-center space-x-2">
                    {
                        loadedTable
                        &&
                        <>
                            <DataTableViewOptions table={table} />
                            <FileExport rows={table.getCoreRowModel().rows} />
                        </>
                    }
                </div>
            </div>
            <div className="rounded-md border max-w-[100%]">
                {
                    data.length > 0
                        ?
                        <DataTable table={table} />
                        :
                        <p className="p-10 text-gray-700">No Data Uploaded</p>
                }
            </div>
            {data.length > 0
                &&
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Paginator table={table} />
                </div>
            }
        </div>
    )
}

function DataTable({ table }) {
    return (
        <Table>
            <TableHeader className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {

                            const { column } = header;
                            const minSize = header.getSize();
                            return (
                                <TableHead key={header.id} style={{ minWidth: minSize,...getTHPinningStyles(column) }} >
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
                        return (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell className="align-top" key={cell.id} style={{...getTDPinningStyles(cell.column)}}>
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
    )
}