'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './CandidateManagement.module.css';
import { Candidate, CandidateRequest } from '@/app/types/candidate';
import { VotingItem } from '@/app/types/resolution';
import { Election } from '@/app/types/election';
import CandidateService from '@/lib/api/candidate';
import { ElectionService } from '@/lib/api/election';
import { ResolutionService } from '@/lib/api/resolution';
import { MeetingService } from '@/lib/api/meetings';
import CandidateFormModal from './CandidateFormModal/CandidateFormModal';
import CandidateCard from './CandidateCard/CandidateCard';
import ElectionFormModal from '../ElectionManagementAdmin/ElectionFormModal/ElectionFormModal';
import { Spin, Empty, Button, Tabs } from 'antd';
import { PlusOutlined, UsergroupAddOutlined } from '@ant-design/icons';

export default function CandidateManagement() {
    const params = useParams();
    const router = useRouter();
    const meetingId = params.meeting as string;

    const [loading, setLoading] = useState(true);
    const [electionItems, setElectionItems] = useState<VotingItem[]>([]);
    const [selectedVotingItem, setSelectedVotingItem] = useState<VotingItem | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    // Modal state
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formLoading, setFormLoading] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    // Election Modal state
    const [showElectionModal, setShowElectionModal] = useState(false);
    const [electionFormLoading, setElectionFormLoading] = useState(false);

    // Initial Fetch: Get all election items for the meeting
    const fetchElectionItems = async () => {
        try {
            setLoading(true);
            // Lấy meeting details để có elections
            const meetingResponse = await MeetingService.getMeetingById(meetingId);
            const meeting = meetingResponse?.data || meetingResponse;
            const itemsArray = meeting?.elections || [];

            // The backend returns Election objects now
            setElectionItems(itemsArray);

            // Default select the first one if available and none selected
            if (itemsArray.length > 0 && !selectedVotingItem) {
                setSelectedVotingItem(itemsArray[0]);
            }
        } catch (error) {
            console.error('Error fetching election items:', error);
        } finally {
            setLoading(false);
        }
    };


    // Fetch Candidates when selectedVotingItem changes
    useEffect(() => {
        if (selectedVotingItem) {
            fetchCandidates(selectedVotingItem.id);
        } else {
            setCandidates([]);
        }
    }, [selectedVotingItem]);

    const fetchCandidates = async (votingItemId: string) => {
        try {
            // Sử dụng API lấy thông tin bầu cử để có danh sách ứng viên (theo API 5.2)
            const response = await ElectionService.getElectionById(votingItemId);
            const electionData = response?.data || response;
            const candidateList = electionData?.votingOptions || [];
            setCandidates(candidateList);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    };

    useEffect(() => {
        if (meetingId) {
            fetchElectionItems();
        }
    }, [meetingId]);

    const handleCreateCandidate = async (data: CandidateRequest, electionId: string) => {
        if (!electionId) {
            alert('Vui lòng chọn cuộc bầu cử');
            return;
        }
        setFormLoading(true);
        try {
            await ElectionService.addCandidateToElection(electionId, data);
            await fetchCandidates(electionId);
            // Sync current tab if different
            if (selectedVotingItem?.id !== electionId) {
                const item = electionItems.find(i => i.id === electionId);
                setSelectedVotingItem(item || null);
            }
            setShowForm(false);
        } catch (error) {
            console.error('Error creating candidate:', error);
            alert('Không thể tạo ứng viên. Vui lòng thử lại.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateCandidate = async (data: CandidateRequest, electionId: string) => {
        if (!selectedCandidate) return;
        setFormLoading(true);
        try {
            await ElectionService.updateCandidate(selectedCandidate.id, data);
            await fetchCandidates(electionId);
            setShowForm(false);
            setSelectedCandidate(null);
        } catch (error) {
            console.error('Error updating candidate:', error);
            alert('Không thể cập nhật ứng viên.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteCandidate = async (candidateId: string) => {
        if (!selectedVotingItem) return;
        if (!confirm('Bạn có chắc chắn muốn xóa ứng viên này?')) return;

        try {
            await ElectionService.deleteCandidate(candidateId);
            await fetchCandidates(selectedVotingItem.id);
        } catch (error) {
            console.error('Error deleting candidate:', error);
            alert('Không thể xóa ứng viên.');
        }
    };

    const openCreateModal = () => {
        setFormMode('create');
        setSelectedCandidate(null);
        setShowForm(true);
    };

    const openEditModal = (candidate: Candidate) => {
        setFormMode('edit');
        setSelectedCandidate(candidate);
        setShowForm(true);
    };

    const handleCreateElectionSuccess = () => {
        setShowElectionModal(false);
        fetchElectionItems();
    };

    // Construct tab items for Antd Tabs
    const tabItems = electionItems.map((item: any) => ({
        key: item.id,
        label: `${item.title} (${(item.votingType || item.electionType) === 'BOARD_OF_DIRECTORS' ? 'HĐQT' : 'BKS'})`,
    }));

    if (loading && electionItems.length === 0) {
        return <div className={styles.loadingContainer}><Spin size="large" /></div>;
    }

    return (
        <div className={styles.management}>
            <div className={styles.header}>
                <div>
                    <h1>Quản lý Ứng viên Bầu cử</h1>
                    <p>Quản lý danh sách ứng viên cho các nội dung bầu cử trong cuộc họp</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openCreateModal}
                    size="large"
                    disabled={electionItems.length === 0}
                >
                    Thêm Ứng viên
                </Button>
                <Button
                    icon={<PlusOutlined />}
                    onClick={() => setShowElectionModal(true)}
                    size="large"
                    style={{ marginLeft: 8 }}
                >
                    Thêm Bầu cử
                </Button>
            </div>

            {electionItems.length === 0 ? (
                <Empty
                    description={
                        <div style={{ marginTop: 16 }}>
                            <p>Chưa có nội dung bầu cử (HĐQT/BKS). Vui lòng tạo nội dung bầu cử trước khi thêm ứng viên.</p>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setShowElectionModal(true)}
                            >
                                Tạo Nội dung Bầu cử
                            </Button>
                        </div>
                    }
                />
            ) : (
                <>
                    <Tabs
                        activeKey={selectedVotingItem?.id}
                        onChange={(key) => {
                            const item = electionItems.find(i => i.id === key);
                            setSelectedVotingItem(item || null);
                        }}
                        items={tabItems}
                        className={styles.tabs}
                    />

                    <div className={styles.toolbar}>
                        <h3>Danh sách ứng viên cho: {selectedVotingItem?.title}</h3>
                    </div>

                    <div className={styles.candidatesGrid}>
                        {candidates.length > 0 ? (
                            candidates.map(candidate => (
                                <CandidateCard
                                    key={candidate.id}
                                    candidate={candidate}
                                    onEdit={openEditModal}
                                    onDelete={handleDeleteCandidate}
                                />
                            ))
                        ) : (
                            <div className={styles.emptyCandidates}>
                                <UsergroupAddOutlined style={{ fontSize: 48, color: '#ccc' }} />
                                <p>Chưa có ứng viên nào cho nội dung này.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            <CandidateFormModal
                showForm={showForm}
                formMode={formMode}
                initialData={selectedCandidate ? {
                    name: selectedCandidate.name,
                    position: selectedCandidate.position || '',
                    bio: selectedCandidate.bio || '',
                    photoUrl: selectedCandidate.photoUrl || '',
                    displayOrder: selectedCandidate.displayOrder || 1
                } : undefined}
                formLoading={formLoading}
                onClose={() => setShowForm(false)}
                onSubmit={formMode === 'create' ? handleCreateCandidate : handleUpdateCandidate}
                elections={electionItems as any}
                defaultElectionId={selectedVotingItem?.id}
            />

            <ElectionFormModal
                visible={showElectionModal}
                election={null}
                meetingId={meetingId}
                loading={electionFormLoading}
                onCancel={() => setShowElectionModal(false)}
                onSuccess={handleCreateElectionSuccess}
            />
        </div>
    );
}