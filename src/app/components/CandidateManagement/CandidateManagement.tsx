'use client';

import { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import styles from './CandidateManagement.module.css';
import { Candidate, CandidateFormData } from '@/app/types/candidate';
import { useParams } from 'next/navigation';
import CandidateService from '@/lib/api/candidate';
import axios from 'axios';

// Components
import CandidateHeader from './CandidateHeader/CandidateHeader';
import CandidateToolbar from './CandidateToolbar/CandidateToolbar';
import CandidateFormModal from './CandidateFormModal/CandidateFormModal';
import CandidateGrid from './CandidateGrip/CandidateGrip';
import CandidateStatus from './CandidateStatus/CandidateStatus';

// Interface cho API response
interface ApiCandidate {
  id: number;
  meeting: {
    meetingCode: string;
    title: string;
    description: string;
    meetingDate: string;
    location: string;
    status: string;
    dayStart: string;
    dayEnd: string;
    createdAt: string;
    updatedAt: string;
    createBy: string | null;
    updateBy: string;
  };
  candidateName: string;
  candidateInfo: string;
  currentPosition: string;
  amountVotes: number | null;
  createAt: string;
  createBy: string;
  updateAt: string | null;
  updateBy: string | null;
  active: boolean;
}

export default function CandidateManagement() {
    const searchParams = useParams();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formLoading, setFormLoading] = useState(false);
    const meetingCode = searchParams.meeting as string;

    const [formData, setFormData] = useState<CandidateFormData>({
        id:'',
        candidateName: '',
        candidateInfo: '',
        currentPosition: '',
        meetingCode: ''
    });

    // Hàm chuyển đổi từ API candidate sang Candidate type
    const mapApiCandidateToCandidate = (apiCandidate: ApiCandidate): Candidate => {
        return {
            id: apiCandidate.id.toString(),
            meetingCode: apiCandidate.meeting.meetingCode,
            candidateName: apiCandidate.candidateName,
            candidateInfo: apiCandidate.candidateInfo,
            currentPosition: apiCandidate.currentPosition,
            amountVotes: apiCandidate.amountVotes || 0,
            isActive: apiCandidate.active,
            createAt: apiCandidate.createAt,
            updateAt: apiCandidate.updateAt || undefined    
        };
    };

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            if (meetingCode) {
                const response = await CandidateService.getCandidateMeeting(meetingCode);
                if (response.status === "success") {
                    const mappedCandidates = response.data.map((apiCandidate: ApiCandidate) => 
                        mapApiCandidateToCandidate(apiCandidate)
                    );
                    setCandidates(mappedCandidates);
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error:', error.response?.data);
            } else {
                console.error('Unexpected error:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (meetingCode) {
            fetchCandidates();
        }
    }, [meetingCode]);

    const filteredCandidates = candidates.filter(candidate =>
        candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.currentPosition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset form khi mở modal
    useEffect(() => {
        if (showForm) {
            if (formMode === 'edit' && selectedCandidate) {
                setFormData({
                    id:selectedCandidate.id,
                    candidateName: selectedCandidate.candidateName,
                    candidateInfo: selectedCandidate.candidateInfo,
                    currentPosition: selectedCandidate.currentPosition,
                    meetingCode: selectedCandidate.meetingCode
                });
            } else {
                setFormData({
                    id:'',
                    candidateName: '',
                    candidateInfo: '',
                    currentPosition: '',
                    meetingCode: meetingCode || ''
                });
            }
        }
    }, [showForm, formMode, selectedCandidate, meetingCode]);

    const handleCreateCandidate = async () => {
        setFormLoading(true);
        try {
            formData.meetingCode = meetingCode;
            const response = await CandidateService.createCandidate(formData);
            if (response.status === "success") {
                await fetchCandidates();
                setShowForm(false);
                setFormData({
                    id:'',
                    candidateName: '',
                    candidateInfo: '',
                    currentPosition: '',
                    meetingCode: ''
                });
            }
        } catch (error) {
            console.error('Error creating candidate:', error);
            alert('Lỗi khi tạo ứng viên');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateCandidate = async () => {
        if (!selectedCandidate) return;
        
        setFormLoading(true);
        try {
            formData.id=selectedCandidate.id;
            const response = await CandidateService.updateCandidate(formData);
            if (response.status === "success") {
                await fetchCandidates();
                setShowForm(false);
                setSelectedCandidate(null);
            }
        } catch (error) {
            console.error('Error updating candidate:', error);
            alert('Lỗi khi cập nhật ứng viên');
        } finally {
            setFormLoading(false);
        }
    };

    // const handleDeleteCandidate = async (id: string) => {
    //     if (confirm('Bạn có chắc chắn muốn xóa ứng viên này?')) {
    //         try {
    //             await CandidateService.deleteCandidate(id);
    //             await fetchCandidates();
    //         } catch (error) {
    //             console.error('Error deleting candidate:', error);
    //             alert('Lỗi khi xóa ứng viên');
    //         }
    //     }
    // };

    const handleToggleStatus = async (id: string) => {
        try {
            await CandidateService.toggleCandidateStatus(id,meetingCode);
            await fetchCandidates();
        } catch (error) {
            console.error('Error toggling candidate status:', error);
            alert('Lỗi khi thay đổi trạng thái ứng viên');
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
    const renderContent = () => {
        if (loading) {
            return <CandidateStatus type="loading" />;
        }

        if (filteredCandidates.length === 0) {
            return <CandidateStatus type="empty" onAddCandidate={handleCreateNew} />;
        }

        return (
            <CandidateGrid
                candidates={filteredCandidates}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
            />
        );
    };
    return (
        <div className={styles.management}>
            <CandidateHeader 
                meetingCode={meetingCode}
                onAddCandidate={handleCreateNew}
            />

            <CandidateToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                candidates={candidates}
            />

            <CandidateFormModal
                showForm={showForm}
                formMode={formMode}
                formData={formData}
                formLoading={formLoading}
                onFormDataChange={setFormData}
                onClose={() => setShowForm(false)}
                onSubmit={formMode === 'create' ? handleCreateCandidate : handleUpdateCandidate}
                meetingCode={meetingCode}
            />

            {renderContent()}
        </div>
    );
}