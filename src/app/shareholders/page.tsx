import AdminLayout from "../components/AdminLayout/AdminLayout";
import ShareholderManagement from "../components/ShareholderManagement/ShareholderManagement";

export default function Home() {
  return (
    <AdminLayout>
      <ShareholderManagement /> 
    </AdminLayout>
  );
}