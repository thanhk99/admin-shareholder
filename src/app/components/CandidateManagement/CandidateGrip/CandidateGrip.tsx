import { Candidate } from '@/app/types/candidate';
import CandidateCard from '../CandidateCard/CandidateCard';
import styles from './CandidateGrip.module.css';

interface CandidateGridProps {
    candidates: Candidate[];
    onEdit: (candidate: Candidate) => void;
    onToggleStatus: (id: string) => void;
}

export default function CandidateGrid({ 
    candidates, 
    onEdit, 
    onToggleStatus 
}: CandidateGridProps) {
    return (
        <div className={styles.candidatesGrid}>
            {candidates.map((candidate) => (
                <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                />
            ))}
        </div>
    );
}