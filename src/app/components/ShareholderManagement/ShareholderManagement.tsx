'use client';

import { useEffect, useState } from 'react';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import styles from './ShareholderManagement.module.css';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import AddShareholderModal from './AddShareholderModal/AddShareholderModal';
import EditShareholderModal from './EditShareholderModal/EditShareholderModal';
import { Shareholder } from '@/app/types/shareholder';



export default function ShareholderManagement() {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingShareholder, setEditingShareholder] = useState<Shareholder | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredShareholders = shareholders.filter(sh =>
    sh.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sh.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sh.cccd.includes(searchTerm)
  );

  // Xem chi tiết cổ đông
  const handleViewDetail = (shareholder: Shareholder) => {
    router.push(`/profile/${shareholder.shareholderCode}`);
  };

  // "Xoá" cổ đông (chuyển sang inactive)
  const handleDeleteShareholder = async (cccd: string) => {
    if (!confirm('Bạn có chắc chắn muốn vô hiệu hoá cổ đông này?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await ShareholderManage.updateShareholder({
        cccd:cccd,
        status: false
      });

      if (response.status === "success") {
        await fetchShareholder();
        alert('Đã vô hiệu hoá cổ đông thành công');
      }
    } catch (error) {
      console.error('Error deactivating shareholder:', error);
      alert('Có lỗi xảy ra khi vô hiệu hoá cổ đông');
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt lại cổ đông
  const handleActivateShareholder = async (cccd: string) => {
    setLoading(true);
    try {
      const response = await ShareholderManage.updateShareholder({
        cccd:cccd,
        status: true
      });

      if (response.status === "success") {
        await fetchShareholder();
        alert('Đã kích hoạt cổ đông thành công');
      }
    } catch (error) {
      console.error('Error activating shareholder:', error);
      alert('Có lỗi xảy ra khi kích hoạt cổ đông');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal chỉnh sửa
  const openEditModal = (shareholder: Shareholder) => {
    setEditingShareholder({ ...shareholder });
    setShowEditModal(true);
  };

  // Đóng modal chỉnh sửa
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingShareholder(null);
  };

  // Refresh danh sách sau khi thêm thành công
  const handleAddSuccess = () => {
    fetchShareholder();
  };

  // Refresh danh sách sau khi chỉnh sửa thành công
  const handleEditSuccess = () => {
    fetchShareholder();
  };

  const fetchShareholder = async () => {
    try {
      const response = await ShareholderManage.getList();
      console.log(response);
      if (response.status === "success") {
        setShareholders(response.data);
      }
    } catch (error) {
      console.error('Error fetching shareholders:', error);
    }
  };

  useEffect(() => {
    fetchShareholder();
  }, []);

  return (
    <div className={styles.management}>
      <div className={styles.header}>
        <div>
          <h1>Quản lý Cổ đông</h1>
          <p>Quản lý thông tin cổ đông và quyền biểu quyết</p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
          disabled={loading}
        >
          <PlusOutlined />
          Thêm Cổ đông
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <SearchOutlined />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.stats}>
          <span>Tổng: {shareholders.length} cổ đông</span>
          <span>•</span>
          <span>Active: {shareholders.filter(sh => sh.status.toString() === 'true').length}</span>
          <span>•</span>
          <span>Inactive: {shareholders.filter(sh => sh.status.toString() === 'false').length}</span>
        </div>
      </div>

      {/* Modal Thêm cổ đông */}
      <AddShareholderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal Chỉnh sửa cổ đông */}
      {editingShareholder && (
        <EditShareholderModal
          isOpen={showEditModal}
          onClose={closeEditModal}
          onSuccess={handleEditSuccess}
          shareholder={editingShareholder}
        />
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID cổ đông</th>
              <th>Tên cổ đông</th>
              <th>Email</th>
              <th>Số cổ phần</th>
              <th>CCCD</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredShareholders.map((shareholder) => (
              <tr 
                key={shareholder.shareholderCode} 
                className={styles.clickableRow}
                onClick={() => handleViewDetail(shareholder)}
              >
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      <UserOutlined />
                    </div>
                    {shareholder.shareholderCode}
                  </div>
                </td>
                <td>{shareholder.fullName}</td>
                <td>{shareholder.email}</td>
                <td className={styles.shares}>{shareholder.ownShares}</td>
                <td>{shareholder.cccd}</td>
                <td>
                  <span className={`${styles.status} ${styles[shareholder.status.toString()]}`}>
                    {shareholder.status.toString() === 'true' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions} onClick={(e) => e.stopPropagation()}>

                    <button 
                      className={styles.editButton} 
                      title="Sửa"
                      onClick={() => openEditModal(shareholder)}
                      disabled={loading}
                    >
                      <EditOutlined />
                    </button>
                    {shareholder.status.toString() === 'true' ? (
                      <button 
                        className={styles.deleteButton} 
                        title="Vô hiệu hoá"
                        onClick={() => handleDeleteShareholder(shareholder.cccd)}
                        disabled={loading}
                      >
                        <DeleteOutlined />
                      </button>
                    ) : (
                      <button 
                        className={styles.activateButton} 
                        title="Kích hoạt"
                        onClick={() => handleActivateShareholder(shareholder.cccd)}
                        disabled={loading}
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
}