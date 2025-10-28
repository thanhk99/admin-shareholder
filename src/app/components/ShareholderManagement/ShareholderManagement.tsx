'use client';

import { useState } from 'react';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  UserOutlined,
  MailOutlined
} from '@ant-design/icons';
import styles from './ShareholderManagement.module.css';

interface Shareholder {
  id: string;
  name: string;
  email: string;
  shares: number;
  votingRights: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function ShareholderManagement() {
  const [shareholders, setShareholders] = useState<Shareholder[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'a.nguyen@email.com',
      shares: 5000,
      votingRights: 5000,
      status: 'active',
      joinDate: '2023-01-15',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      email: 'b.tran@email.com',
      shares: 3000,
      votingRights: 3000,
      status: 'active',
      joinDate: '2023-02-20',
    },
    {
      id: '3',
      name: 'Lê Văn C',
      email: 'c.le@email.com',
      shares: 2000,
      votingRights: 2000,
      status: 'inactive',
      joinDate: '2023-03-10',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newShareholder, setNewShareholder] = useState({
    name: '',
    email: '',
    shares: 0,
  });

  const filteredShareholders = shareholders.filter(sh =>
    sh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sh.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddShareholder = () => {
    const shareholder: Shareholder = {
      id: Date.now().toString(),
      ...newShareholder,
      votingRights: newShareholder.shares,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
    };

    setShareholders([...shareholders, shareholder]);
    setNewShareholder({ name: '', email: '', shares: 0 });
    setShowAddForm(false);
  };

  const handleDeleteShareholder = (id: string) => {
    setShareholders(shareholders.filter(sh => sh.id !== id));
  };

  return (
    <div className={styles.management}>
      <div className={styles.header}>
        <div>
          <h1>Quản lý Cổ đông</h1>
          <p>Quản lý thông tin cổ đông và quyền biểu quyết</p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
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
            placeholder="Tìm kiếm cổ đông..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.stats}>
          <span>Tổng: {shareholders.length} cổ đông</span>
          <span>•</span>
          <span>Active: {shareholders.filter(sh => sh.status === 'active').length}</span>
        </div>
      </div>

      {showAddForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Thêm Cổ đông mới</h3>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Họ tên</label>
                <div className={styles.inputWithIcon}>
                  <UserOutlined />
                  <input
                    type="text"
                    value={newShareholder.name}
                    onChange={(e) => setNewShareholder({...newShareholder, name: e.target.value})}
                    placeholder="Nhập họ tên cổ đông"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <div className={styles.inputWithIcon}>
                  <MailOutlined />
                  <input
                    type="email"
                    value={newShareholder.email}
                    onChange={(e) => setNewShareholder({...newShareholder, email: e.target.value})}
                    placeholder="Nhập email"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Số cổ phần</label>
                <input
                  type="number"
                  value={newShareholder.shares}
                  onChange={(e) => setNewShareholder({...newShareholder, shares: parseInt(e.target.value) || 0})}
                  placeholder="Nhập số cổ phần"
                />
              </div>
              <div className={styles.formActions}>
                <button className={styles.cancelButton} onClick={() => setShowAddForm(false)}>
                  Hủy
                </button>
                <button className={styles.saveButton} onClick={handleAddShareholder}>
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên cổ đông</th>
              <th>Email</th>
              <th>Số cổ phần</th>
              <th>Quyền biểu quyết</th>
              <th>Trạng thái</th>
              <th>Ngày tham gia</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredShareholders.map((shareholder) => (
              <tr key={shareholder.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      <UserOutlined />
                    </div>
                    {shareholder.name}
                  </div>
                </td>
                <td>{shareholder.email}</td>
                <td className={styles.shares}>{shareholder.shares.toLocaleString()}</td>
                <td className={styles.votingRights}>{shareholder.votingRights.toLocaleString()}</td>
                <td>
                  <span className={`${styles.status} ${styles[shareholder.status]}`}>
                    {shareholder.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>{new Date(shareholder.joinDate).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.editButton} title="Sửa">
                      <EditOutlined />
                    </button>
                    <button 
                      className={styles.deleteButton} 
                      title="Xóa"
                      onClick={() => handleDeleteShareholder(shareholder.id)}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}