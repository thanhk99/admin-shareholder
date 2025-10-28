import AdminLayout from "./components/AdminLayout/AdminLayout";
import Dashboard from "./components/Dashboard/Dashboard";

export default function Home() {
  return (
    <AdminLayout>
      <Dashboard /> 
    </AdminLayout>
  );
}