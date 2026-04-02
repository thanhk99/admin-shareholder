'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftOutlined, 
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import { Modal, message, Spin, Input, Badge, Alert } from 'antd';
import styles from './ResolutionManagement.module.css';
import ResolutionCard from './ResolutionCard/ResolutionCard';
import ResolutionViewModal from './ResolutionViewModal/ResolutionViewModal';
import { VotingItem, VotingItemRequest, VotingResult } from '@/app/types/resolution';
import ResolutionEditModal from './ResolutionEditModal/ResolutionEditModal';
import ResolutionAddModal from './ResolutionAddModal/ResolutionAddModal';
import ResolutionVoteModal from './ResolutionVoteModal/ResolutionVoteModal';
import { ResolutionService } from '@/lib/api/resolution';
import { ElectionService } from '@/lib/api/election';
import { MeetingService } from '@/lib/api/meetings';
import { Meeting } from '@/app/types/meeting';
import { Election } from '@/app/types/election';

export default function ResolutionManagement() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meeting as string;

  const [votingItems, setVotingItems] = useState<VotingItem[]>([]);
  const [resultsMap, setResultsMap] = useState<Record<string, VotingResult>>({});
  const [meetingInfo, setMeetingInfo] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<VotingItem | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = meetingInfo?.status === 'SCHEDULED';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Meeting Info
      let meetingData: Meeting | null = null;
      try {
        const meetingRes = await MeetingService.getMeetingById(meetingId);
        meetingData = (meetingRes as any).data || meetingRes;
        setMeetingInfo(meetingData);
      } catch (e) {
        console.error("Failed to fetch meeting info", e);
      }

      // Get Resolutions from Meeting Info
      const resList = meetingData?.resolutions || [];

      // Normalize resolution objects
      const normalizedResolutions = resList.map((r: any) => ({
        ...r,
        votingType: r.votingType || 'RESOLUTION'
      })).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

      setVotingItems(normalizedResolutions);

      if (Array.isArray(normalizedResolutions)) {
        // Fetch Results for each item
        const results: Record<string, VotingResult> = {};
        await Promise.all(normalizedResolutions.map(async (item: VotingItem) => {
          try {
            const res = await ResolutionService.getResults(item.id);
            if (res && (res as any).data) {
              results[item.id] = (res as any).data;
            } else if (res) {
              results[item.id] = res as any;
            }
          } catch (e) {
            console.error(`Failed to fetch results for item ${item.id}`, e);
          }
        }));
        setResultsMap(results);

      } else {
        setVotingItems([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
      setVotingItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meetingId) {
      fetchData();
    }
  }, [meetingId]);

  const handleAddVotingItem = async (data: VotingItemRequest) => {
    if (!canEdit) {
      message.warning('Chỉ được phép thêm nội dung khi đại hội ở trạng thái sắp diễn ra');
      return;
    }
    setSaveLoading(true);
    try {
      const response = await ResolutionService.createResolution(meetingId, data);
      if (response) {
        fetchData();
        setAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert("Không thể thêm nội dung mới.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveEdit = async (data: VotingItemRequest) => {
    if (!selectedItem) return;
    if (!canEdit) {
      message.warning('Chỉ được phép chỉnh sửa khi đại hội ở trạng thái sắp diễn ra');
      return;
    }
    setSaveLoading(true);
    try {
      const response = await ResolutionService.updateResolution(selectedItem.id, data);
      if (response) {
        fetchData();
        setEditModalOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert("Không thể cập nhật nội dung.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleActive = async (itemId: string, currentStatus: boolean) => {
    if (!canEdit) {
      message.warning('Chính sách: Chỉ được phép thay đổi khi đại hội ở trạng thái sắp diễn ra');
      return;
    }
    Modal.confirm({
      title: currentStatus ? 'Khoá biểu quyết' : 'Mở khoá biểu quyết',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn ${currentStatus ? 'khoá' : 'mở khoá'} nội dung này?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await ResolutionService.updateStatus(itemId, !currentStatus);
          message.success('Cập nhật trạng thái thành công');
          fetchData();
        } catch (error) {
          console.error('Error toggling status:', error);
          message.error('Có lỗi xảy ra khi thay đổi trạng thái');
        }
      }
    });
  };

  const handleDeleteResolution = async (item: VotingItem) => {
    if (!canEdit) {
      message.warning('Chính sách: Chỉ được phép xóa khi đại hội ở trạng thái sắp diễn ra');
      return;
    }
    Modal.confirm({
      title: 'Xác nhận xóa nội dung',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa "${item.title}"? Hành động này không thể hoàn tác và sẽ xóa tất cả kết quả biểu quyết liên quan.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await ResolutionService.deleteResolution(item.id);
          message.success('Đã xóa nội dung thành công');
          fetchData();
        } catch (error) {
          console.error('Error deleting resolution:', error);
          message.error('Không thể xóa nội dung. Vui lòng thử lại sau.');
        }
      }
    });
  };

  const filteredItems = votingItems.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStats = (item: VotingItem, result?: VotingResult) => {
    if (!result || !result.results) return { agree: 0, disagree: 0, noIdea: 0, total: 0 };
    let agree = 0;
    let disagree = 0;
    let noIdea = 0;

    result.results.forEach(r => {
      // Find the option in the resolution's votingOptions
      const option = item.votingOptions?.find(opt => opt.id === r.votingOptionId);

      if (option?.type === 'AGREE') {
        agree += r.voteCount;
      } else if (option?.type === 'DISAGREE') {
        disagree += r.voteCount;
      } else if (option?.type === 'NO_IDEA') {
        noIdea += r.voteCount;
      } else {
        // Fallback for old data or if type is missing (using ID matching)
        const id = (r.votingOptionId || '').toLowerCase();
        if (id === 'yes') agree += r.voteCount;
        else if (id === 'no') disagree += r.voteCount;
        else if (id === 'not_agree') noIdea += r.voteCount;
      }
    });
    return { agree, disagree, noIdea, total: result.totalVoters };
  };

  const getApprovedCount = () => {
    return votingItems.filter(item => {
      const stats = getStats(item, resultsMap[item.id]);
      return stats.agree > stats.disagree;
    }).length;
  };

  const getTotalVotes = () => {
    return Object.values(resultsMap).reduce((acc, curr) => acc + (curr.totalVoters || 0), 0);
  };

  if (loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  return (
    <div className={styles.management}>
      <button className={styles.backButton} onClick={() => router.push('/meetings')}>
        <ArrowLeftOutlined /> Quay lại danh sách cuộc họp
      </button>

      {meetingInfo && meetingInfo.status !== 'SCHEDULED' && (
        <Alert
          message="Chế độ Read-only"
          description={`Đại hội đang ở trạng thái "${meetingInfo.status}". Bạn chỉ có thể xem dữ liệu và kết quả, không thể thêm mới, sửa hoặc xóa nội dung biểu quyết.`}
          type="info"
          showIcon
          icon={<LockOutlined />}
          style={{ marginBottom: '20px' }}
        />
      )}

      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>📋</div>
          <div>
            <h1 className={styles.headerTitle}>Quản lý Nội dung Biểu quyết</h1>
            <p className={styles.headerSubtitle}>
              {meetingInfo?.title} • {votingItems.length} mục • {getApprovedCount()} đã thông qua
            </p>
            {meetingInfo && (
              <div className={styles.meetingDetails}>
                <span className={styles.meetingCode}>ID: {meetingInfo.id}</span>
                <span className={styles.meetingDate}>
                  {meetingInfo.meetingDate ? new Date(meetingInfo.meetingDate).toLocaleDateString('vi-VN') : new Date(meetingInfo.startTime).toLocaleDateString('vi-VN')}
                </span>
                <span className={`${styles.meetingStatus} ${styles[meetingInfo.status?.toLowerCase()]}`}>
                  {meetingInfo.status}
                </span>
              </div>
            )}
          </div>
        </div>
        {canEdit && (
          <button className={styles.addButton} onClick={() => setAddModalOpen(true)}>
            <span>+</span> Thêm Nội dung
          </button>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{votingItems.length}</span>
          <span className={styles.statLabel}>Tổng mục</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{getApprovedCount()}</span>
          <span className={styles.statLabel}>Đã thông qua</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{getTotalVotes().toLocaleString()}</span>
          <span className={styles.statLabel}>Tổng lượt bầu</span>
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <div className={styles.searchIcon}>🔍</div>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.stats}>
          Hiển thị {filteredItems.length}/{votingItems.length} mục
        </div>
      </div>

      <div className={styles.resolutionGrid}>
        {filteredItems.map((item) => (
          <ResolutionCard
            key={item.id}
            votingItem={item}
            result={resultsMap[item.id]}
            meetingStatus={meetingInfo?.status}
            onViewDetail={(i) => { setSelectedItem(i); setViewModalOpen(true); }}
            onEdit={(i) => { setSelectedItem(i); setEditModalOpen(true); }}
            onDelete={handleDeleteResolution}
            onToggleActive={handleToggleActive}
            onVote={(i: VotingItem) => { setSelectedItem(i); setVoteModalOpen(true); }}
          />
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <h3 className={styles.emptyTitle}>Chưa có nội dung nào</h3>
          {canEdit && (
            <button className={styles.addButton} onClick={() => setAddModalOpen(true)}>
              + Thêm mục đầu tiên
            </button>
          )}
        </div>
      )}

      <ResolutionAddModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddVotingItem}
        loading={saveLoading}
      />

      <ResolutionEditModal
        isOpen={editModalOpen}
        votingItem={selectedItem} // Type will match updated modal
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
        loading={saveLoading}
      />

      <ResolutionViewModal
        isOpen={viewModalOpen}
        votingItem={selectedItem}
        result={selectedItem ? resultsMap[selectedItem.id] : undefined}
        meetingStatus={meetingInfo?.status}
        onClose={() => setViewModalOpen(false)}
      />

      <ResolutionVoteModal
        isOpen={voteModalOpen}
        votingItem={selectedItem}
        onClose={() => setVoteModalOpen(false)}
        onSuccess={() => { fetchData(); alert('Thao tác thành công!'); }}
      />
    </div>
  );
}