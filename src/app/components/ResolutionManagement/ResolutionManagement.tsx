'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './ResolutionManagement.module.css';
import ResolutionCard from './ResolutionCard/ResolutionCard';
import ResolutionViewModal from './ResolutionViewModal/ResolutionViewModal';
import { Resolution, ResolutionFormData, ResolutionVote } from '@/app/types/resolution';
import ResolutionEditModal from './ResolutionEditModal/ResolutionEditModal';
import ResolutionAddModal from './ResolutionAddModal/ResolutionAddModal';
import { ResolutionService } from '@/lib/api/resolution';
import { ApiResponse } from '@/app/types/voting';



export default function ResolutionManagement() {
  const params = useParams();
  const meetingCode = params.meeting as string;
  
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching resolutions for meeting:', meetingCode);
        const response: ApiResponse = await ResolutionService.getResolutionByMeeting(meetingCode);
        console.log('API Response:', response);
        
        if (response.status === 'success') {
          // Lưu thông tin cuộc họp
          setMeetingInfo(response.data.meeting);
          
          const transformedResolutions: Resolution[] = response.data.resolutionVotes.map((item: ResolutionVote, index: number) => ({
            id: (index + 1).toString(),
            meetingCode: response.data.meeting.meetingCode,
            resolutionCode: item.resolutionCode,
            title: item.title,
            description: item.description,
            totalAgree: item.agreeVotes,
            totalNotAgree: item.notAgreeVotes,
            totalNotIdea: item.noIdeaVotes,
            createdAt: response.data.meeting.createdAt,
            createBy: response.data.meeting.createBy || 'system',
            isActive: true
          }));
          
          setResolutions(transformedResolutions);
        } else {
          setError('Không thể tải dữ liệu từ server');
          setResolutions([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Có lỗi xảy ra khi tải dữ liệu');
        setResolutions([]);
      } finally {
        setLoading(false);
      }
    };

    if (meetingCode) {
      fetchData();
    } else {
      setError('Không tìm thấy mã cuộc họp');
      setLoading(false);
    }
  }, [meetingCode]);

  const handleAddResolution = async (resolutionData: any) => {
    setSaveLoading(true);
    try {
      // Gọi API để thêm nghị quyết mới
      const response = await ResolutionService.createResolution({
        ...resolutionData,
        meetingCode: meetingCode
      });
      
      if (response.status === 'success') {
        // Thêm vào state
        const newResolution: Resolution = {
          ...resolutionData,
          id: (resolutions.length + 1).toString(),
          createdAt: new Date().toISOString(),
        };
        
        setResolutions(prev => [...prev, newResolution]);
        setAddModalOpen(false);
      } else {
        throw new Error(response.message || 'Không thể thêm nghị quyết');
      }
    } catch (error) {
      console.error('Error adding resolution:', error);
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredResolutions = resolutions.filter(resolution =>
    resolution.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resolution.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resolution.resolutionCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (resolution: Resolution) => {
    setSelectedResolution(resolution);
    setViewModalOpen(true);
  };

  const handleEdit = (resolution: Resolution) => {
    setSelectedResolution(resolution);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (formData: ResolutionFormData) => {
    setSaveLoading(true);
    try {
      // Gọi API để cập nhật nghị quyết
      formData.meetingCode = meetingCode;
      formData.resolutionCode = selectedResolution?.resolutionCode || '';
      console.log('Saving edited resolution:', formData);

      const response = await ResolutionService.updateResolution(formData);
      
      if (response.status === 'success') {
        setResolutions(prev => prev.map(res => 
          res.resolutionCode === selectedResolution?.resolutionCode 
            ? { ...res, ...formData }
            : res
        ));
        
        setEditModalOpen(false);
        setSelectedResolution(null);
      } else {
        throw new Error(response.message || 'Không thể cập nhật nghị quyết');
      }
    } catch (error) {
      console.error('Error saving resolution:', error);
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };

  // Sửa hàm handleToggleActive để nhận resolutionCode và currentStatus
  const handleToggleActive = async (resolutionCode: string, currentStatus: boolean) => {
    if (confirm(`Bạn có chắc muốn ${currentStatus ? 'khoá' : 'mở khoá'} nghị quyết này?`)) {
      
      try {
        const response = await ResolutionService.updateResolutionStatus(resolutionCode, !currentStatus);
        
        if (response.status === 'success') {
          // Cập nhật state local
          setResolutions(prev => prev.map(res => 
            res.resolutionCode === resolutionCode ? { ...res, isActive: !currentStatus } : res
          ));
        } else {
          alert('Không thể thay đổi trạng thái nghị quyết');
        }
      } catch (error) {
        console.error('Error toggling resolution active:', error);
        alert('Có lỗi xảy ra khi thay đổi trạng thái');
      }
    }
  };

  const getApprovedCount = () => {
    return resolutions.filter(res => res.totalAgree > res.totalNotAgree).length;
  };

  const getTotalVotes = () => {
    return resolutions.reduce((total, res) => total + res.totalAgree + res.totalNotAgree + res.totalNotIdea, 0);
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3 className={styles.errorTitle}>Lỗi</h3>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.management}>
      {/* Header với thông tin cuộc họp */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>📋</div>
          <div>
            <h1 className={styles.headerTitle}>Quản lý Nghị quyết</h1>
            <p className={styles.headerSubtitle}>
              {meetingInfo?.title} • {resolutions.length} nghị quyết • {getApprovedCount()} đã thông qua
            </p>
            {meetingInfo && (
              <div className={styles.meetingDetails}>
                <span className={styles.meetingCode}>Mã: {meetingInfo.meetingCode}</span>
                <span className={styles.meetingDate}>
                  {new Date(meetingInfo.meetingDate).toLocaleDateString('vi-VN')}
                </span>
                {meetingInfo.location && (
                  <span className={styles.meetingLocation}>📍 {meetingInfo.location}</span>
                )}
                <span className={`${styles.meetingStatus} ${styles[meetingInfo.status.toLowerCase()]}`}>
                  {meetingInfo.status === 'COMPLETED' ? 'ĐÃ KẾT THÚC' : 
                   meetingInfo.status === 'PENDING' ? 'ĐANG DIỄN RA' : 'SẮP DIỄN RA'}
                </span>
              </div>
            )}
          </div>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setAddModalOpen(true)}
        >
          <span>+</span>
          Thêm Nghị quyết
        </button>
      </div>

      {/* Statistics */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{resolutions.length}</span>
          <span className={styles.statLabel}>Tổng nghị quyết</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{getApprovedCount()}</span>
          <span className={styles.statLabel}>Đã thông qua</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{getTotalVotes().toLocaleString()}</span>
          <span className={styles.statLabel}>Tổng phiếu bầu</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>
            {resolutions.length > 0 ? Math.round((getApprovedCount() / resolutions.length) * 100) : 0}%
          </span>
          <span className={styles.statLabel}>Tỷ lệ thông qua</span>
        </div>
      </div>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <div className={styles.searchIcon}>🔍</div>
          <input
            type="text"
            placeholder="Tìm kiếm nghị quyết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.stats}>
          Hiển thị {filteredResolutions.length}/{resolutions.length} nghị quyết
        </div>
      </div>

      {/* Resolutions Grid */}
      <div className={styles.resolutionGrid}>
        {filteredResolutions.map((resolution) => (
          <ResolutionCard
            key={resolution.id}
            resolution={resolution}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredResolutions.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <h3 className={styles.emptyTitle}>Không tìm thấy nghị quyết</h3>
          <p className={styles.emptyDescription}>
            {searchTerm ? 'Thử tìm kiếm với từ khoá khác' : 'Chưa có nghị quyết nào được tạo'}
          </p>
          <button 
            className={styles.addButton}
            onClick={() => setAddModalOpen(true)}
          >
            + Thêm Nghị quyết đầu tiên
          </button>
        </div>
      )}

      {/* Modals */}
      <ResolutionAddModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddResolution}
        loading={saveLoading}
      />

      <ResolutionViewModal
        isOpen={viewModalOpen}
        resolution={selectedResolution}
        onClose={() => setViewModalOpen(false)}
      />

      <ResolutionEditModal
        isOpen={editModalOpen}
        resolution={selectedResolution}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
        loading={saveLoading}
      />
    </div>
  );
}