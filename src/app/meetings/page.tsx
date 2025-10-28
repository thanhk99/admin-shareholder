import AdminLayout from "../components/AdminLayout/AdminLayout";
import MeetingManagement from "../components/MeetingManagement/MeetingManagement";

export default function Home() {
  return (
    <AdminLayout>
      <MeetingManagement /> 
    </AdminLayout>
  );
}