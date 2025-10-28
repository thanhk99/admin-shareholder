import AdminLayout from "../components/AdminLayout/AdminLayout";
import VotingManagement from "../components/VotingManagement/VotingManagement";

export default function Home() {
  return (
    <AdminLayout>
      <VotingManagement/> 
    </AdminLayout>
  );
}