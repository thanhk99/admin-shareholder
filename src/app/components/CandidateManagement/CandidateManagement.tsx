'use client';

import { useState, useEffect } from 'react';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CrownOutlined
} from '@ant-design/icons';
import styles from './CandidateManagement.module.css';
import { Candidate, CandidateFormData } from '@/app/types/candidate';
import { useSearchParams } from 'next/navigation';

export default function CandidateManagement() {
    const searchParams = useSearchParams();
    const meetingCode = searchParams.get('meeting');

    const [candidates, setCandidates] = useState<Candidate[]>([
        {
        id: '1',
        meetingCode: 'CLIENT-ABC-MEET',
        candidateName: 'Ông Nguyễn Văn A',
        candidateInfo: 'Có 10 năm kinh nghiệm trong lĩnh vực tài chính. Từng giữ vị trí Giám đốc Tài chính tại các tập đoàn lớn.',
        currentPosition: 'Giám đốc Tài chính',
        amountVotes: 750000,
        isActive: true,
        createAt: '2024-05-01T00:00:00'
        },
        {
        id: '2',
        meetingCode: 'CLIENT-ABC-MEET',
        candidateName: 'Bà Trần Thị B',
        candidateInfo: 'Chuyên gia về quản trị doanh nghiệp với 8 năm kinh nghiệm. Có bằng thạc sĩ Quản trị Kinh doanh.',
        currentPosition: 'Trưởng phòng Nhân sự',
        amountVotes: 600000,
        isActive: true,
        createAt: '2024-05-01T00:00:00'
        },
        {
        id: '3',
        meetingCode: 'CLIENT-ABC-MEET',
        candidateName: 'Ông Lê Văn C',
        candidateInfo: 'Chuyên gia công nghệ và đổi mới với 12 năm kinh nghiệm trong lĩnh vực CNTT.',
        currentPosition: 'Giám đốc Công nghệ',
        amountVotes: 450000,
        isActive: true,
        createAt: '2024-05-01T00:00:00'
        },
        {
        id: '4',
        meetingCode: 'CLIENT-DEF-MEET',
        candidateName: 'Bà Phạm Thị D',
        candidateInfo: 'Chuyên gia về pháp lý và tuân thủ với 15 năm kinh nghiệm.',
        currentPosition: 'Trưởng phòng Pháp chế',
        amountVotes: 300000,
        isActive: false,
        createAt: '2024-05-02T00:00:00',
        updateAt: '2024-05-15T00:00:00'
        }
    ]);

    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<CandidateFormData>({
        candidateName: '',
        candidateInfo: '',
        currentPosition: '',
        meetingCode: ''
    });

    const filteredCandidates = candidates.filter(candidate =>
        candidate.meetingCode === meetingCode && (
        candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.currentPosition.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Reset form khi mở modal
    useEffect(() => {
        if (showForm) {
        if (formMode === 'edit' && selectedCandidate) {
            setFormData({
            candidateName: selectedCandidate.candidateName,
            candidateInfo: selectedCandidate.candidateInfo,
            currentPosition: selectedCandidate.currentPosition,
            meetingCode: selectedCandidate.meetingCode
            });
        } else {
            setFormData({
            candidateName: '',
            candidateInfo: '',
            currentPosition: '',
            meetingCode: ''
            });
        }
        }
    }, [showForm, formMode, selectedCandidate]);

    const handleCreateCandidate = async () => {
        setLoading(true);
        try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newCandidate: Candidate = {
            id: Date.now().toString(),
            ...formData,
            amountVotes: 0,
            isActive: true,
            createAt: new Date().toISOString()
        };

        setCandidates([...candidates, newCandidate]);
        setShowForm(false);
        setFormData({
            candidateName: '',
            candidateInfo: '',
            currentPosition: '',
            meetingCode: ''
        });
        } catch (error) {
        console.error('Error creating candidate:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleUpdateCandidate = async () => {
        if (!selectedCandidate) return;
        
        setLoading(true);
        try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedCandidates = candidates.map(candidate =>
            candidate.id === selectedCandidate.id
            ? {
                ...candidate,
                ...formData,
                updateAt: new Date().toISOString(),
                updateBy: 'admin'
                }
            : candidate
        );

        setCandidates(updatedCandidates);
        setShowForm(false);
        setSelectedCandidate(null);
        } catch (error) {
        console.error('Error updating candidate:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleDeleteCandidate = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xóa ứng viên này?')) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setCandidates(candidates.filter(candidate => candidate.id !== id));
        } catch (error) {
            console.error('Error deleting candidate:', error);
        }
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCandidates(candidates.map(candidate =>
            candidate.id === id
            ? {
                ...candidate,
                isActive: !candidate.isActive,
                updateAt: new Date().toISOString(),
                updateBy: 'admin'
                }
            : candidate
        ));
        } catch (error) {
        console.error('Error toggling candidate status:', error);
        }
    };

    const handleEdit = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setFormMode('edit');
        setShowForm(true);
    };

    const handleCreateNew = () => {
        setSelectedCandidate(null);
        setFormMode('create');
        setShowForm(true);
    };

    const getStatusLabel = (isActive: boolean) => {
        return isActive ? 'Đang hoạt động' : 'Đã khóa';
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? '#2ecc71' : '#e74c3c';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
        });
    };

    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.amountVotes, 0);
    const activeCandidates = candidates.filter(c => c.isActive).length;
    const inactiveCandidates = candidates.filter(c => !c.isActive).length;

    return (
        <div className={styles.management}>
        <div className={styles.header}>
            <div>
            <h1>Quản lý Ứng viên HĐQT</h1>
            <p>Quản lý danh sách ứng viên tham gia bầu cử Hội đồng Quản trị</p>
            </div>
            <button 
            className={styles.addButton}
            onClick={handleCreateNew}
            >
            <PlusOutlined />
            Thêm Ứng viên
            </button>
        </div>

        <div className={styles.toolbar}>
            <div className={styles.searchBox}>
            <SearchOutlined />
            <input
                type="text"
                placeholder="Tìm kiếm ứng viên theo tên, vị trí hoặc mã cuộc họp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            <div className={styles.stats}>
            <span className={styles.statItem}>
                <TeamOutlined />
                Tổng: {candidates.length} ứng viên
            </span>
            <span className={styles.statItem}>
                <CheckCircleOutlined style={{ color: '#2ecc71' }} />
                Đang hoạt động: {activeCandidates}
            </span>
            <span className={styles.statItem}>
                <CloseCircleOutlined style={{ color: '#e74c3c' }} />
                Đã khóa: {inactiveCandidates}
            </span>
            <span className={styles.statItem}>
                <BarChartOutlined />
                Tổng phiếu: {totalVotes.toLocaleString()}
            </span>
            </div>
        </div>

        {/* Form Modal */}
        {showForm && (
            <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                <h3>{formMode === 'create' ? 'Thêm Ứng viên Mới' : 'Chỉnh sửa Ứng viên'}</h3>
                <button 
                    className={styles.closeButton}
                    onClick={() => setShowForm(false)}
                    disabled={loading}
                >
                    ×
                </button>
                </div>
                
                <form onSubmit={(e) => {
                e.preventDefault();
                formMode === 'create' ? handleCreateCandidate() : handleUpdateCandidate();
                }} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Tên ứng viên *</label>
                    <input
                    type="text"
                    value={formData.candidateName}
                    onChange={(e) => setFormData({...formData, candidateName: e.target.value})}
                    placeholder="Nhập họ tên ứng viên"
                    required
                    disabled={loading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Vị trí hiện tại *</label>
                    <input
                    type="text"
                    value={formData.currentPosition}
                    onChange={(e) => setFormData({...formData, currentPosition: e.target.value})}
                    placeholder="Nhập vị trí/chức vụ hiện tại"
                    required
                    disabled={loading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Mã cuộc họp *</label>
                    <input
                    type="text"
                    value={formData.meetingCode}
                    onChange={(e) => setFormData({...formData, meetingCode: e.target.value})}
                    placeholder="Nhập mã cuộc họp"
                    required
                    disabled={loading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Thông tin ứng viên</label>
                    <textarea
                    value={formData.candidateInfo}
                    onChange={(e) => setFormData({...formData, candidateInfo: e.target.value})}
                    placeholder="Nhập thông tin chi tiết về ứng viên (kinh nghiệm, thành tích, ...)"
                    rows={4}
                    disabled={loading}
                    />
                </div>

                <div className={styles.formActions}>
                    <button 
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowForm(false)}
                    disabled={loading}
                    >
                    Hủy
                    </button>
                    <button 
                    type="submit"
                    className={styles.saveButton}
                    disabled={loading || !formData.candidateName || !formData.currentPosition || !formData.meetingCode}
                    >
                    {loading ? 'Đang xử lý...' : formMode === 'create' ? 'Thêm' : 'Cập nhật'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        <div className={styles.candidatesGrid}>
            {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className={styles.candidateCard}>
                <div className={styles.cardHeader}>
                <div className={styles.candidateBasic}>
                    <div className={styles.avatar}>
                    <UserOutlined />
                    </div>
                    <div className={styles.candidateMain}>
                    <h3>{candidate.candidateName}</h3>
                    <span className={styles.position}>{candidate.currentPosition}</span>
                    </div>
                </div>
                <div className={styles.statusBadge}>
                    <span 
                    className={styles.status}
                    style={{ backgroundColor: getStatusColor(candidate.isActive) }}
                    >
                    {getStatusLabel(candidate.isActive)}
                    </span>
                </div>
                </div>

                <div className={styles.cardBody}>
                <p className={styles.candidateInfo}>
                    {candidate.candidateInfo}
                </p>

                <div className={styles.candidateDetails}>
                    <div className={styles.detailItem}>
                    <span className={styles.label}>Mã cuộc họp:</span>
                    <span className={styles.value}>{candidate.meetingCode}</span>
                    </div>
                    <div className={styles.detailItem}>
                    <span className={styles.label}>Số phiếu bầu:</span>
                    <span className={styles.votes}>{candidate.amountVotes.toLocaleString()} cổ phần</span>
                    </div>
                    <div className={styles.detailItem}>
                    <span className={styles.label}>Ngày tạo:</span>
                    <span className={styles.value}>{formatDate(candidate.createAt)}</span>
                    </div>
                    {candidate.updateAt && (
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Cập nhật:</span>
                        <span className={styles.value}>{formatDate(candidate.updateAt)}</span>
                    </div>
                    )}
                </div>
                </div>

                <div className={styles.cardFooter}>
                <div className={styles.actions}>
                    <button 
                    className={styles.viewButton}
                    onClick={() => handleEdit(candidate)}
                    >
                    <EyeOutlined />
                    Xem
                    </button>
                    <button 
                    className={styles.editButton}
                    onClick={() => handleEdit(candidate)}
                    >
                    <EditOutlined />
                    Sửa
                    </button>
                    <button 
                    className={candidate.isActive ? styles.deactivateButton : styles.activateButton}
                    onClick={() => handleToggleStatus(candidate.id)}
                    >
                    {candidate.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                    {candidate.isActive ? 'Khóa' : 'Kích hoạt'}
                    </button>
                    <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteCandidate(candidate.id)}
                    >
                    <DeleteOutlined />
                    Xóa
                    </button>
                </div>
                </div>
            </div>
            ))}
        </div>

        {filteredCandidates.length === 0 && (
            <div className={styles.emptyState}>
            <UserOutlined />
            <p>Không tìm thấy ứng viên nào</p>
            <button 
                className={styles.addButton}
                onClick={handleCreateNew}
            >
                <PlusOutlined />
                Thêm ứng viên đầu tiên
            </button>
            </div>
        )}
        </div>
    );
}