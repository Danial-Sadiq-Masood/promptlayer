import { useRef } from "react";
import { Button } from "@/components/ui/button"
import { LucideUpload } from "lucide-react"

import * as csv2json from "csvjson-csv2json";

export default function FileUpload({ setData, setLoadedTable }) {

    const inputRef = useRef(null);

    function handleFileUpload(e) {
        const files = e.target.files;
        if (!files) return;

        const file = files[0];
        const reader = new FileReader();

        reader.readAsText(file);

        //no error handling
        reader.onload = (e) => {
            const text = e.target.result;

            const jsonFromCSV = csv2json.csv2json(text);

            const tblDataModel = jsonFromCSV.map(d => ({ ...d, 'ranking': 'No Difference' }))
            setData(tblDataModel);
            setLoadedTable(true)
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