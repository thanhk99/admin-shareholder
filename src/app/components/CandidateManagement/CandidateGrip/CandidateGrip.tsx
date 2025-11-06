import { Candidate } from '@/app/types/candidate';
import CandidateCard from '../CandidateCard/CandidateCard';
import styles from './CandidateGrip.module.css';

interface CandidateGridProps {
    candidates: Candidate[];
    onEdit: (candidate: Candidate) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string) => void;
}

export default function CandidateGrid({ 
    candidates, 
    onEdit, 
    onDelete, 
    onToggleStatus 
}: CandidateGridProps) {
    return (
        <div className={styles.candidatesGrid}>
            {candidates.map((candidate) => (
                <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                />
            ))}
        </div>
    );
}