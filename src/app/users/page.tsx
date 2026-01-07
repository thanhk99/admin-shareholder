import UserManagement from "../components/UserManagement/UserManagement";
import AdminLayout from "../components/AdminLayout/AdminLayout";

export default function UsersPage() {
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
}