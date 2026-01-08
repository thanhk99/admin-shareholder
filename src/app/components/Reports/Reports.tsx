'use client';

import { useEffect, useState } from 'react';
import {
  DownloadOutlined,
  FilterOutlined,
  TeamOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import ElectionResults from './ElectionResults/ElectionResults';
import VotingResults from './VotingResults/VotingResults';
import styles from './Reports.module.css';
import { MeetingService } from '@/lib/api/meetings';
import { Meeting } from '@/app/types/meeting';
import ReportService from '@/lib/api/report';

interface MeetingResults {
  status: string;
  resolutions: {
    totalAgree: number;
    totalNotAgree: number;
    totalNotIdea: number;
    title: string;
  }[];
  candidates: {
    candidateName: string;
    amountVotes: number;
  }[];
}

export default function Reports() {
  const [selectedMeeting, setSelectedMeeting] = useState<string>('');
  const [meetingResults, setMeetingResults] = useState<MeetingResults | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const fetchMeetings = async () => {
    try {
      const response = await MeetingService.getAllMeetings();
      if (response.status === 200) {
        setMeetings(response.data);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  }

  const fetchMeetingResults = async (meetingCode: string) => {
    if (!meetingCode) {
      setMeetingResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await ReportService.getReportMeeting(meetingCode);

      // SỬA QUAN TRỌNG: Xử lý response đúng cách
      if (response.status === 200) {
        // Nếu response có cấu trúc {status: 'success', data: {...}}
        if (response.data) {
          setMeetingResults(response.data);
        } else {
          // Nếu response là dữ liệu trực tiếp
          // setMeetingResults(response);
        }
      } else {
        setMeetingResults(null);
      }
    } catch (error) {
      console.error('Error fetching meeting results:', error);
      setMeetingResults(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    if (selectedMeeting) {
      fetchMeetingResults(selectedMeeting);
    } else {
      setMeetingResults(null);
    }
  }, [selectedMeeting]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getStats = () => {
    if (!selectedMeeting || !meetingResults) {
      const totalCandidates = meetings.reduce((sum, meeting) =>
        sum + (meeting.candidates?.length || 0), 0
      );
      const totalVotings = meetings.reduce((sum, meeting) =>
        sum + (meeting.agenda?.length || 0), 0
      );

      return {
        totalCandidates,
        totalVotings,
        totalVotes: 0,
        approvedVotings: 0,
      };
    } else {
      const totalCandidates = meetingResults.candidates?.length || 0;
      const totalVotings = meetingResults.resolutions?.length || 0;

      const candidateVotes = meetingResults.candidates?.reduce((sum, candidate) =>
        sum + candidate.amountVotes, 0
      ) || 0;

      const resolutionVotes = meetingResults.resolutions?.reduce((sum, resolution) =>
        sum + resolution.totalAgree + resolution.totalNotAgree + resolution.totalNotIdea, 0
      ) || 0;

      const totalVotes = candidateVotes + resolutionVotes;

      const approvedVotings = meetingResults.resolutions?.filter(
        resolution => resolution.totalAgree > resolution.totalNotAgree
      ).length || 0;

      return {
        totalCandidates,
        totalVotings,
        totalVotes,
        approvedVotings,
      };
    }
  };

  const stats = getStats();

  const renderResults = () => {
    if (!selectedMeeting) {
      return (
        <div className={styles.noSelection}>
          <div className={styles.noSelectionContent}>
            <TeamOutlined className={styles.noSelectionIcon} />
            <h3>Chưa chọn cuộc họp</h3>
            <p>Vui lòng chọn một cuộc họp từ danh sách để xem báo cáo chi tiết</p>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Đang tải dữ liệu...</div>
        </div>
      );
    }

    if (!meetingResults) {
      return (
        <div className={styles.noData}>
          <TeamOutlined className={styles.noDataIcon} />
          <h3>Không có dữ liệu</h3>
          <p>Không tìm thấy dữ liệu cho cuộc họp này</p>
        </div>
      );
    }

    const hasCandidates = meetingResults.candidates && meetingResults.candidates.length > 0;
    const hasResolutions = meetingResults.resolutions && meetingResults.resolutions.length > 0;

    if (!hasCandidates && !hasResolutions) {
      return (
        <div className={styles.noData}>
          <TeamOutlined className={styles.noDataIcon} />
          <h3>Không có dữ liệu</h3>
          <p>Không tìm thấy dữ liệu bầu cử hoặc biểu quyết cho cuộc họp này</p>
        </div>
      );
    }

    return (
      <div className={styles.resultsContainer}>
        {hasCandidates && (
          <ElectionResults
            candidates={meetingResults.candidates}
            loading={loading}
          />
        )}

        {hasResolutions && (
          <VotingResults
            resolutions={meetingResults.resolutions}
            loading={loading}
          />
        )}
      </div>
    );
  };

  return (
    <div className={styles.reports}>
      <div className={styles.header}>
        <div>
          <h1>Thống kê Biểu quyết & Bầu cử</h1>
          <p>Theo dõi kết quả bầu cử HĐQT và biểu quyết quan trọng</p>
        </div>
        <button className={styles.generateButton}>
          <DownloadOutlined />
          Xuất báo cáo
        </button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TeamOutlined />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalCandidates}</h3>
            <p>Tổng ứng viên</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircleOutlined />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalVotings}</h3>
            <p>Tổng biểu quyết</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <DownloadOutlined />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalVotes.toLocaleString()}</h3>
            <p>Tổng số phiếu</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FilterOutlined />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.approvedVotings}</h3>
            <p>Biểu quyết thông qua</p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Cuộc họp</label>
            <div className={styles.meetingFilter}>
              <select
                value={selectedMeeting}
                onChange={(e) => setSelectedMeeting(e.target.value)}
                className={styles.meetingSelect}
                disabled={loading}
              >
                <option value="">chưa chọn</option>
                {meetings.map(meeting => (
                  <option key={meeting.meetingCode} value={meeting.meetingCode}>
                    {/* {meeting.title} ({formatDate(meeting.meetingDate)}) */}
                  </option>
                ))}
              </select>
              <button className={styles.filterButton} disabled={loading}>
                <FilterOutlined />
                {loading ? 'Đang tải...' : 'Lọc'}
              </button>
            </div>
          </div>
        </div>

        {renderResults()}
      </div>
    </div>
  );
}