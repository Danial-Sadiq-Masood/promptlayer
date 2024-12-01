import DataTable from "./DataTable/DataTable"
import React from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
 
export default function Home() {
  return (
    <div>
      <HomePage />
    </div>
  )
}

const HomePage = () => {

    return (
        <div className="w-100 p-8">
            <Card>
                <CardHeader className="pb-3 gap-3">
                    <CardTitle className="text-4xl">Human Grading Tool</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable />
                </CardContent>
            </Card>
        </div>
    )
}