'use client';

import { 
  FilePdfOutlined,
  FileExcelOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import styles from './VotingResults.module.css';

interface Resolution {
  totalAgree: number;
  totalNotAgree: number;
  totalNotIdea: number;
  title: string;
}

interface VotingResultsProps {
  resolutions: Resolution[];
  loading?: boolean;
}

export default function VotingResults({ resolutions, loading = false }: VotingResultsProps) {

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Đang tải kết quả biểu quyết...</div>
      </div>
    );
  }

  if (!resolutions || resolutions.length === 0) {
    return null;
  }


  const totalResolutions = resolutions.length;
  const approvedResolutions = resolutions.filter(resolution => {
    const total = resolution.totalAgree + resolution.totalNotAgree + resolution.totalNotIdea;
    const agreePercentage = total > 0 ? (resolution.totalAgree / total * 100) : 0;
    return agreePercentage > 50;
  }).length;

  const totalShares = resolutions.reduce((sum, resolution) => 
    sum + resolution.totalAgree + resolution.totalNotAgree + resolution.totalNotIdea, 0
  );

  const averageApproval = resolutions.reduce((sum, resolution) => {
    const total = resolution.totalAgree + resolution.totalNotAgree + resolution.totalNotIdea;
    const agreePercentage = total > 0 ? (resolution.totalAgree / total * 100) : 0;
    return sum + agreePercentage;
  }, 0) / resolutions.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Kết quả Biểu quyết</h2>
          <p>Kết quả các biểu quyết quan trọng</p>
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

      <div className={styles.resolutionsGrid}>
        {resolutions.map((resolution, index) => {
          const total = resolution.totalAgree + resolution.totalNotAgree + resolution.totalNotIdea;
          const agreePercentage = total > 0 ? (resolution.totalAgree / total * 100) : 0;
          const disagreePercentage = total > 0 ? (resolution.totalNotAgree / total * 100) : 0;
          const noIdeaPercentage = total > 0 ? (resolution.totalNotIdea / total * 100) : 0;
          const isApproved = agreePercentage > 50;

          return (
            <div key={index} className={styles.resolutionCard}>
              <div className={styles.resolutionHeader}>
                <h3 className={styles.resolutionTitle}>{resolution.title}</h3>
                <div className={`${styles.statusBadge} ${isApproved ? styles.approved : styles.rejected}`}>
                  {isApproved ? 'ĐÃ THÔNG QUA' : 'KHÔNG THÔNG QUA'}
                </div>
              </div>
              
              <div className={styles.voteStats}>
                <div className={styles.voteRow}>
                  <span className={styles.voteLabel}>Đồng ý:</span>
                  <div className={styles.voteBarContainer}>
                    <div 
                      className={`${styles.voteBar} ${styles.agree}`}
                      style={{ width: `${agreePercentage}%` }}
                    ></div>
                  </div>
                  <span className={styles.voteCount}>
                    {resolution.totalAgree.toLocaleString()} ({agreePercentage.toFixed(1)}%)
                  </span>
                </div>
                
                <div className={styles.voteRow}>
                  <span className={styles.voteLabel}>Không đồng ý:</span>
                  <div className={styles.voteBarContainer}>
                    <div 
                      className={`${styles.voteBar} ${styles.disagree}`}
                      style={{ width: `${disagreePercentage}%` }}
                    ></div>
                  </div>
                  <span className={styles.voteCount}>
                    {resolution.totalNotAgree.toLocaleString()} ({disagreePercentage.toFixed(1)}%)
                  </span>
                </div>
                
                <div className={styles.voteRow}>
                  <span className={styles.voteLabel}>Không ý kiến:</span>
                  <div className={styles.voteBarContainer}>
                    <div 
                      className={`${styles.voteBar} ${styles.noIdea}`}
                      style={{ width: `${noIdeaPercentage}%` }}
                    ></div>
                  </div>
                  <span className={styles.voteCount}>
                    {resolution.totalNotIdea.toLocaleString()} ({noIdeaPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className={styles.resolutionFooter}>
                <div className={styles.totalShares}>
                  Tổng số cổ phần: <strong>{total.toLocaleString()}</strong>
                </div>
                <div className={styles.result}>
                  Kết quả: <strong>{isApproved ? 'Thông qua' : 'Không thông qua'}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.summary}>
        <h3>Thống kê tổng quan</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <CheckCircleOutlined className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{totalResolutions}</span>
              <span className={styles.statLabel}>Tổng biểu quyết</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <FilePdfOutlined className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{approvedResolutions}</span>
              <span className={styles.statLabel}>Biểu quyết thông qua</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <FileExcelOutlined className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{totalShares.toLocaleString()}</span>
              <span className={styles.statLabel}>Tổng cổ phần</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <CheckCircleOutlined className={styles.statIcon} />
            <div className={styles.statContent}>
              <span className={styles.statNumber}>{averageApproval.toFixed(1)}%</span>
              <span className={styles.statLabel}>Tỷ lệ đồng ý TB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}