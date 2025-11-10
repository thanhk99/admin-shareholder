'use client';

import { useState, useEffect } from 'react';
import { 
  PlusOutlined, 
  SearchOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import styles from './MeetingManagement.module.css';
import { Meeting, MeetingRequest } from '@/app/types/meeting';
import { MeetingService } from '@/lib/api/meetings';
import MeetingFormModal from './MeetingAddModal/MeetingAddModal';
import MeetingDetailModal from './MeetingDetailsModal/MeetingDetailsModal';

export default function MeetingManagement() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Fetch meetings from API
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const meetingsData = await MeetingService.getAllMeetings();
      setMeetings(meetingsData.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const filteredMeetings = meetings.filter(meeting =>
    (meeting.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (meeting.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (meeting.meetingCode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Xem chi tiết cuộc họp
  const handleViewDetail = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  // Mở form tạo mới
  const handleCreateNew = () => {
    setSelectedMeeting(null);
    setFormMode('create');
    setShowFormModal(true);
  };

  // Mở form chỉnh sửa
  const handleEdit = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setFormMode('edit');
    setShowDetailModal(false);
    setShowFormModal(true);
  };

  // Tạo cuộc họp mới
  const handleCreateMeeting = async (meetingData: MeetingRequest) => {
    try {
      setFormLoading(true);
      const createdMeeting = await MeetingService.createMeeting({
        ...meetingData,
      });
      console.log(createdMeeting);
      
      if (createdMeeting.status === "success") {
        await fetchMeetings(); 
      }
      
      setShowFormModal(false);
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Cập nhật cuộc họp
  const handleUpdateMeeting = async (meetingData: MeetingRequest) => {
    if (!selectedMeeting) return;

    try {
      setFormLoading(true);
      meetingData.meetingCode = selectedMeeting.meetingCode;
      const updatedMeeting = await MeetingService.updateMeeting(
        meetingData
      );
      console.log(updatedMeeting);
      

      if (updatedMeeting.status === "success") {
        await fetchMeetings(); 
      }
      
      setShowFormModal(false);
    } catch (error) {
      console.error('Error updating meeting:', error);
    } finally {
      setFormLoading(false);
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      UPCOMING: 'Sắp diễn ra',
      PENDING: 'Đang diễn ra',
      COMPLETED: 'Đã kết thúc'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      UPCOMING: '#3498db',
      PENDING: '#f39c12',
      COMPLETED: '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className={styles.management}>
      <div className={styles.header}>
        <div>
          <h1>Quản lý Cuộc họp</h1>
          <p>Tổ chức và quản lý các cuộc họp</p>
        </div>
        <button 
          className={styles.addButton}
          onClick={handleCreateNew}
        >
          <PlusOutlined />
          Tạo Cuộc họp
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <SearchOutlined />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc họp theo tiêu đề, mô tả hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.stats}>
          <span>Tổng: {meetings.length} cuộc họp</span>
          <span>•</span>
          <span>Sắp tới: {meetings.filter(m => m.status === 'UPCOMING').length}</span>
          <span>•</span>
          <span>Đang diễn ra: {meetings.filter(m => m.status === 'PENDING').length}</span>
        </div>
      </div>

      {/* Modal Form */}
      <MeetingFormModal
        isOpen={showFormModal}
        mode={formMode}
        meeting={selectedMeeting}
        onClose={() => setShowFormModal(false)}
        onSubmit={formMode === 'create' ? handleCreateMeeting : handleUpdateMeeting}
        loading={formLoading}
      />

      {/* Modal Chi tiết */}
      <MeetingDetailModal
        isOpen={showDetailModal}
        meeting={selectedMeeting}
        onClose={() => setShowDetailModal(false)}
        onEdit={handleEdit}
      />

      {/* Danh sách cuộc họp */}
      <div className={styles.meetingsGrid}>
        {filteredMeetings.map((meeting) => (
          <div key={meeting.meetingCode} className={styles.meetingCard}>
            <div className={styles.meetingHeader}>
              <div>
                <h3>{meeting.title}</h3>
                <span className={styles.meetingCode}>{meeting.meetingCode}</span>
              </div>
              <span 
                className={styles.status}
                style={{ backgroundColor: getStatusColor(meeting.status) }}
              >
                {getStatusLabel(meeting.status)}
              </span>
            </div>
            <p className={styles.description}>{meeting.description}</p>
            
            <div className={styles.meetingDetails}>
              <div className={styles.detail}>
                <CalendarOutlined />
                <span>{formatDate(meeting.meetingDate)}</span>
              </div>
              <div className={styles.detail}>
                <ClockCircleOutlined />
                <span>{meeting.dayStart} - {meeting.dayEnd}</span>
              </div>
              <div className={styles.detail}>
                <EnvironmentOutlined />
                <span>{meeting.location}</span>
              </div>
              <div className={styles.detail}>
                <TeamOutlined />
                <span>{meeting.participants} người tham gia</span>
              </div>
            </div>

            {meeting.agenda && meeting.agenda.length > 0 && (
              <div className={styles.agenda}>
                <h4>Biểu quyết:</h4>
                <ul>
                  {meeting.agenda.slice(0, 2).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                  {meeting.agenda.length > 2 && (
                    <li className={styles.moreItems}>+{meeting.agenda.length - 2} mục khác</li>
                  )}
                </ul>
              </div>
            )}
            {meeting.candidates && meeting.candidates.length > 0 && (
              <div className={styles.agenda}>
                <h4>Danh sách ứng viên:</h4>
                <ul>
                  {meeting.candidates.slice(0, 2).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                  {meeting.candidates.length > 2 && (
                    <li className={styles.moreItems}>+{meeting.candidates.length - 2} mục khác</li>
                  )}
                </ul>
              </div>
            )}

            <div className={styles.actions}>
              <button 
                className={styles.viewButton}
                onClick={() => handleViewDetail(meeting)}
              >
                <EyeOutlined />
                Xem chi tiết
              </button>
              <button 
                className={styles.editButton}
                onClick={() => handleEdit(meeting)}
              >
                <EditOutlined />
                Sửa
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMeetings.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>Không tìm thấy cuộc họp nào</p>
        </div>
      )}
    </div>
  );
}