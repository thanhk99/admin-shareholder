'use client'

import React from 'react';
import ShareholderDetail from '../../components/ShareholderInfo/ShareholderDetail';
import Head from 'next/head';
import AdminLayout from '@/app/components/AdminLayout/AdminLayout';

const ShareholderDetailPage: React.FC = () => {

  return (
    <AdminLayout>
      <Head>
        <title>Thông Tin Cổ Đông </title>
        <meta name="description" content="Thông tin chi tiết về cổ đông" />
      </Head>
      <ShareholderDetail />
    </AdminLayout>
  );
};

export default ShareholderDetailPage;