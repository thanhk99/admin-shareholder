import AdminLayout from "../components/AdminLayout/AdminLayout";
import EligibilityCheck from "../components/EligibilityCheck/EligibilityCheck";
import Head from "next/head";

export default function EligibilityCheckPage() {
    return (
        <AdminLayout>
            <EligibilityCheck />
        </AdminLayout>
    )
}
