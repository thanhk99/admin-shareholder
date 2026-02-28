'use client';

import { useEffect, useState } from 'react';
import styles from './Reports.module.css';
import { MeetingService } from '@/lib/api/meetings';
import { Meeting } from '@/app/types/meeting';
import ReportService from '@/lib/api/report';

interface VoteStats {
  issuedShares: number;
  validShares: number;
  invalidShares: number;
  collectedShares: number;
}

interface VotingReportData {
  resolutionStats: VoteStats;
  electionStats: VoteStats;
}

export default function Reports() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [reportData, setReportData] = useState<VotingReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMeetings = async () => {
    try {
      const response = await MeetingService.getAllMeetings();
      const data = (response as any).data || response;
      if (Array.isArray(data)) {
        setMeetings(data);
        if (data.length > 0 && !selectedMeetingId) {
          const ongoing = data.find(m => m.status === 'ONGOING');
          setSelectedMeetingId(ongoing ? ongoing.id : data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const fetchStats = async (meetingId: string) => {
    if (!meetingId) return;
    setLoading(true);
    try {
      const response = await ReportService.getVotingStats(meetingId);
      const data = (response as any).data || response;
      setReportData(data);
    } catch (error) {
      console.error('Error fetching voting stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    if (selectedMeetingId) {
      fetchStats(selectedMeetingId);
    }
  }, [selectedMeetingId]);

  // Handle F3 key shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        if (selectedMeetingId) {
          fetchStats(selectedMeetingId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMeetingId]);

  const renderStatsCard = (title: string, stats: VoteStats | undefined) => {
    if (!stats) return null;

    const validPercent = stats.issuedShares > 0 ? ((stats.validShares / stats.issuedShares) * 100).toFixed(2) : '0.00';
    const invalidPercent = stats.issuedShares > 0 ? ((stats.invalidShares / stats.issuedShares) * 100).toFixed(2) : '0.00';

    return (
      <div className={styles.statsCard}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Số cổ phần phát ra:</span>
            <span className={styles.statValue}>{stats.issuedShares.toLocaleString()}</span>
            <span className={styles.statUnit}>(cp)</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Số cổ phần thu về:</span>
            <span className={styles.statValue}>{stats.collectedShares.toLocaleString()}</span>
            <span className={styles.statUnit}>(cp)</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Số cổ phần hợp lệ:</span>
            <span className={styles.statValue}>{stats.validShares.toLocaleString()}</span>
            <span className={styles.statUnit}>(cp)</span>
            <span className={styles.statPercent}>({validPercent}%)</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Số cổ phần không hợp lệ:</span>
            <span className={styles.statValue}>{stats.invalidShares.toLocaleString()}</span>
            <span className={styles.statUnit}>(cp)</span>
            <span className={styles.statPercent}>({invalidPercent}%)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.reportsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Báo cáo Kết quả Đại hội</h1>
        <div className={styles.controls}>
          <select
            className={styles.meetingSelect}
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
          >
            <option value="">-- Chọn cuộc họp --</option>
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <button
            className={styles.refreshBtn}
            onClick={() => fetchStats(selectedMeetingId)}
            disabled={loading || !selectedMeetingId}
          >
            {loading ? 'Đang tải...' : 'Làm mới (F3)'}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {!selectedMeetingId ? (
          <div className={styles.emptyState}>Vui lòng chọn một cuộc họp để xem báo cáo</div>
        ) : loading && !reportData ? (
          <div className={styles.loadingState}>Đang tính toán số liệu báo cáo...</div>
        ) : (
          <div className={styles.reportsGrid}>
            {renderStatsCard("Thống kê Biểu quyết (Resolutions)", reportData?.resolutionStats)}
            {renderStatsCard("Thống kê Bầu cử (Elections)", reportData?.electionStats)}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <p className={styles.note}>* Số liệu Hợp lệ của Bầu cử được tính theo công thức: Tổng phiếu bầu / Số lượng ứng viên.</p>
        <p className={styles.note}>* Số liệu Phát ra được tính dựa trên Tổng số Cổ phần của cổ đông đã tham dự.</p>
        <button className={styles.printBtn} onClick={() => window.print()}>In Báo Cáo</button>
      </div>
    </div>
  );
}
