'use client';

import { useState } from 'react';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  EyeOutlined
} from '@ant-design/icons';
import styles from './MeetingManagement.module.css';
import { Meeting } from '@/app/types/meeting';

export default function MeetingManagement() {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'ĐHCĐ Thường niên 2024',
      description: 'Cuộc họp Đại hội đồng cổ đông thường niên để thông qua báo cáo tài chính và bầu HĐQT',
      date: '2024-06-15',
      time: '09:00',
      location: 'Trụ sở chính - Tầng 10, 123 Nguyễn Huệ, Q.1',
      status: 'UPCOMING',
      participants: ['1', '2', '3'],
      agenda: ['Báo cáo tài chính 2023', 'Bầu HĐQT nhiệm kỳ mới', 'Phân chia lợi nhuận'],
    },
    {
      id: '2',
      title: 'Họp bất thường về dự án mới',
      description: 'Thảo luận về dự án đầu tư mới và kế hoạch triển khai',
      date: '2024-05-20',
      time: '14:00',
      location: 'Phòng họp A - Tầng 8',
      status: 'COMPLETED',
      participants: ['1', '2'],
      agenda: ['Giới thiệu dự án mới', 'Thảo luận kế hoạch đầu tư'],
    },
    {
      id: '3',
      title: 'Họp HĐQT Quý I/2024',
      description: 'Cuộc họp Hội đồng quản trị đánh giá kết quả hoạt động quý I',
      date: '2024-04-10',
      time: '10:00',
      location: 'Phòng họp B - Tầng 9',
      status: 'COMPLETED',
      participants: ['1'],
      agenda: ['Đánh giá kết quả Quý I', 'Kế hoạch Quý II'],
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMeeting = () => {
    const meeting: Meeting = {
      id: Date.now().toString(),
      ...newMeeting,
      status: 'UPCOMING',
      participants: [],
      agenda: [],
    };

    setMeetings([...meetings, meeting]);
    setNewMeeting({ title: '', description: '', date: '', time: '', location: '' });
    setShowAddForm(false);
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(meetings.filter(meeting => meeting.id !== id));
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      scheduled: 'Đã lên lịch',
      ongoing: 'Đang diễn ra',
      completed: 'Đã kết thúc',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      UPCOMING: '#3498db',
      PENDING: '#2ecc71',
      COMPLETED: '#95a5a6'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className={styles.management}>
      <div className={styles.header}>
        <div>
          <h1>Quản lý Cuộc họp</h1>
          <p>Tổ chức và quản lý các cuộc họp ĐHCĐ</p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
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
            placeholder="Tìm kiếm cuộc họp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.stats}>
          <span>Tổng: {meetings.length} cuộc họp</span>
          <span>•</span>
          <span>Sắp tới: {meetings.filter(m => m.status === 'UPCOMING').length}</span>
        </div>
      </div>

      {showAddForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Tạo Cuộc họp mới</h3>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Tiêu đề cuộc họp</label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                  placeholder="Nhập tiêu đề cuộc họp"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                  placeholder="Nhập mô tả cuộc họp"
                  rows={3}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ngày</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Thời gian</label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Địa điểm</label>
                <input
                  type="text"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                  placeholder="Nhập địa điểm tổ chức"
                />
              </div>
              <div className={styles.formActions}>
                <button className={styles.cancelButton} onClick={() => setShowAddForm(false)}>
                  Hủy
                </button>
                <button className={styles.saveButton} onClick={handleAddMeeting}>
                  Tạo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.meetingsGrid}>
        {filteredMeetings.map((meeting) => (
          <div key={meeting.id} className={styles.meetingCard}>
            <div className={styles.meetingHeader}>
              <h3>{meeting.title}</h3>
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
                <span>{new Date(meeting.date).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className={styles.detail}>
                <ClockCircleOutlined />
                <span>{meeting.time}</span>
              </div>
              <div className={styles.detail}>
                <EnvironmentOutlined />
                <span>{meeting.location}</span>
              </div>
              <div className={styles.detail}>
                <TeamOutlined />
                <span>{meeting.participants.length} người tham gia</span>
              </div>
            </div>

            {meeting.agenda.length > 0 && (
              <div className={styles.agenda}>
                <h4>Chương trình nghị sự:</h4>
                <ul>
                  {meeting.agenda.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.actions}>
              <button className={styles.viewButton}>
                <EyeOutlined />
                Xem chi tiết
              </button>
              <button className={styles.editButton}>
                <EditOutlined />
                Sửa
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDeleteMeeting(meeting.id)}
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