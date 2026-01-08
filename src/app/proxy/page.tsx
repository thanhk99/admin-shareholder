import AdminLayout from "../components/AdminLayout/AdminLayout";
import ProxyManagement from "../components/ProxyManagement/ProxyManagement";
import Head from "next/head";

export default function ProxyPage() {
    return (
        <AdminLayout>
            <Head>
                <title>Quản lý Uỷ quyền | VIX DHCD</title>
            </Head>
            <ProxyManagement />
        </AdminLayout>
    )
}