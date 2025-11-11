import AdminLayout from "../components/AdminLayout/AdminLayout";
import VotingManagementPage from "../components/VotingManagement/VotingManagement";

export default function Home() {
  return (
    <AdminLayout>
      <VotingManagementPage/> 
    </AdminLayout>
  );
}