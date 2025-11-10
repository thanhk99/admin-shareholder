'use client';

import { useState, useEffect } from 'react';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  PlayCircleOutlined,
  StopOutlined,
  BarChartOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import styles from './VotingManagement.module.css';
import { 
  ElectionSession, 
  Candidate, 
  ElectionResult,
  ApiElectionData,
  ApiResponse 
} from '@/app/types/candidate';
import { useRouter } from 'next/navigation';
import CandidateService from '@/lib/api/candidate';
import VotingDetailModal from './VotingDetailModal/VotingDetailModal';

export default function VotingManagement() {
  const router = useRouter();
  const [electionSessions, setElectionSessions] = useState<ElectionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState<ElectionSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newElection, setNewElection] = useState({
    meetingCode: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  // Transform dữ liệu từ API mới thành định dạng ElectionSession
  const transformApiDataToElectionSessions = (apiData: ApiElectionData[]): ElectionSession[] => {
    return apiData.map(electionData => {
      const meeting = electionData.meeting;
      
      // Chuyển đổi status từ API sang status trong component
      const mapStatus = (apiStatus: string): "upcoming" | "pending" | "completed" => {
        const statusMap: { [key: string]: "upcoming" | "pending" | "completed" } = {
          'UPCOMING': 'upcoming',
          'PENDING': 'pending',
          'COMPLETED': 'completed',
        };
        return statusMap[apiStatus] || 'upcoming';
      };

      // Tạo candidates từ candidateVotes
      const candidates: Candidate[] = electionData.candidateVotes.map(vote => ({
        id: vote.candidateId.toString(),
        meetingCode: meeting.meetingCode,
        candidateName: vote.candidateName,
        candidateInfo: '', 
        currentPosition: '', 
        amountVotes: vote.amountShare || 0,
        isActive: true,
        createAt: meeting.createdAt
      }));

      // Tính toán results với kiểm tra an toàn
      const results: ElectionResult[] = electionData.candidateVotes
        .sort((a, b) => (b.amountShare || 0) - (a.amountShare || 0))
        .map((vote, index) => ({
          candidateId: vote.candidateId.toString(),
          candidateName: vote.candidateName || 'Không có tên',
          votes: Math.floor((vote.amountShare || 0) / 100),
          shares: vote.amountShare || 0,
          percentage: electionData.totalVotes > 0 ? 
            Math.round(((vote.amountShare || 0) / electionData.totalVotes) * 100) : 0,
          position: index + 1
        }));

      return {
        id: meeting.meetingCode,
        meetingCode: meeting.meetingCode,
        title: meeting.title,
        description: meeting.description,
        status: mapStatus(meeting.status),
        totalVotes: electionData.candidateCount || 0,
        totalShares: electionData.totalVotes || 0,
        startDate: meeting.meetingDate,
        endDate: meeting.meetingDate,
        candidates: candidates,
        results: results
      };
    });
  };

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CandidateService.getAllCandidates();
        if (response.status === 'success') {
          const apiData: ApiResponse = response;
          // Kiểm tra thêm để đảm bảo data tồn tại
          const transformedData = transformApiDataToElectionSessions(apiData.data || []);
          setElectionSessions(transformedData);
        } else {
          // Nếu API trả về lỗi, set mảng rỗng
          setElectionSessions([]);
        }
        setLoading(false);  
      } catch (error) {
        console.error('Error fetching data:', error);
        setElectionSessions([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredElections = electionSessions.filter(election =>
    election.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    election.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    election.meetingCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManageCandidates = (meetingCode: string) => {
    router.push(`/candidate/${meetingCode}`);
  };
  const handleViewDetail = (election: ElectionSession) => {
    setSelectedElection(election);
    setShowDetailModal(true);
  };
  const handleCreateElection = () => {
    const election: ElectionSession = {
      id: Date.now().toString(),
      ...newElection,
      status: 'upcoming',
      totalVotes: 0,
      totalShares: 0,
      candidates: [],
      results: []
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
      election.id === id ? { ...election, status: 'pending' } : election
    ));
  };

  const handleEndElection = (id: string) => {
    setElectionSessions(electionSessions.map(election => 
      election.id === id ? { ...election, status: 'completed' } : election
    ));
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      upcoming: 'Chờ bắt đầu',
      pending: 'Đang diễn ra',
      completed: 'Đã kết thúc',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      upcoming: '#f39c12',
      pending: '#2ecc71',
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

  const getElectionStats = () => {
    const total = electionSessions.length;
    const upcoming = electionSessions.filter(v => v.status === 'upcoming').length;
    const pending = electionSessions.filter(v => v.status === 'pending').length;
    const completed = electionSessions.filter(v => v.status === 'completed').length;
    
    return { total, upcoming, pending, completed };
  };

  // Hàm format số an toàn
  const safeToLocaleString = (value: number | undefined | null): string => {
    return value?.toLocaleString() || '0';
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  const stats = getElectionStats();

  return (
    <>
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
            <span>Tổng: {stats.total} cuộc bầu cử</span>
            <span>•</span>
            <span>Chờ bắt đầu: {stats.upcoming}</span>
            <span>•</span>
            <span>Đang diễn ra: {stats.pending}</span>
            <span>•</span>
            <span>Đã kết thúc: {stats.completed}</span>
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
                  <h3>{election.title || 'Không có tiêu đề'}</h3>
                  <span className={styles.meetingCode}>{election.meetingCode}</span>
                </div>
                <span 
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(election.status) }}
                >
                  {getStatusLabel(election.status)}
                </span>
              </div>
              
              <p className={styles.description}>{election.description || 'Không có mô tả'}</p>

              <div className={styles.electionDetails}>
                <div className={styles.detail}>
                  <CalendarOutlined />
                  <span>
                    {election.startDate ? new Date(election.startDate).toLocaleDateString('vi-VN') : 'Chưa có ngày'}
                  </span>
                </div>
                <div className={styles.detail}>
                  <TeamOutlined />
                  <span>{election.candidates?.length || 0} ứng viên</span>
                </div>
                <div className={styles.detail}>
                  <BarChartOutlined />
                  <span>{election.totalVotes || 0} ứng viên tham gia</span>
                </div>
                <div className={styles.detail}>
                  <UserOutlined />
                  <span>{safeToLocaleString(election.totalShares)} tổng số phiếu</span>
                </div>
              </div>

              {election.status === 'completed' && election.results && election.results.length > 0 && (
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
                            {result.percentage || 0}% • {safeToLocaleString(result.shares)} phiếu
                          </span>
                        </div>
                        <div className={styles.votePercentage}>
                          {result.percentage || 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {election.status !== 'completed' && election.candidates && election.candidates.length > 0 && (
                <div className={styles.candidatesPreview}>
                  <h4>Danh sách ứng viên:</h4>
                  <div className={styles.candidatesList}>
                    {election.candidates.slice(0, 3).map((candidate, index) => (
                      <div key={candidate.id} className={styles.candidatePreview}>
                        <UserOutlined />
                        <span>{candidate.candidateName || 'Không có tên'}</span>
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

              {(!election.candidates || election.candidates.length === 0) && (
                <div className={styles.noCandidates}>
                  <UserOutlined />
                  <span>Chưa có ứng viên nào</span>
                </div>
              )}

              <div className={styles.actions}>
                {election.status === 'upcoming' && (
                  <button 
                    className={styles.startButton}
                    onClick={() => handleStartElection(election.id)}
                  >
                    <PlayCircleOutlined />
                    Bắt đầu bầu cử
                  </button>
                )}
                {election.status === 'pending' && (
                  <button 
                    className={styles.endButton}
                    onClick={() => handleEndElection(election.id)}
                  >
                    <StopOutlined />
                    Kết thúc bầu cử
                  </button>
                )}
                {election.status === 'completed' && (
                  <button className={styles.resultsButton}
                  onClick={() => handleViewDetail(election)}>
                    <BarChartOutlined />
                    Chi tiết kết quả
                  </button>
                )}
                <button 
                  className={styles.editButton}
                  onClick={() => handleManageCandidates(election.meetingCode)}
                >
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

        {filteredElections.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <TeamOutlined />
            <h3>Không có cuộc bầu cử nào</h3>
            <p>Tạo cuộc bầu cử đầu tiên để bắt đầu quản lý</p>
            <button 
              className={styles.addButton}
              onClick={() => setShowCreateForm(true)}
            >
              <PlusOutlined />
              Tạo Cuộc bầu cử
            </button>
          </div>
        )}
      </div>
      <VotingDetailModal
        isOpen={showDetailModal}
        election={selectedElection}
        onClose={() => setShowDetailModal(false)}
        onManageCandidates={handleManageCandidates}
        onStartElection={handleStartElection}
        onEndElection={handleEndElection}
      />
    </>
  );
}