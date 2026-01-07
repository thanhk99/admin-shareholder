'use client';

import { useState, useEffect } from 'react';
import {
  PlusOutlined,
  SearchOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styles from './MeetingManagement.module.css';
import { Meeting, MeetingRequest } from '@/app/types/meeting';
import { MeetingService } from '@/lib/api/meetings';
import MeetingFormModal from './MeetingAddModal/MeetingAddModal';
import MeetingDetailModal from './MeetingDetailsModal/MeetingDetailsModal';
import { useRouter } from 'next/navigation';

export default function MeetingManagement() {
  const router = useRouter();
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
      // Handle response structure if needed (assuming service returns array)
      const data = Array.isArray(meetingsData) ? meetingsData : (meetingsData as any).data || [];
      setMeetings(data);
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
    (meeting.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Xem chi tiết cuộc họp
  const handleViewDetail = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  const handleManageContent = (meetingId: string) => {
    router.push(`/resolution/${meetingId}`);
  };

  const handleManageCandidates = (meetingId: string) => {
    router.push(`/candidate/${meetingId}`);
  };

  const handleManageElections = (meetingId: string) => {
    router.push(`/election/${meetingId}`);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) return;
    try {
      await MeetingService.deleteMeeting(id);
      fetchMeetings();
    } catch (error) {
      console.error("Error deleting meeting", error);
      alert("Không thể xóa cuộc họp");
    }
  }

  // Tạo cuộc họp mới
  const handleCreateMeeting = async (meetingData: MeetingRequest) => {
    try {
      setFormLoading(true);
      await MeetingService.createMeeting({
        ...meetingData,
      });
      await fetchMeetings();
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
      await MeetingService.updateMeeting(
        selectedMeeting.id,
        meetingData
      );
      await fetchMeetings();
      setShowFormModal(false);
      setSelectedMeeting(null);
    } catch (error) {
      console.error('Error updating meeting:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Chưa cập nhật';

    return date.toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      SCHEDULED: 'Sắp diễn ra',
      ONGOING: 'Đang diễn ra',
      COMPLETED: 'Đã kết thúc',
      CANCELLED: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      SCHEDULED: '#3498db',
      ONGOING: '#f39c12',
      COMPLETED: '#27ae60',
      CANCELLED: '#e74c3c'
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
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.stats}>
          <span>Tổng: {meetings.length}</span>
          <span>•</span>
          <span>Sắp tới: {meetings.filter(m => m.status === 'SCHEDULED').length}</span>
          <span>•</span>
          <span>Đang diễn ra: {meetings.filter(m => m.status === 'ONGOING').length}</span>
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
          <div key={meeting.id} className={styles.meetingCard}>
            <div className={styles.meetingHeader}>
              <div>
                <h3>{meeting.title}</h3>
                <span className={styles.meetingCode}>ID: {meeting.id}</span>
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
                <span>{formatDate(meeting.startTime || meeting.meetingDate)}</span>
              </div>
              <div className={styles.detail}>
                <EnvironmentOutlined />
                <span>{meeting.location}</span>
              </div>
              {meeting.participants !== undefined && (
                <div className={styles.detail}>
                  <TeamOutlined />
                  <span>{meeting.participants} người tham gia</span>
                </div>
              )}
            </div>

            <div className={styles.cardActions}>
              <div className={styles.primaryActions}>
                <button
                  className={styles.actionBtn}
                  onClick={() => handleManageContent(meeting.id)}
                >
                  <UnorderedListOutlined /> Nội dung
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => handleManageElections(meeting.id)}
                >
                  <TrophyOutlined /> Bầu cử
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => handleManageCandidates(meeting.id)}
                >
                  <UserOutlined /> Ứng viên
                </button>
              </div>

              <div className={styles.secondaryActions}>
                <button className={styles.iconBtn} onClick={() => handleViewDetail(meeting)} title="Xem chi tiết">
                  <EyeOutlined />
                </button>
                <button className={styles.iconBtn} onClick={() => handleEdit(meeting)} title="Sửa">
                  <EditOutlined />
                </button>
                <button className={styles.iconBtn} onClick={() => handleDelete(meeting.id)} title="Xóa">
                  <DeleteOutlined />
                </button>
              </div>
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