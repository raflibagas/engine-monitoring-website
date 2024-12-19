// app/dashboard/export/page.js
import { fetchDataCount } from "@/app/lib/data";
import ExportForm from "@/app/ui/export/export-form";

export default async function ExportPage() {
  const totalCount = await fetchDataCount();

  return (
    <div className="w-full bg-white rounded-lg -mt-2">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Data Export</h1>
      </div>
      <div className="flex flex-col h-full bg-white shadow-md rounded-lg overflow-hidden border-gray-200 border-2 p-6">
        <div className="flex justify-between items-center -mt-2 mb-2">
          <p className="text-gray-800 font-semibold">
            Download sensor data for analysis (CSV format)
          </p>
          <p className="text-gray-800 font-semibold">
            Available data points: {totalCount.toLocaleString()}
          </p>
        </div>
        <div className="text-sm text-gray-500 mb-4">
          Note: Maximum download range is 30 days
        </div>
        <ExportForm />
      </div>
    </div>
  );
}
