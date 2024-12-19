import StatusAlert from "@/app/ui/status/alert";
import AlertsTable from "@/app/ui/status/alerts-table";

export default function StatusPage() {
  return (
    <div className="">
      {" "}
      <StatusAlert />
      <AlertsTable />
    </div>
  );
}
