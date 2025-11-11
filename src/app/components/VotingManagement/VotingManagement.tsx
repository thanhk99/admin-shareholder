'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOutlined, TeamOutlined, CalendarOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import styles from './VotingManagement.module.css';

// Interfaces dựa trên API response
interface Meeting {
  meetingCode: string;
  title: string;
  description: string;
  meetingDate: string;
  location?: string;
  status: 'COMPLETED' | 'PENDING' | 'UPCOMING';
  dayStart: string;
  dayEnd: string;
  createdAt: string;
  updatedAt: string;
  createBy: string | null;
  updateBy: string | null;
}

interface ResolutionVote {
  title: string;
  description: string;
  resolutionCode: string;
  agreeVotes: number;
  notAgreeVotes: number;
  noIdeaVotes: number;
}

interface MeetingResponse {
  meeting: Meeting;
  resolutionCount: number;
  resolutionVotes: ResolutionVote[];
}

interface ApiResponse {
  status: string;
  data: MeetingResponse[];
}

interface MeetingGroup {
  meetingCode: string;
  meetingTitle: string;
  meetingDate: string;
  location?: string;
  status: 'COMPLETED' | 'PENDING' | 'UPCOMING';
  resolutions: ResolutionVote[];
  totalResolutions: number;
  totalVotes: number;
  approvedResolutions: number;
}

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
        // Giả lập API call - thay thế bằng API thực tế của bạn
        const response = await fetch('/api/meetings-with-resolutions');
        const result: ApiResponse = await response.json();
        
        if (result.status === 'success') {
          const meetingGroups = transformApiData(result.data);
          setMeetings(meetingGroups);
        } else {
          console.error('API returned error:', result);
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

  // Tính tổng số liệu thống kê
  const totalStats = {
    meetings: filteredMeetings.length,
    resolutions: filteredMeetings.reduce((sum, meeting) => sum + meeting.totalResolutions, 0),
    totalVotes: filteredMeetings.reduce((sum, meeting) => sum + meeting.totalVotes, 0),
    approvedResolutions: filteredMeetings.reduce((sum, meeting) => sum + meeting.approvedResolutions, 0)
  };

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

      {/* Statistics */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{totalStats.meetings}</span>
          <span className={styles.statLabel}>Cuộc họp</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{totalStats.resolutions}</span>
          <span className={styles.statLabel}>Nghị quyết</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{totalStats.totalVotes.toLocaleString()}</span>
          <span className={styles.statLabel}>Lượt bỏ phiếu</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{totalStats.approvedResolutions}</span>
          <span className={styles.statLabel}>Đã thông qua</span>
        </div>
      </div>

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
                    className={styles.manageButton}
                    onClick={() => handleManageClick(meeting.meetingCode)}
                    disabled={meeting.status !== 'COMPLETED'}
                    title={meeting.status !== 'COMPLETED' ? 'Chỉ có thể quản lý cuộc họp đã kết thúc' : 'Quản lý nghị quyết'}
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

              {/* Resolutions List - chỉ hiển thị với cuộc họp đã kết thúc và có nghị quyết */}
              {isExpanded && meeting.status === 'COMPLETED' && meeting.resolutions.length > 0 && (
                <div className={styles.resolutionsList}>
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
              {isExpanded && meeting.status === 'COMPLETED' && meeting.resolutions.length === 0 && (
                <div className={styles.noResolutions}>
                  <TeamOutlined className={styles.noResolutionsIcon} />
                  <p>Cuộc họp này chưa có nghị quyết nào</p>
                </div>
              )}

              {/* Thông báo cho cuộc họp chưa kết thúc */}
              {isExpanded && meeting.status !== 'COMPLETED' && (
                <div className={styles.meetingInProgress}>
                  <p>📋 Cuộc họp chưa kết thúc. Các nghị quyết sẽ được hiển thị sau khi cuộc họp kết thúc.</p>
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