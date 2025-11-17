'use client';

import { 
  FilePdfOutlined,
  FileExcelOutlined,
  TeamOutlined
} from '@ant-design/icons';
import styles from './ElectionResults.module.css';

interface Candidate {
  candidateName: string;
  amountVotes: number;
}

interface ElectionResultsProps {
  candidates: Candidate[];
  loading?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'elected':
      return <span className={styles.statusElected}>Đã trúng cử</span>;
    case 'not-elected':
      return <span className={styles.statusNotElected}>Không trúng cử</span>;
    default:
      return null;
  }
};

export default function ElectionResults({ candidates, loading = false }: ElectionResultsProps) {
  console.log('ElectionResults - candidates:', candidates);
  console.log('ElectionResults - loading:', loading);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải kết quả bầu cử...</div>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    console.log('ElectionResults - No candidates data');
    return null;
  }

  console.log('ElectionResults - Rendering with candidates:', candidates);

  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.amountVotes, 0);
  
  const electionData = candidates
    .map((candidate, index) => {
      const percentage = totalVotes > 0 ? (candidate.amountVotes / totalVotes * 100) : 0;
      
      const sortedCandidates = [...candidates].sort((a, b) => b.amountVotes - a.amountVotes);
      const rank = sortedCandidates.findIndex(c => c.candidateName === candidate.candidateName);
      const isElected = rank < Math.min(3, candidates.length);
      
      return {
        id: `candidate-${index}`,
        name: candidate.candidateName,
        votes: candidate.amountVotes,
        totalVotes: totalVotes,
        percentage: percentage,
        status: isElected ? 'elected' as const : 'not-elected' as const,
        rank: rank + 1,
      };
    })
    .sort((a, b) => b.votes - a.votes);

  const electedCount = electionData.filter(c => c.status === 'elected').length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Kết quả Bầu cử Hội đồng Quản trị</h2>
          <p>Kết quả bầu cử các vị trí trong HĐQT</p>
        </div>
        <div className={styles.exportButtons}>
          <button className={styles.exportButton}>
            <FilePdfOutlined />
            PDF
          </button>
          <button className={styles.exportButton}>
            <FileExcelOutlined />
            Excel
          </button>
        </div>
      </div>

      <div className={styles.candidatesGrid}>
        {electionData.map(candidate => (
          <div key={candidate.id} className={styles.candidateCard}>
            <div className={styles.candidateHeader}>
              <div className={styles.candidateInfo}>
                <div className={styles.candidateRank}>#{candidate.rank}</div>
                <div>
                  <h3 className={styles.candidateName}>{candidate.name}</h3>
                  <p className={styles.candidatePosition}>Ứng viên HĐQT</p>
                </div>
              </div>
              {getStatusBadge(candidate.status)}
            </div>
            
            <div className={styles.voteStats}>
              <div className={styles.voteCount}>
                <span className={styles.voteNumber}>{candidate.votes.toLocaleString()}</span>
                <span className={styles.voteLabel}>phiếu bầu</span>
              </div>
              <div className={styles.votePercentage}>
                <span className={styles.percentageNumber}>{candidate.percentage.toFixed(1)}%</span>
                <span className={styles.percentageLabel}>tỷ lệ</span>
              </div>
            </div>

            <div className={styles.voteProgress}>
              <div 
                className={`${styles.progressBar} ${
                  candidate.status === 'elected' ? styles.elected : styles.notElected
                }`}
              >
                <div 
                  className={styles.progressFill}
                  style={{ width: `${candidate.percentage}%` }}
                ></div>
              </div>
              <div className={styles.progressText}>
                <span>{candidate.votes.toLocaleString()}</span>
                <span>/</span>
                <span>{candidate.totalVotes.toLocaleString()} phiếu</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <h3>Thống kê tổng quan</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Tổng số ứng viên:</span>
            <span className={styles.statValue}>{electionData.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Số ứng viên trúng cử:</span>
            <span className={styles.statValue}>{electedCount}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Tổng số phiếu bầu:</span>
            <span className={styles.statValue}>{totalVotes.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}