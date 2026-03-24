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
  issuedCount?: number;
  collectedCount?: number;
  validCount?: number;
  invalidCount?: number;
}

interface VotingReportData {
  resolutionStats: VoteStats;
  boardOfDirectorsStats: VoteStats;
  supervisoryBoardStats: VoteStats;
  electionStats?: VoteStats; 
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
    if (!stats) return (
      <div className={styles.statsCard}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <div style={{ textAlign: 'center', color: '#ccc', padding: '20px' }}>Chưa có dữ liệu</div>
      </div>
    );

    const validPercent = stats.issuedShares > 0 ? ((stats.validShares / stats.issuedShares) * 100).toFixed(2) : '0.00';
    const invalidPercent = stats.issuedShares > 0 ? ((stats.invalidShares / stats.issuedShares) * 100).toFixed(2) : '0.00';

    return (
      <div className={styles.statsCard}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <table className={styles.statsTable}>
          <thead>
            <tr>
              <th>Nội dung</th>
              <th>Phiếu (Voters)</th>
              <th>Cổ phần (Shares)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Phát ra</td>
              <td className={styles.num}>{(stats.issuedCount ?? 0).toLocaleString()}</td>
              <td className={styles.num}>{stats.issuedShares.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Thu về</td>
              <td className={styles.num}>{(stats.collectedCount ?? 0).toLocaleString()}</td>
              <td className={styles.num}>{stats.collectedShares.toLocaleString()}</td>
            </tr>
            <tr className={styles.highlight}>
              <td>Hợp lệ</td>
              <td className={styles.num}>{(stats.validCount ?? 0).toLocaleString()}</td>
              <td className={styles.num}>
                {stats.validShares.toLocaleString()}
                <span className={styles.percent}>({validPercent}%)</span>
              </td>
            </tr>
            <tr className={styles.invalid}>
              <td>K.Hợp lệ</td>
              <td className={styles.num}>{(stats.invalidCount ?? 0).toLocaleString()}</td>
              <td className={styles.num}>
                {stats.invalidShares.toLocaleString()}
                <span className={styles.percent}>({invalidPercent}%)</span>
              </td>
            </tr>
          </tbody>
        </table>
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
            {renderStatsCard("Thống kê Bầu cử HĐQT", reportData?.boardOfDirectorsStats || reportData?.electionStats)}
            {renderStatsCard("Thống kê Bầu cử BKS", reportData?.supervisoryBoardStats || reportData?.electionStats)}
          </div>
        )}
      </div>
    </div>
  );
}
