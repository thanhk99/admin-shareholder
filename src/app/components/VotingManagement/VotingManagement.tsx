'use client';

import { useState, useEffect } from 'react';
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
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import styles from './VotingManagement.module.css';
import { ElectionSession, Candidate } from '@/app/types/candidate';
import { useRouter } from 'next/navigation';

export default function VotingManagement() {
  const router = useRouter();
  const [electionSessions, setElectionSessions] = useState<ElectionSession[]>([
    {
      id: '1',
      meetingCode: 'CLIENT-ABC-MEET',
      title: 'Bầu Hội đồng Quản trị',
      description: 'Bầu cử thành viên Hội đồng Quản trị nhiệm kỳ 2024-2028',
      status: 'active',
      totalVotes: 150,
      totalShares: 1000000,
      startDate: '2024-06-01',
      endDate: '2024-06-15',
      candidates: [
        {
          id: '1',
          meetingCode: 'CLIENT-ABC-MEET',
          candidateName: 'Ông Nguyễn Văn A',
          candidateInfo: 'Có 10 năm kinh nghiệm trong lĩnh vực tài chính',
          currentPosition: 'Giám đốc Tài chính',
          amountVotes: 750000,
          isActive: true,
          createAt: '2024-05-01T00:00:00'
        },
        {
          id: '2',
          meetingCode: 'CLIENT-ABC-MEET',
          candidateName: 'Bà Trần Thị B',
          candidateInfo: 'Chuyên gia về quản trị doanh nghiệp',
          currentPosition: 'Trưởng phòng Nhân sự',
          amountVotes: 600000,
          isActive: true,
          createAt: '2024-05-01T00:00:00'
        },
        {
          id: '3',
          meetingCode: 'CLIENT-ABC-MEET',
          candidateName: 'Ông Lê Văn C',
          candidateInfo: 'Chuyên gia công nghệ và đổi mới',
          currentPosition: 'Giám đốc Công nghệ',
          amountVotes: 450000,
          isActive: true,
          createAt: '2024-05-01T00:00:00'
        },
        {
          id: '4',
          meetingCode: 'CLIENT-ABC-MEET',
          candidateName: 'Bà Phạm Thị D',
          candidateInfo: 'Chuyên gia về pháp lý và tuân thủ',
          currentPosition: 'Trưởng phòng Pháp chế',
          amountVotes: 300000,
          isActive: true,
          createAt: '2024-05-01T00:00:00'
        }
      ],
      results: [
        { candidateId: '1', candidateName: 'Ông Nguyễn Văn A', votes: 75, shares: 750000, percentage: 75, position: 1 },
        { candidateId: '2', candidateName: 'Bà Trần Thị B', votes: 60, shares: 600000, percentage: 60, position: 2 },
        { candidateId: '3', candidateName: 'Ông Lê Văn C', votes: 45, shares: 450000, percentage: 45, position: 3 },
        { candidateId: '4', candidateName: 'Bà Phạm Thị D', votes: 30, shares: 300000, percentage: 30, position: 4 },
      ],
    },
    {
      id: '2',
      meetingCode: 'CLIENT-ABC-MEET',
      title: 'Bầu Ban Kiểm soát',
      description: 'Bầu cử thành viên Ban Kiểm soát nhiệm kỳ 2024-2028',
      status: 'completed',
      totalVotes: 120,
      totalShares: 800000,
      startDate: '2024-05-20',
      endDate: '2024-05-30',
      candidates: [
        {
          id: '5',
          meetingCode: 'CLIENT-ABC-MEET',
          candidateName: 'Ông Hoàng Văn E',
          candidateInfo: 'Kiểm toán viên chuyên nghiệp',
          currentPosition: 'Kiểm toán viên Cao cấp',
          amountVotes: 520000,
          isActive: true,
          createAt: '2024-05-01T00:00:00'
        },
        {
          id: '6',
          meetingCode: 'CLIENT-ABC-MEET',
          candidateName: 'Bà Nguyễn Thị F',
          candidateInfo: 'Chuyên gia kiểm soát nội bộ',
          currentPosition: 'Trưởng phòng Kiểm soát Nội bộ',
          amountVotes: 480000,
          isActive: true,
          createAt: '2024-05-01T00:00:00'
        }
      ],
      results: [
        { candidateId: '5', candidateName: 'Ông Hoàng Văn E', votes: 65, shares: 520000, percentage: 65, position: 1 },
        { candidateId: '6', candidateName: 'Bà Nguyễn Thị F', votes: 60, shares: 480000, percentage: 60, position: 2 },
      ],
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newElection, setNewElection] = useState({
    meetingCode: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const filteredElections = electionSessions.filter(election =>
    election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    election.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleManageCandidates = (meetingCode: string) => {
    router.push(`/candidate/${meetingCode}`);
  };
  const handleCreateElection = () => {
    const election: ElectionSession = {
      id: Date.now().toString(),
      ...newElection,
      status: 'pending',
      totalVotes: 0,
      totalShares: 0,
      candidates: [],
    };

    setElectionSessions([...electionSessions, election]);
    setNewElection({ 
      meetingCode: '', 
      title: '', 
      description: '', 
      startDate: '', 
      endDate: '' 
    });
    setShowCreateForm(false);
  };

  const handleDeleteElection = (id: string) => {
    setElectionSessions(electionSessions.filter(election => election.id !== id));
  };

  const handleStartElection = (id: string) => {
    setElectionSessions(electionSessions.map(election => 
      election.id === id ? { ...election, status: 'active' } : election
    ));
  };

  const handleEndElection = (id: string) => {
    setElectionSessions(electionSessions.map(election => 
      election.id === id ? { ...election, status: 'completed' } : election
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

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <TrophyOutlined className={styles.goldIcon} />;
      case 2:
        return <TrophyOutlined className={styles.silverIcon} />;
      case 3:
        return <TrophyOutlined className={styles.bronzeIcon} />;
      default:
        return <UserOutlined />;
    }
  };

  return (
    <div className={styles.management}>
      <div className={styles.header}>
        <div>
          <h1>Quản lý Bầu cử HĐQT</h1>
          <p>Tổ chức và quản lý các cuộc bầu cử Hội đồng Quản trị</p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowCreateForm(true)}
        >
          <PlusOutlined />
          Tạo Cuộc bầu cử
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <SearchOutlined />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc bầu cử..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.stats}>
          <span>Tổng: {electionSessions.length} cuộc bầu cử</span>
          <span>•</span>
          <span>Đang hoạt động: {electionSessions.filter(v => v.status === 'active').length}</span>
          <span>•</span>
          <span>Đã kết thúc: {electionSessions.filter(v => v.status === 'completed').length}</span>
        </div>
      </div>

      {showCreateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Tạo Cuộc bầu cử HĐQT mới</h3>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Mã cuộc họp</label>
                <input
                  type="text"
                  value={newElection.meetingCode}
                  onChange={(e) => setNewElection({...newElection, meetingCode: e.target.value})}
                  placeholder="Nhập mã cuộc họp"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tiêu đề cuộc bầu cử</label>
                <input
                  type="text"
                  value={newElection.title}
                  onChange={(e) => setNewElection({...newElection, title: e.target.value})}
                  placeholder="Nhập tiêu đề cuộc bầu cử"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={newElection.description}
                  onChange={(e) => setNewElection({...newElection, description: e.target.value})}
                  placeholder="Nhập mô tả cuộc bầu cử"
                  rows={3}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={newElection.startDate}
                    onChange={(e) => setNewElection({...newElection, startDate: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    value={newElection.endDate}
                    onChange={(e) => setNewElection({...newElection, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.cancelButton} onClick={() => setShowCreateForm(false)}>
                  Hủy
                </button>
                <button className={styles.saveButton} onClick={handleCreateElection}>
                  Tạo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.electionGrid}>
        {filteredElections.map((election) => (
          <div key={election.id} className={styles.electionCard}>
            <div className={styles.electionHeader}>
              <div>
                <h3>{election.title}</h3>
                <span className={styles.meetingCode}>{election.meetingCode}</span>
              </div>
              <span 
                className={styles.status}
                style={{ backgroundColor: getStatusColor(election.status) }}
              >
                {getStatusLabel(election.status)}
              </span>
            </div>
            
            <p className={styles.description}>{election.description}</p>

            <div className={styles.electionDetails}>
              <div className={styles.detail}>
                <CalendarOutlined />
                <span>
                  {new Date(election.startDate).toLocaleDateString('vi-VN')} - {new Date(election.endDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className={styles.detail}>
                <TeamOutlined />
                <span>{election.totalVotes} cổ đông bỏ phiếu</span>
              </div>
              <div className={styles.detail}>
                <BarChartOutlined />
                <span>{election.candidates.length} ứng viên</span>
              </div>
              <div className={styles.detail}>
                <UserOutlined />
                <span>{election.totalShares.toLocaleString()} cổ phần</span>
              </div>
            </div>

            {election.status === 'completed' && election.results && (
              <div className={styles.results}>
                <h4>
                  <TrophyOutlined />
                  Kết quả bầu cử:
                </h4>
                <div className={styles.candidatesResults}>
                  {election.results.slice(0, 3).map((result) => (
                    <div key={result.candidateId} className={styles.candidateResult}>
                      <div className={styles.candidateRank}>
                        {getPositionIcon(result.position)}
                        <span className={styles.rank}>#{result.position}</span>
                      </div>
                      <div className={styles.candidateInfo}>
                        <span className={styles.candidateName}>{result.candidateName}</span>
                        <span className={styles.voteInfo}>
                          {result.percentage}% • {result.shares.toLocaleString()} cổ phần
                        </span>
                      </div>
                      <div className={styles.votePercentage}>
                        {result.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {election.status !== 'completed' && election.candidates.length > 0 && (
              <div className={styles.candidatesPreview}>
                <h4>Danh sách ứng viên:</h4>
                <div className={styles.candidatesList}>
                  {election.candidates.slice(0, 3).map((candidate, index) => (
                    <div key={candidate.id} className={styles.candidatePreview}>
                      <UserOutlined />
                      <span>{candidate.candidateName}</span>
                      {index === 2 && election.candidates.length > 3 && (
                        <span className={styles.moreCandidates}>
                          +{election.candidates.length - 3} ứng viên khác
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.actions}>
              {election.status === 'pending' && (
                <button 
                  className={styles.startButton}
                  onClick={() => handleStartElection(election.id)}
                >
                  <PlayCircleOutlined />
                  Bắt đầu bầu cử
                </button>
              )}
              {election.status === 'active' && (
                <button 
                  className={styles.endButton}
                  onClick={() => handleEndElection(election.id)}
                >
                  <StopOutlined />
                  Kết thúc bầu cử
                </button>
              )}
              {election.status === 'completed' && (
                <button className={styles.resultsButton}>
                  <BarChartOutlined />
                  Chi tiết kết quả
                </button>
              )}
              <button className={styles.editButton}
              onClick={() => handleManageCandidates(election.meetingCode)}>
                <EditOutlined />
                Quản lý ứng viên
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDeleteElection(election.id)}
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