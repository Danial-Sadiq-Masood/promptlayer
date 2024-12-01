import { Button } from "@/components/ui/button"
import { LucideDownload } from "lucide-react"

import { mkConfig, generateCsv, download } from 'export-to-csv'


export default function FileExport({ rows }) {
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
            <Button className="bg-blue-600 hover:bg-blue-800" onClick={exportExcel}>
                <LucideDownload /> Download
            </Button>
        </>
    )
}