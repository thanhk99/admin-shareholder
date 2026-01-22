'use client';

import { useEffect, useState } from 'react';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import styles from './UserManagement.module.css';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import AddShareholderModal from './AddShareholderModal/AddShareholderModal';
import EditShareholderModal from './EditShareholderModal/EditShareholderModal';
import AddRepresentativeModal from './AddRepresentativeModal/AddRepresentativeModal';
import ImportModal from '../MeetingManagement/ImportModal';
import { Shareholder } from '@/app/types/shareholder';



export default function UserManagement() {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddRepModal, setShowAddRepModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingShareholder, setEditingShareholder] = useState<Shareholder | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const router = useRouter();

  const filteredShareholders = shareholders.filter(sh =>
    sh.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sh.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sh.cccd.includes(searchTerm)
  );

  // Xem chi tiết người dùng
  const handleViewDetail = (shareholder: Shareholder) => {
    router.push(`/profile/${shareholder.id}`);
  };

  // "Xoá" người dùng (chuyển sang inactive)
  const handleDeleteShareholder = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn vô hiệu hoá người dùng này?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await ShareholderManage.updateShareholder(id, {
        enabled: false
      });

      if (response.status === 200) {
        await fetchShareholder();
        alert('Đã vô hiệu hoá người dùng thành công');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Có lỗi xảy ra khi vô hiệu hoá người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt lại người dùng
  const handleActivateShareholder = async (id: string) => {
    setLoading(true);
    try {
      const response = await ShareholderManage.updateShareholder(id, {
        enabled: true
      });

      if (response.status === 200) {
        await fetchShareholder();
        alert('Đã kích hoạt người dùng thành công');
      }
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Có lỗi xảy ra khi kích hoạt người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Cấp lại mật khẩu
  const handleResetPassword = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn cấp lại mật khẩu cho người dùng này?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await ShareholderManage.resetPassword(userId);
      alert(`Đã cấp lại mật khẩu thành công!\n\nMật khẩu mới: ${response.newPassword}\n\nVui lòng lưu lại mật khẩu này để cấp cho người dùng.`);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cấp lại mật khẩu');
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

      // Handle both wrapped {status, data} and direct array responses
      const res = response as any;
      if (Array.isArray(res)) {
        setShareholders(res);
      } else if (res.status === "success" || res.status === 200) {
        setShareholders(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchShareholder();
  }, []);

  return (
    <div className={styles.management}>
      <div className={styles.header}>
        <div>
          <h1>Quản lý Người dùng</h1>
          <p>Quản lý thông tin người dùng và quyền biểu quyết</p>
        </div>
        <div className={styles.headerButtons}>
          <button
            className={styles.addRepButton}
            onClick={() => setShowAddRepModal(true)}
            disabled={loading}
          >
            <PlusOutlined />
            Thêm Đại diện (Ngoài)
          </button>
          <button
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
            disabled={loading}
          >
            <PlusOutlined />
            Thêm Người dùng
          </button>
          <button
            className={styles.importButton}
            onClick={() => setShowImportModal(true)}
            disabled={loading}
          >
            <PlusOutlined />
            Nhập dữ liệu
          </button>
        </div>
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
          <span>Tổng: {shareholders.length} người dùng</span>
          <span>•</span>
          <span>Active: {shareholders.filter(sh => sh.enabled).length}</span>
          <span>•</span>
          <span>Inactive: {shareholders.filter(sh => !sh.enabled).length}</span>
        </div>
      </div>

      {/* Modal Thêm người dùng */}
      <AddShareholderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal Thêm người đại diện */}
      <AddRepresentativeModal
        isOpen={showAddRepModal}
        onClose={() => setShowAddRepModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal Chỉnh sửa người dùng */}
      {editingShareholder && (
        <EditShareholderModal
          isOpen={showEditModal}
          onClose={closeEditModal}
          onSuccess={handleEditSuccess}
          shareholder={editingShareholder}
        />
      )}

      {/* Modal Import */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleAddSuccess}
      />

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID người dùng</th>
              <th>Tên người dùng</th>
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
                key={shareholder.investorCode}
                className={styles.clickableRow}
                onClick={() => handleViewDetail(shareholder)}
              >
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      <UserOutlined />
                    </div>
                    {shareholder.id}
                  </div>
                </td>
                <td>{shareholder.fullName}</td>
                <td>{shareholder.email}</td>
                <td className={styles.shares}>{((shareholder.sharesOwned || 0) + (shareholder.receivedProxyShares || 0)).toLocaleString()}</td>
                <td>{shareholder.cccd}</td>
                <td>
                  <span className={`${styles.status} ${styles[shareholder.enabled.toString()]}`}>
                    {shareholder.enabled ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions} onClick={(e) => e.stopPropagation()}>

                    <button
                      className={styles.resetButton}
                      title="Cấp lại mật khẩu"
                      onClick={() => handleResetPassword(shareholder.id)}
                      disabled={loading}
                    >
                      <ReloadOutlined />
                    </button>
                    {shareholder.enabled ? (
                      <button
                        className={styles.deleteButton}
                        title="Vô hiệu hoá"
                        onClick={() => handleDeleteShareholder(shareholder.id)}
                        disabled={loading}
                      >
                        <DeleteOutlined />
                      </button>
                    ) : (
                      <button
                        className={styles.activateButton}
                        title="Kích hoạt"
                        onClick={() => handleActivateShareholder(shareholder.id)}
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