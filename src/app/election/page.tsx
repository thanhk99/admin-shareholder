import AdminLayout from "../components/AdminLayout/AdminLayout";
import ElectionManagement from "../components/ElectionManagement/ElectionManagement";

export default function Home() {
  return (
    <AdminLayout>
      <ElectionManagement/> 
    </AdminLayout>
  );
}