'use client';

import { useState, useEffect } from 'react';
import {  SearchOutlined, TeamOutlined } from '@ant-design/icons';
import styles from './ElectionManagement.module.css';
import { 
  ElectionSession, 
  ApiElectionData,
  ApiResponse, 
  Candidate,
  ElectionResult
} from '@/app/types/candidate';
import { useRouter } from 'next/navigation';
import CandidateService from '@/lib/api/candidate';
import ElectionDetailModal from './ElectionDetailModal/ElectionDetailModal';
import ElectionStats from './ElectionStats/ElectionStats';
import ElectionCard from './ElectionCard/ElectionCard';

export default function ElectionManagement() {
  const router = useRouter();
  const [electionSessions, setElectionSessions] = useState<ElectionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState<ElectionSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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


  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  return (
    <>
      <div className={styles.management}>
        <div className={styles.header}>
          <div>
            <h1>Quản lý Bầu cử HĐQT</h1>
            <p>Tổ chức và quản lý các cuộc bầu cử Hội đồng Quản trị</p>
          </div>
        </div>

        <ElectionStats electionSessions={electionSessions} />

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
        </div>

        <div className={styles.electionGrid}>
          {filteredElections.map((election) => (
            <ElectionCard
              key={election.id}
              election={election}
              onViewDetail={handleViewDetail}
              onManageCandidates={handleManageCandidates}
            />
          ))}
        </div>

        {filteredElections.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <TeamOutlined />
            <h3>Không có cuộc bầu cử nào</h3>
            <p>Tạo cuộc bầu cử đầu tiên để bắt đầu quản lý</p>
          </div>
        )}
      </div>
      
      <ElectionDetailModal
        isOpen={showDetailModal}
        election={selectedElection}
        onClose={() => setShowDetailModal(false)}
        onManageCandidates={handleManageCandidates}
      />
    </>
  );
}