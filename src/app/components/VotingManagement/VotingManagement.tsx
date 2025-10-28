'use client';

import { useState } from 'react';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  PlayCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  TeamOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import styles from './VotingManagement.module.css';

interface VotingSession {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  options: VotingOption[];
  status: 'pending' | 'active' | 'completed';
  totalVotes: number;
  startDate: string;
  endDate: string;
  results?: VotingResult[];
}

interface VotingOption {
  id: string;
  text: string;
  votes: number;
}

interface VotingResult {
  optionId: string;
  votes: number;
  percentage: number;
}

export default function VotingManagement() {
  const [votingSessions, setVotingSessions] = useState<VotingSession[]>([
    {
      id: '1',
      meetingId: '1',
      title: 'Bầu Chủ tịch HĐQT',
      description: 'Bầu chọn Chủ tịch Hội đồng quản trị nhiệm kỳ 2024-2028',
      status: 'active',
      totalVotes: 100,
      startDate: '2024-06-01',
      endDate: '2024-06-15',
      options: [
        { id: '1', text: 'Ông Nguyễn Văn A', votes: 45 },
        { id: '2', text: 'Bà Trần Thị B', votes: 35 },
        { id: '3', text: 'Ông Lê Văn C', votes: 20 },
      ],
      results: [
        { optionId: '1', votes: 45, percentage: 45 },
        { optionId: '2', votes: 35, percentage: 35 },
        { optionId: '3', votes: 20, percentage: 20 },
      ],
    },
    {
      id: '2',
      meetingId: '1',
      title: 'Thông qua Báo cáo Tài chính 2023',
      description: 'Biểu quyết thông qua báo cáo tài chính năm 2023',
      status: 'completed',
      totalVotes: 95,
      startDate: '2024-05-20',
      endDate: '2024-05-30',
      options: [
        { id: '1', text: 'Đồng ý', votes: 85 },
        { id: '2', text: 'Không đồng ý', votes: 8 },
        { id: '3', text: 'Không ý kiến', votes: 2 },
      ],
      results: [
        { optionId: '1', votes: 85, percentage: 89.5 },
        { optionId: '2', votes: 8, percentage: 8.4 },
        { optionId: '3', votes: 2, percentage: 2.1 },
      ],
    },
    {
      id: '3',
      meetingId: '2',
      title: 'Phê duyệt Dự án Đầu tư Mới',
      description: 'Biểu quyết phê duyệt dự án đầu tư nhà máy mới',
      status: 'pending',
      totalVotes: 0,
      startDate: '2024-06-20',
      endDate: '2024-06-30',
      options: [
        { id: '1', text: 'Đồng ý', votes: 0 },
        { id: '2', text: 'Không đồng ý', votes: 0 },
      ],
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newVoting, setNewVoting] = useState({
    meetingId: '1',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const filteredVotings = votingSessions.filter(voting =>
    voting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voting.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateVoting = () => {
    const voting: VotingSession = {
      id: Date.now().toString(),
      ...newVoting,
      status: 'pending',
      totalVotes: 0,
      options: [
        { id: '1', text: 'Đồng ý', votes: 0 },
        { id: '2', text: 'Không đồng ý', votes: 0 },
        { id: '3', text: 'Không ý kiến', votes: 0 },
      ],
    };

    setVotingSessions([...votingSessions, voting]);
    setNewVoting({ 
      meetingId: '1', 
      title: '', 
      description: '', 
      startDate: '', 
      endDate: '' 
    });
    setShowCreateForm(false);
  };

  const handleDeleteVoting = (id: string) => {
    setVotingSessions(votingSessions.filter(voting => voting.id !== id));
  };

  const handleStartVoting = (id: string) => {
    setVotingSessions(votingSessions.map(voting => 
      voting.id === id ? { ...voting, status: 'active' } : voting
    ));
  };

  const handleEndVoting = (id: string) => {
    setVotingSessions(votingSessions.map(voting => 
      voting.id === id ? { ...voting, status: 'completed' } : voting
    ));
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Chờ bắt đầu',
      active: 'Đang diễn ra',
      completed: 'Đã kết thúc',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#f39c12',
      active: '#2ecc71',
      completed: '#95a5a6',
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className={styles.management}>
      <div className={styles.header}>
        <div>
          <h1>Quản lý Bầu cử</h1>
          <p>Tổ chức và quản lý các phiên bầu cử, biểu quyết</p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowCreateForm(true)}
        >
          <PlusOutlined />
          Tạo Phiên bầu cử
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <SearchOutlined />
          <input
            type="text"
            placeholder="Tìm kiếm phiên bầu cử..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.stats}>
          <span>Tổng: {votingSessions.length} phiên</span>
          <span>•</span>
          <span>Đang hoạt động: {votingSessions.filter(v => v.status === 'active').length}</span>
        </div>
      </div>

      {showCreateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Tạo Phiên bầu cử mới</h3>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Tiêu đề phiên bầu cử</label>
                <input
                  type="text"
                  value={newVoting.title}
                  onChange={(e) => setNewVoting({...newVoting, title: e.target.value})}
                  placeholder="Nhập tiêu đề phiên bầu cử"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={newVoting.description}
                  onChange={(e) => setNewVoting({...newVoting, description: e.target.value})}
                  placeholder="Nhập mô tả phiên bầu cử"
                  rows={3}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={newVoting.startDate}
                    onChange={(e) => setNewVoting({...newVoting, startDate: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    value={newVoting.endDate}
                    onChange={(e) => setNewVoting({...newVoting, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.cancelButton} onClick={() => setShowCreateForm(false)}>
                  Hủy
                </button>
                <button className={styles.saveButton} onClick={handleCreateVoting}>
                  Tạo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.votingGrid}>
        {filteredVotings.map((voting) => (
          <div key={voting.id} className={styles.votingCard}>
            <div className={styles.votingHeader}>
              <h3>{voting.title}</h3>
              <span 
                className={styles.status}
                style={{ backgroundColor: getStatusColor(voting.status) }}
              >
                {getStatusLabel(voting.status)}
              </span>
            </div>
            
            <p className={styles.description}>{voting.description}</p>

            <div className={styles.votingDetails}>
              <div className={styles.detail}>
                <CalendarOutlined />
                <span>
                  {new Date(voting.startDate).toLocaleDateString('vi-VN')} - {new Date(voting.endDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className={styles.detail}>
                <TeamOutlined />
                <span>{voting.totalVotes} phiếu bầu</span>
              </div>
              <div className={styles.detail}>
                <BarChartOutlined />
                <span>{voting.options.length} lựa chọn</span>
              </div>
            </div>

            {voting.status === 'completed' && voting.results && (
              <div className={styles.results}>
                <h4>Kết quả:</h4>
                {voting.results.map((result, index) => (
                  <div key={result.optionId} className={styles.resultItem}>
                    <div className={styles.resultHeader}>
                      <span>{voting.options[index]?.text}</span>
                      <span>{result.percentage}% ({result.votes} phiếu)</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${result.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.actions}>
              {voting.status === 'pending' && (
                <button 
                  className={styles.startButton}
                  onClick={() => handleStartVoting(voting.id)}
                >
                  <PlayCircleOutlined />
                  Bắt đầu
                </button>
              )}
              {voting.status === 'active' && (
                <button 
                  className={styles.endButton}
                  onClick={() => handleEndVoting(voting.id)}
                >
                  <StopOutlined />
                  Kết thúc
                </button>
              )}
              {voting.status === 'completed' && (
                <button className={styles.resultsButton}>
                  <BarChartOutlined />
                  Xem kết quả
                </button>
              )}
              <button className={styles.editButton}>
                <EditOutlined />
                Sửa
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDeleteVoting(voting.id)}
              >
                <DeleteOutlined />
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}