'use client'

import React from 'react';
import AdminLayout from '@/app/components/AdminLayout/AdminLayout';
import AttendeeList from '@/app/components/EligibilityCheck/AttendeeList';
import Head from 'next/head';

export default function AttendanceListPage() {
    return (
        <AdminLayout>
            <Head>
                <title>Danh sách người tham dự</title>
            </Head>
            <div style={{ padding: '20px' }}>
                <AttendeeList />
            </div>
        </AdminLayout>
    );
}
