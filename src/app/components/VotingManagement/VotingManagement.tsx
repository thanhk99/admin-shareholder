'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOutlined, TeamOutlined, CalendarOutlined, SettingOutlined } from '@ant-design/icons';
import styles from './VotingManagement.module.css';
import { ResolutionService } from '@/lib/api/resolution';
import { MeetingService } from '@/lib/api/meetings';
import {
  ResolutionVote,
  MeetingResponse,
  MeetingGroup,
} from '@/app/types/resolution';
import VotingStats from './VotingStats/VotingStats';

export default function VotingManagement() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());

  // Fetch data từ API thực tế
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await MeetingService.getAllMeetings();
        if (response) {
          // Assuming the new API returns Meeting[] and we need to transform it
          // For now, let's keep the transformApiData call if it's compatible or stub it
          setMeetings([]); // Clear for now or implement proper transformation
          setLoading(false);
          // Note: If MeetingResponse changed, this needs more work.
        } else {
          setMeetings([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMeetings([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform API data thành MeetingGroup
  const transformApiData = (apiData: MeetingResponse[]): MeetingGroup[] => {
    return apiData.map(item => {
      const totalVotes = item.resolutionVotes.reduce((sum, resolution) =>
        sum + resolution.agreeVotes + resolution.notAgreeVotes + resolution.noIdeaVotes, 0
      );

      const approvedResolutions = item.resolutionVotes.filter(resolution =>
        resolution.agreeVotes > resolution.notAgreeVotes
      ).length;

      return {
        meetingCode: item.meeting.meetingCode,
        meetingTitle: item.meeting.title,
        meetingDate: item.meeting.meetingDate,
        location: item.meeting.location,
        status: item.meeting.status,
        resolutions: item.resolutionVotes,
        totalResolutions: item.resolutionCount,
        totalVotes,
        approvedResolutions
      };
    });
  };

  // Tính trạng thái của từng resolution
  const getResolutionStatus = (resolution: ResolutionVote) => {
    const totalVotes = resolution.agreeVotes + resolution.notAgreeVotes + resolution.noIdeaVotes;
    const agreePercentage = totalVotes > 0 ? Math.round((resolution.agreeVotes / totalVotes) * 100) : 0;
    const isApproved = resolution.agreeVotes > resolution.notAgreeVotes;

    return {
      totalVotes,
      agreePercentage,
      isApproved,
      statusLabel: isApproved ? 'ĐÃ THÔNG QUA' : 'KHÔNG THÔNG QUA',
      statusClass: isApproved ? styles.approved : styles.rejected
    };
  };

  // Toggle expand/collapse meeting
  const toggleMeeting = (meetingCode: string) => {
    const newExpanded = new Set(expandedMeetings);
    if (newExpanded.has(meetingCode)) {
      newExpanded.delete(meetingCode);
    } else {
      newExpanded.add(meetingCode);
    }
    setExpandedMeetings(newExpanded);
  };

  // Xử lý click nút quản lý
  const handleManageClick = (meetingCode: string) => {
    router.push(`/resolution/${meetingCode}`);
  };

  // Filter meetings based on search term
  const filteredMeetings = meetings.filter(meeting =>
    meeting.meetingTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.meetingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.resolutions.some(resolution =>
      resolution.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resolution.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return styles.statusCompleted;
      case 'UPCOMING':
        return styles.statusUpcoming;
      case 'PENDING':
        return styles.statusPending;
      default:
        return styles.statusPending;
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'ĐÃ KẾT THÚC';
      case 'UPCOMING':
        return 'SẮP DIỄN RA';
      case 'PENDING':
        return 'ĐANG TIẾN HÀNH';
      default:
        return status;
    }
  };

  // Get manage button class based on meeting status
  const getManageButtonClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return `${styles.manageButton} ${styles.completed}`;
      case 'UPCOMING':
        return `${styles.manageButton} ${styles.upcoming}`;
      case 'PENDING':
        return `${styles.manageButton} ${styles.pending}`;
      default:
        return styles.manageButton;
    }
  };

  // Chuẩn bị dữ liệu cho VotingStats
  const votingSessions = meetings.map(meeting => ({
    id: meeting.meetingCode,
    title: meeting.meetingTitle,
    status: meeting.status.toLowerCase() as 'upcoming' | 'ongoing' | 'completed',
    totalResolutions: meeting.totalResolutions,
    totalVotes: meeting.totalVotes,
    date: meeting.meetingDate
  }));

  // Tính tổng số liệu thống kê cho VotingStats
  const totalStats = {
    meetings: filteredMeetings.length,
    resolutions: filteredMeetings.reduce((sum, meeting) => sum + meeting.totalResolutions, 0),
    totalVotes: filteredMeetings.reduce((sum, meeting) => sum + meeting.totalVotes, 0),
    approvedResolutions: filteredMeetings.reduce((sum, meeting) => sum + meeting.approvedResolutions, 0)
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className={styles.management}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Quản lý Biểu quyết</h1>
          <p>Theo dõi và quản lý các nghị quyết theo từng cuộc họp</p>
        </div>
      </div>

      {/* Statistics - Sử dụng VotingStats component */}
      <VotingStats
        totalMeetings={totalStats.meetings}
        totalResolutions={totalStats.resolutions}
        totalVotes={totalStats.totalVotes}
        approvedResolutions={totalStats.approvedResolutions}
      />

      {/* Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <SearchOutlined className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm nghị quyết, cuộc họp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Meetings List */}
      <div className={styles.meetingsList}>
        {filteredMeetings.map((meeting) => {
          const isExpanded = expandedMeetings.has(meeting.meetingCode);

          return (
            <div key={meeting.meetingCode} className={styles.meetingCard}>
              {/* Meeting Header */}
              <div className={styles.meetingHeader}>
                <div
                  className={styles.meetingInfo}
                  onClick={() => toggleMeeting(meeting.meetingCode)}
                >
                  <div className={styles.meetingTitleSection}>
                    <CalendarOutlined className={styles.meetingIcon} />
                    <div>
                      <div className={styles.meetingHeaderRow}>
                        <h3 className={styles.meetingTitle}>{meeting.meetingTitle}</h3>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(meeting.status)}`}>
                          {getStatusText(meeting.status)}
                        </span>
                      </div>
                      <div className={styles.meetingMeta}>
                        <span className={styles.meetingCode}>{meeting.meetingCode}</span>
                        <span className={styles.meetingDate}>{formatDate(meeting.meetingDate)}</span>
                        {meeting.location && (
                          <span className={styles.meetingLocation}>📍 {meeting.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.meetingStats}>
                    <span className={styles.meetingStat}>
                      {meeting.totalResolutions} nghị quyết
                    </span>
                    <span className={styles.meetingStat}>
                      {meeting.approvedResolutions} đã thông qua
                    </span>
                    <span className={styles.meetingStat}>
                      {meeting.totalVotes.toLocaleString()} lượt bỏ phiếu
                    </span>
                  </div>
                </div>

                <div className={styles.meetingActions}>
                  <button
                    className={getManageButtonClass(meeting.status)}
                    onClick={() => handleManageClick(meeting.meetingCode)}
                    title={`Quản lý nghị quyết - ${getStatusText(meeting.status)}`}
                  >
                    <SettingOutlined />
                    Quản lý
                  </button>
                  <div
                    className={styles.expandIcon}
                    onClick={() => toggleMeeting(meeting.meetingCode)}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </div>
              </div>

              {/* Resolutions List - Hiển thị cho tất cả trạng thái cuộc họp */}
              {isExpanded && meeting.resolutions.length > 0 && (
                <div className={styles.resolutionsList}>
                  {/* Meeting status info */}
                  {meeting.status !== 'COMPLETED' && (
                    <div className={`${styles.meetingStatusInfo} ${styles[meeting.status.toLowerCase()]}`}>
                      <p>
                        {meeting.status === 'PENDING'
                          ? '📊 Cuộc họp đang diễn ra - Các nghị quyết đang được biểu quyết'
                          : '⏰ Cuộc họp sắp diễn ra - Các nghị quyết đã được chuẩn bị'
                        }
                      </p>
                    </div>
                  )}

                  {meeting.resolutions.map((resolution, index) => {
                    const status = getResolutionStatus(resolution);

                    return (
                      <div key={`${resolution.resolutionCode}-${index}`} className={styles.resolutionItem}>
                        <div className={styles.resolutionMain}>
                          <div className={styles.resolutionInfo}>
                            <h4 className={styles.resolutionTitle}>{resolution.title}</h4>
                            <span className={styles.resolutionCode}>{resolution.resolutionCode}</span>
                            <p className={styles.resolutionDescription}>{resolution.description}</p>
                          </div>

                          <div className={styles.resolutionStatus}>
                            <span className={`${styles.status} ${status.statusClass}`}>
                              {status.statusLabel}
                            </span>
                            <div className={styles.voteSummary}>
                              <span className={styles.votePercentage}>{status.agreePercentage}% đồng ý</span>
                              <span className={styles.voteCount}>({status.totalVotes.toLocaleString()} phiếu)</span>
                            </div>
                          </div>
                        </div>

                        {/* Voting Details */}
                        <div className={styles.votingDetails}>
                          <div className={styles.voteBreakdown}>
                            <div className={styles.voteItem}>
                              <span className={styles.voteLabel}>Đồng ý:</span>
                              <span className={styles.voteCountAgree}>{resolution.agreeVotes.toLocaleString()} phiếu</span>
                            </div>
                            <div className={styles.voteItem}>
                              <span className={styles.voteLabel}>Không đồng ý:</span>
                              <span className={styles.voteCountDisagree}>{resolution.notAgreeVotes.toLocaleString()} phiếu</span>
                            </div>
                            <div className={styles.voteItem}>
                              <span className={styles.voteLabel}>Không ý kiến:</span>
                              <span className={styles.voteCountAbstain}>{resolution.noIdeaVotes.toLocaleString()} phiếu</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state cho resolutions */}
              {isExpanded && meeting.resolutions.length === 0 && (
                <div className={styles.noResolutions}>
                  <TeamOutlined className={styles.noResolutionsIcon} />
                  <p>Cuộc họp này chưa có nghị quyết nào</p>
                  <button
                    className={styles.addResolutionButton}
                    onClick={() => handleManageClick(meeting.meetingCode)}
                  >
                    + Thêm nghị quyết
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMeetings.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <TeamOutlined className={styles.emptyIcon} />
          <h3>Không có cuộc họp nào</h3>
          <p>Không tìm thấy cuộc họp hoặc nghị quyết phù hợp với tìm kiếm</p>
        </div>
      )}
    </div>
  );
}