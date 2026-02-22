import { Badge } from "@/components/ui/badge";
import { PatientStatus } from "@/types/patient";

const statusConfig: Record<PatientStatus, { className: string }> = {
  Arrived: { className: "bg-info/15 text-info border-info/30 hover:bg-info/20" },
  Completed: { className: "bg-success/15 text-success border-success/30 hover:bg-success/20" },
  Waiting: { className: "bg-warning/15 text-warning border-warning/30 hover:bg-warning/20" },
  "No-Show": { className: "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20" },
};

const StatusBadge = ({ status }: { status: PatientStatus }) => {
  return (
    <Badge variant="outline" className={statusConfig[status].className}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
