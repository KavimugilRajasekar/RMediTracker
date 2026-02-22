import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";
import ReceptionDashboard from "./ReceptionDashboard";
import DoctorDashboard from "./DoctorDashboard";

const Index = () => {
  const { role } = useAuth();

  if (!role) return <Login />;
  if (role === "reception") return <ReceptionDashboard />;
  if (role === "doctor") return <DoctorDashboard />;

  return null;
};

export default Index;
