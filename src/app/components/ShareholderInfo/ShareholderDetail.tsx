'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  PrinterOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  PieChartOutlined,
  HomeOutlined,
  CalendarOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import styles from './ShareholderDetail.module.css';
import EditShareholderModal from '../ShareholderManagement/EditShareholderModal/EditShareholderModal';
import { Shareholder } from '@/app/types/shareholder';
import ShareholderManage from '@/lib/api/shareholdermanagement';

export default function ShareholderDetail() {
  const params = useParams();
  const router = useRouter();
  const [shareholder, setShareholder] = useState<Shareholder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const shareholderId = params.id as string;

  const fetchShareholderDetail = async () => {
    try {
      setLoading(true);
      const response = await ShareholderManage.getShareholderByCode(shareholderId);
      console.log(response)
      if(response.status === "success"){
        setShareholder(response.data);
      }else{
        setShareholder(null);
      }
    } catch (err) {
      setError('Không thể tải thông tin cổ đông');
      console.error('Error fetching shareholder detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shareholderId) {
      fetchShareholderDetail();
    }
  }, [shareholderId]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEditSuccess = () => {
    fetchShareholderDetail(); 
    setShowEditModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải thông tin cổ đông...</p>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className={styles.error}>
        <h2>Không tìm thấy thông tin cổ đông</h2>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeftOutlined />
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeftOutlined />
          Quay lại
        </button>
        <div className={styles.headerActions}>
          <button onClick={handlePrint} className={styles.printButton}>
            <PrinterOutlined />
            In thông tin
          </button>
          <button onClick={handleEdit} className={styles.editButton}>
            <EditOutlined />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          <UserOutlined />
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.name}>{shareholder.fullName}</h1>
          <p className={styles.id}>Mã cổ đông: {shareholder.shareholderCode}</p>
          <span className={`${styles.status} ${styles[shareholder.status.toString()]}`}>
            {shareholder.status.toString() === 'true' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        {/* Thông tin cá nhân */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <UserOutlined />
            Thông Tin Cá Nhân
          </h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Họ và tên</label>
              <span>{shareholder.fullName}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Email</label>
              <span>
                <MailOutlined />
                {shareholder.email}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Số điện thoại</label>
              <span>
                <PhoneOutlined />
                {shareholder.phone}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>CCCD/CMND</label>
              <span>
                <IdcardOutlined />
                {shareholder.cccd}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Ngày sinh</label>
              <span>
                <CalendarOutlined />
                {formatDate(shareholder.birthDay)}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Quốc tịch</label>
              <span>
                <GlobalOutlined />
                {shareholder.nation || 'Chưa cập nhật'}
              </span>
            </div>
          </div>
          <div className={styles.infoItemFull}>
            <label>Địa chỉ</label>
            <span>
              <HomeOutlined />
              {shareholder.address}
            </span>
          </div>
        </div>

        {/* Thông tin cổ phần */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <PieChartOutlined />
            Thông Tin Cổ Phần
          </h2>
          <div className={styles.sharesSection}>
            <div className={styles.shareCard}>
              <div className={styles.shareNumber}>
                {shareholder.ownShares+shareholder.representedShares}
              </div>
              <div className={styles.shareLabel}>Tổng số cổ phần</div>
            </div>
            <div className={styles.shareStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{shareholder.ownShares}</span>
                <span className={styles.statLabel}>Cổ phần sở hữu</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{shareholder.authorizedShares || 0}</span>
                <span className={styles.statLabel}>Cổ phần ủy quyền</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{shareholder.representedShares}</span>
                <span className={styles.statLabel}>Cổ phần đại diện</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin hệ thống */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Thông Tin Hệ Thống</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Ngày tạo</label>
              <span>{formatDate(shareholder.createdAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Ngày cập nhật</label>
              <span>{formatDate(shareholder.updatedAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Trạng thái</label>
              <span className={`${styles.status} ${styles[shareholder.status.toString()]}`}>
                {shareholder.status.toString() === 'true' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {shareholder && (
        <EditShareholderModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
          shareholder={shareholder}
        />
      )}
    </div>
  );
}