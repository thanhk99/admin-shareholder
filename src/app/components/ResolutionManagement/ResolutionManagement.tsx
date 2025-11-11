'use client';

import { useState, useEffect } from 'react';
import styles from './ResolutionManagement.module.css';
import ResolutionCard from './ResolutionCard/ResolutionCard';
import ResolutionViewModal from './ResolutionViewModal/ResolutionViewModal';
import { Resolution } from '@/app/types/resolution';
import ResolutionEditModal from './ResolutionEditModal/ResolutionEditModal';
import ResolutionAddModal from './ResolutionAddModal/ResolutionAddModal';

export default function ResolutionManagement() {
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Dữ liệu mẫu
  const mockResolutions: Resolution[] = [
    {
      id: '1',
      meetingCode: 'CLIENT-ABC-MEET',
      resolutionCode: 'RES-2024-001',
      title: 'Thông qua Báo cáo Tài chính năm 2023',
      description: 'Biểu quyết thông qua Báo cáo Tài chính đã được kiểm toán cho năm tài chính 2023.',
      totalAgree: 45,
      totalNotAgree: 3,
      totalNotIdea: 2,
      createdAt: '2024-01-15T08:00:00',
      createBy: 'admin',
      isActive: true
    },
    {
      id: '2',
      meetingCode: 'CLIENT-ABC-MEET',
      resolutionCode: 'RES-2024-002',
      title: 'Thông qua Báo cáo Tài chính năm 2023',
      description: 'Biểu quyết thông qua Báo cáo Tài chính đã được kiểm toán cho năm tài chính 2023.',
      totalAgree: 45,
      totalNotAgree: 3,
      totalNotIdea: 2,
      createdAt: '2024-01-15T08:00:00',
      createBy: 'admin',
      isActive: true
    },
  ];
  const handleAddResolution = async (resolutionData: any) => {
    setSaveLoading(true);
    try {
      // Gọi API để thêm nghị quyết mới
      await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập API call
      
      // Thêm vào state
      const newResolution: Resolution = {
        ...resolutionData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      setResolutions(prev => [...prev, newResolution]);
    } catch (error) {
      console.error('Error adding resolution:', error);
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setTimeout(() => {
          setResolutions(mockResolutions);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching data:', error);
        setResolutions([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleSaveEdit = async (formData: any) => {
    setSaveLoading(true);
    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResolutions(prev => prev.map(res => 
        res.id === selectedResolution?.id 
          ? { ...res, ...formData }
          : res
      ));
      
      setEditModalOpen(false);
      setSelectedResolution(null);
    } catch (error) {
      console.error('Error saving resolution:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleActive = (resolutionId: string, currentStatus: boolean) => {
    if (confirm(`Bạn có chắc muốn ${currentStatus ? 'khoá' : 'mở khoá'} nghị quyết này?`)) {
      setResolutions(prev => prev.map(res => 
        res.id === resolutionId ? { ...res, isActive: !currentStatus } : res
      ));
    }
  };

  const getApprovedCount = () => {
    return resolutions.filter(res => res.totalAgree > res.totalNotAgree).length;
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className={styles.management}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>📋</div>
          <div>
            <h1 className={styles.headerTitle}>Quản lý Nghị quyết</h1>
            <p className={styles.headerSubtitle}>
              {resolutions.length} nghị quyết • {getApprovedCount()} đã thông qua
            </p>
          </div>
        </div>
        <button className={styles.addButton}
          onClick={() => setAddModalOpen(true)}>
          <span>+</span>
          Thêm Nghị quyết
        </button>
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
        </div>
      )}

      <ResolutionAddModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddResolution}
        loading={saveLoading}
      />
      {/* Modals */}
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