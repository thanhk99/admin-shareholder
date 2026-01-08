import { redirect } from "next/navigation";
import AdminLayout from "../components/AdminLayout/AdminLayout";
import styles from "@/app/proxy/page.module.css"

export default function ProxyPage() {

    return (
        <AdminLayout>
            <div className={styles.a}></div>
        </AdminLayout>
    )
}