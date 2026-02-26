'use client';

import { useEffect, useState } from 'react';
import styles from './Reports.module.css';
import { MeetingService } from '@/lib/api/meetings';
import { Meeting } from '@/app/types/meeting';
import { AttendanceService } from '@/lib/api/attendance';
import { DashboardService } from '@/lib/api/dashboard';

interface VoteOptionResult {
  votingOptionId: string;
  votingOptionName: string;
  voteCount: number;
  totalWeight: number;
  percentage: number;
  cccd?: string;
  investorCode?: string;
}

interface ResolutionResult {
  resolutionId: string;
  resolutionTitle: string;
  results: VoteOptionResult[];
  totalVoters: number;
  totalWeight: number;
}

interface ElectionResult {
  electionId: string;
  electionTitle: string;
  results: VoteOptionResult[];
  totalVoters: number;
  totalWeight: number;
}

interface MeetingReportData {
  issuedBallots: number;
  issuedShares: number;
  collectedBallots: number;
  collectedShares: number;
  validBallots: number;
  validShares: number;
  invalidBallots: number;
  invalidShares: number;
  resolutions: ResolutionResult[];
  elections: ElectionResult[];
}

export default function Reports() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [reportData, setReportData] = useState<MeetingReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<'voting' | 'election'>('voting');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [showStatsTable, setShowStatsTable] = useState<boolean>(false);
  const [isVoterModalOpen, setIsVoterModalOpen] = useState<boolean>(false);
  const [voterList, setVoterList] = useState<any[]>([]);

  const fetchMeetings = async () => {
    try {
      const response = await MeetingService.getAllMeetings();
      const data = (response as any).data || response;
      if (Array.isArray(data)) {
        setMeetings(data);
        if (data.length > 0 && !selectedMeetingId) {
          setSelectedMeetingId(data[0].id || data[0].meetingCode);
        }
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const fetchReport = async (meetingId: string) => {
    if (!meetingId) return;
    setLoading(true);
    try {
      const [realtimeRes, dashboardRes, attendedRes] = await Promise.all([
        MeetingService.getRealtimeStatus(meetingId).catch((err) => {
          console.warn('Realtime API failed:', err);
          return { resolutionResults: [], electionResults: [] };
        }),
        DashboardService.getSummary().catch((err) => {
          console.warn('Dashboard API failed:', err);
          return null;
        }),
        AttendanceService.getAttendedParticipants(meetingId).catch((err) => {
          console.warn('Attendance API failed:', err);
          return [];
        })
      ]);

      const realtimeData = (realtimeRes as any)?.data || realtimeRes || { resolutionResults: [], electionResults: [] };
      const attendedData = (attendedRes as any)?.data || attendedRes;
      const attendedList = Array.isArray(attendedData) ? attendedData : [];

      const issuedBallots = attendedList.length;
      const issuedShares = attendedList.reduce((sum: number, s: any) => sum + (Number(s.totalShares) || Number(s.attendingShares) || 0), 0);

      const collectedBallots = issuedBallots;
      const collectedShares = issuedShares;

      const mappedData: MeetingReportData = {
        issuedBallots,
        issuedShares,
        collectedBallots,
        collectedShares,
        validBallots: 0,
        validShares: 0,
        invalidBallots: 0,
        invalidShares: 0,
        resolutions: Array.isArray(realtimeData.resolutionResults)
          ? realtimeData.resolutionResults.map((r: any) => ({
            ...r,
            results: Array.isArray(r.results) ? r.results : []
          }))
          : [],
        elections: Array.isArray(realtimeData.electionResults)
          ? realtimeData.electionResults.map((e: any) => ({
            ...e,
            results: Array.isArray(e.results) ? e.results : []
          }))
          : []
      };

      setReportData(mappedData);
      setVoterList(attendedList);

      if (mappedData.resolutions.length > 0) {
        setSelectedItemId(mappedData.resolutions[0].resolutionId);
        setActiveTab('voting');
      } else if (mappedData.elections.length > 0) {
        setSelectedItemId(mappedData.elections[0].electionId);
        setActiveTab('election');
      }
    } catch (error) {
      console.error('Critical error in fetchReport:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    if (selectedMeetingId) {
      fetchReport(selectedMeetingId);
    }
  }, [selectedMeetingId]);

  // Handle F3 key shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F3') {
        e.preventDefault();
        if (selectedMeetingId) {
          fetchReport(selectedMeetingId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMeetingId]);

  const getCurrentStats = () => {
    if (!reportData) return null;

    let collectedBallots = reportData.collectedBallots;
    let collectedShares = reportData.collectedShares;
    let validBallots = 0;
    let validShares = 0;

    if (activeTab === 'voting') {
      const currentRes = reportData.resolutions.find(r => r.resolutionId === selectedItemId);
      if (currentRes) {
        collectedBallots = Number(currentRes.totalVoters) || reportData.collectedBallots;
        collectedShares = Number(currentRes.totalWeight) || reportData.collectedShares;
        validShares = currentRes.results?.reduce((sum: number, r: VoteOptionResult) => sum + (Number(r.totalWeight) || 0), 0) || 0;
        validBallots = currentRes.results?.reduce((sum: number, r: VoteOptionResult) => sum + (Number(r.voteCount) || 0), 0) || 0;
      }
    } else {
      const currentElec = reportData.elections.find(e => e.electionId === selectedItemId);
      if (currentElec) {
        collectedBallots = Number(currentElec.totalVoters) || reportData.collectedBallots;
        collectedShares = Number(currentElec.totalWeight) || reportData.collectedShares;
        validShares = currentElec.results?.reduce((sum: number, r: VoteOptionResult) => sum + (Number(r.totalWeight) || 0), 0) || 0;
        validBallots = currentElec.results?.reduce((sum: number, r: VoteOptionResult) => sum + (Number(r.voteCount) || 0), 0) || 0;
      }
    }

    const issuedShares = reportData.issuedShares;
    const finalCollectedShares = collectedShares || 0;
    const finalValidShares = validShares || 0;
    const invalidShares = Math.max(0, finalCollectedShares - finalValidShares);

    return {
      issuedBallots: reportData.issuedBallots,
      issuedShares: issuedShares,
      collectedBallots: collectedBallots || 0,
      collectedShares: finalCollectedShares,
      validBallots: validBallots || 0,
      validShares: finalValidShares,
      invalidBallots: Math.max(0, (collectedBallots || 0) - validBallots),
      invalidShares: invalidShares,
      noVoteBallots: Math.max(0, reportData.issuedBallots - (collectedBallots || 0)),
      noVoteShares: Math.max(0, issuedShares - finalCollectedShares),
      collectedPercent: issuedShares > 0 ? (finalCollectedShares / issuedShares * 100).toFixed(2) : '0.00',
      validPercent: issuedShares > 0 ? (finalValidShares / issuedShares * 100).toFixed(2) : '0.00',
      invalidPercent: issuedShares > 0 ? (invalidShares / issuedShares * 100).toFixed(2) : '0.00',
      noVotePercent: issuedShares > 0 ? (Math.max(0, issuedShares - finalCollectedShares) / issuedShares * 100).toFixed(2) : '0.00'
    };
  };

  const renderSummaryHeader = () => {
    const stats = getCurrentStats();
    if (!stats) return null;

    return (
      <div className={styles.summaryHeader}>
        <div className={styles.summarySection}>
          <div className={styles.metricColumn}>
            <div className={styles.metricRow}>
              <div className={styles.rowLabel}>Số phiếu phát ra:</div>
              <div className={styles.inputBox}>{stats.issuedBallots}</div>
              <div className={`${styles.inputBox} ${styles.sharesBox}`}>{stats.issuedShares.toLocaleString()}</div>
              <div className={styles.unitLabel}>(cp)</div>
            </div>
            <div className={styles.metricRow}>
              <div className={styles.rowLabel}>Số phiếu thu về:</div>
              <div className={styles.inputBox}>{stats.collectedBallots}</div>
              <div className={`${styles.inputBox} ${styles.sharesBox}`}>{stats.collectedShares.toLocaleString()}</div>
              <div className={styles.unitLabel}>(cp)</div>
            </div>
            <div className={styles.percentageMarker}>Thu về: {stats.collectedPercent}%</div>
          </div>

          <div className={styles.metricColumn}>
            <div className={styles.metricRow}>
              <div className={styles.rowLabel}>Số phiếu hợp lệ:</div>
              <div className={styles.inputBox}>{stats.validBallots}</div>
              <div className={`${styles.inputBox} ${styles.sharesBox}`}>{stats.validShares.toLocaleString()}</div>
              <div className={styles.unitLabel}>(cp)</div>
            </div>
            <div className={styles.metricRow}>
              <div className={styles.rowLabel}>Số phiếu không hợp lệ:</div>
              <div className={styles.inputBox}>{stats.invalidBallots}</div>
              <div className={`${styles.inputBox} ${styles.sharesBox}`}>{stats.invalidShares.toLocaleString()}</div>
              <div className={styles.unitLabel}>(cp)</div>
            </div>
            <div className={styles.metricRow}>
              <div className={styles.rowLabel}>Số phiếu ko {activeTab === 'voting' ? 'BQ' : 'BC'}:</div>
              <div className={styles.inputBox}>{stats.noVoteBallots}</div>
              <div className={`${styles.inputBox} ${styles.sharesBox}`}>{stats.noVoteShares.toLocaleString()}</div>
              <div className={styles.unitLabel}>(cp)</div>
            </div>
            <div className={styles.percentageMarker}>
              Hợp lệ: {stats.validPercent}% | Ko HL: {stats.invalidPercent}% | Ko {activeTab === 'voting' ? 'BQ' : 'BC'}: {stats.noVotePercent}%
            </div>
          </div>
        </div>
        <div className={styles.sidebarActions}>
          <button
            className={styles.ellipsis}
            onClick={() => setIsVoterModalOpen(true)}
          >
            ...
          </button>
          <button
            className={`${styles.viewTableBtn} ${showStatsTable ? styles.viewTableBtnActive : ''}`}
            onClick={() => setShowStatsTable(!showStatsTable)}
          >
            View bảng
          </button>
        </div>
      </div>
    );
  };

  const renderVotingReport = (res: ResolutionResult) => {
    if (res.resolutionId !== selectedItemId) return null;

    const agree = res.results.find(r => r.votingOptionName === 'Đồng ý' || r.votingOptionName === 'Tán thành');
    const disagree = res.results.find(r => r.votingOptionName === 'Không đồng ý' || r.votingOptionName === 'Không tán thành');
    const noIdea = res.results.find(r => r.votingOptionName === 'Không ý kiến');

    const stats = getCurrentStats();
    const issuedShares = stats?.issuedShares || 0;
    const displayTotalWeight = stats?.collectedShares || res.totalWeight || 0;
    const validWeight = res.results.reduce((sum, r) => sum + r.totalWeight, 0);
    const invalidWeight = Math.max(0, displayTotalWeight - validWeight);

    return (
      <div className={styles.reportSection} key={res.resolutionId}>
        <div className={styles.sectionTitle}>{res.resolutionTitle}</div>
        <table className={styles.styledTable}>
          <thead>
            <tr>
              <th>Nội dung</th>
              <th>Tổng số</th>
              <th>Hợp lệ</th>
              <th>Ko hợp lệ</th>
              <th>Ko biểu quyết</th>
              <th>Tán thành</th>
              <th>Ko tán thành</th>
              <th>Ko ý kiến</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Số phiếu tham gia biểu quyết (cp)</td>
              <td>{displayTotalWeight.toLocaleString()}</td>
              <td>{validWeight.toLocaleString()}</td>
              <td>{invalidWeight.toLocaleString()}</td>
              <td>{(stats?.noVoteShares || 0).toLocaleString()}</td>
              <td>{agree?.totalWeight.toLocaleString() || 0}</td>
              <td>{disagree?.totalWeight.toLocaleString() || 0}</td>
              <td>{noIdea?.totalWeight.toLocaleString() || 0}</td>
            </tr>
            <tr>
              <td>Tỷ lệ tương ứng (%)</td>
              <td>{issuedShares > 0 ? (displayTotalWeight / issuedShares * 100).toFixed(2) : '0.00'}</td>
              <td>{issuedShares > 0 ? (validWeight / issuedShares * 100).toFixed(2) : '0.00'}</td>
              <td>{issuedShares > 0 ? (invalidWeight / issuedShares * 100).toFixed(2) : '0.00'}</td>
              <td>{stats?.noVotePercent || '0.00'}</td>
              <td>{issuedShares > 0 ? ((agree?.totalWeight || 0) / issuedShares * 100).toFixed(2) : '0.00'}</td>
              <td>{issuedShares > 0 ? ((disagree?.totalWeight || 0) / issuedShares * 100).toFixed(2) : '0.00'}</td>
              <td>{issuedShares > 0 ? ((noIdea?.totalWeight || 0) / issuedShares * 100).toFixed(2) : '0.00'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderElectionReport = (elec: ElectionResult) => {
    if (elec.electionId !== selectedItemId) return null;

    const stats = getCurrentStats();
    const issuedShares = stats?.issuedShares || 0;

    return (
      <div className={styles.reportSection} key={elec.electionId}>
        <div className={styles.sectionTitle}>{elec.electionTitle}</div>
        <table className={styles.styledTable}>
          <thead>
            <tr>
              <th>Nội dung</th>
              <th>Số CMND/CCCD</th>
              <th>Họ tên ứng viên</th>
              <th>Số phiếu bầu</th>
              <th>Tỷ lệ (%)</th>
            </tr>
          </thead>
          <tbody>
            {elec.results.map((r, i) => (
              <tr key={i}>
                <td>Bầu {elec.electionTitle.replace('Bầu cử', '').trim()}</td>
                <td>{r.cccd || '---'}</td>
                <td>{r.votingOptionName}</td>
                <td>{r.totalWeight.toLocaleString()}</td>
                <td>{issuedShares > 0 ? (r.totalWeight / issuedShares * 100).toFixed(2) : '0.00'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSummaryTable = () => {
    const stats = getCurrentStats();
    if (!stats) return null;

    const title = activeTab === 'voting' ? 'Phiếu biểu quyết' : 'Phiếu bầu cử';

    return (
      <div className={styles.reportSection}>
        <div className={styles.sectionTitle}>Kết quả kiểm phiếu {title}</div>
        <table className={styles.styledTable} style={{ maxWidth: '600px' }}>
          <thead>
            <tr>
              <th>Nội dung</th>
              <th>Số tờ phiếu</th>
              <th>Số phiếu bầu</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Số phiếu bầu đã phát</td>
              <td style={{ textAlign: 'right' }}>{stats.issuedBallots.toLocaleString()}</td>
              <td style={{ textAlign: 'right' }}>{stats.issuedShares.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Số phiếu không tham gia bầu</td>
              <td style={{ textAlign: 'right' }}>{stats.noVoteBallots.toLocaleString()}</td>
              <td style={{ textAlign: 'right' }}>{stats.noVoteShares.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Số phiếu bầu thu về</td>
              <td style={{ textAlign: 'right' }}>{stats.collectedBallots.toLocaleString()}</td>
              <td style={{ textAlign: 'right' }}>{stats.collectedShares.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Số phiếu bầu không hợp lệ</td>
              <td style={{ textAlign: 'right' }}>{stats.invalidBallots.toLocaleString()}</td>
              <td style={{ textAlign: 'right' }}>{stats.invalidShares.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Số phiếu bầu hợp lệ</td>
              <td style={{ textAlign: 'right' }}>{stats.validBallots.toLocaleString()}</td>
              <td style={{ textAlign: 'right' }}>{stats.validShares.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderVoterDetailModal = () => {
    if (!isVoterModalOpen) return null;

    const currentItemTitle = activeTab === 'voting'
      ? reportData?.resolutions.find(r => r.resolutionId === selectedItemId)?.resolutionTitle
      : reportData?.elections.find(e => e.electionId === selectedItemId)?.electionTitle;

    return (
      <div className={styles.modalOverlay} onClick={() => setIsVoterModalOpen(false)}>
        <div className={styles.voterModal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Chi tiết kết quả bầu cử</h2>
            <button className={styles.closeBtn} onClick={() => setIsVoterModalOpen(false)}>×</button>
          </div>

          <div className={styles.modalFilterGrid}>
            <div className={styles.filterGroup}>
              <label>Cuộc họp</label>
              <div className={styles.staticField}>
                {meetings.find(m => m.id === selectedMeetingId)?.title || '---'}
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label>Nội dung biểu quyết/bầu cử</label>
              <div className={styles.staticField}>{currentItemTitle || '---'}</div>
            </div>
          </div>

          <div className={styles.modalContent}>
            <div className={styles.tableCard}>
              <div className={styles.tableHeaderSection}>
                <h3>Danh sách cổ đông tham gia bỏ phiếu</h3>
                <span className={styles.voterCount}>Tổng số: {voterList.length} cổ đông</span>
              </div>
              <div className={styles.modalTableContainer}>
                <table className={styles.voterTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                      <th>Họ và tên</th>
                      <th>Số CMND/CCCD</th>
                      <th>Mã tham dự</th>
                      <th style={{ textAlign: 'right' }}>Số lượng CP</th>
                      <th style={{ textAlign: 'center' }}>Thu phiếu</th>
                      <th style={{ textAlign: 'center' }}>Hợp lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voterList.map((v, i) => {
                      // Hiện tại coi như các cổ đông trong danh sách đã điểm danh là đã thu phiếu và hợp lệ
                      // Nếu backend có trường check riêng, hãy cập nhật tại đây:
                      const isCollected = true;
                      const isValid = true;

                      return (
                        <tr key={v.userId || i}>
                          <td style={{ textAlign: 'center', color: '#888' }}>{i + 1}</td>
                          <td>
                            <div className={styles.voterName}>{v.fullName || v.name}</div>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{v.cccd || '---'}</td>
                          <td style={{ color: '#1a4a8c', fontWeight: 600 }}>{v.investorCode || '---'}</td>
                          <td style={{ textAlign: 'right', fontWeight: '700' }}>
                            {(v.totalShares || v.sharesOwned || 0).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isCollected && <div className={styles.statusBadge}>✔</div>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isValid && <div className={styles.statusBadge}>✔</div>}
                          </td>
                        </tr>
                      );
                    })}
                    {voterList.length === 0 && (
                      <tr>
                        <td colSpan={7} className={styles.emptyRow}>Không có dữ liệu cổ đông tham gia bỏ phiếu</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.reportsContainer}>
      {renderVoterDetailModal()}
      <div className={styles.headerActions}>
        <h1>Kết quả họp</h1>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.contentArea}>
          {renderSummaryHeader()}

          <div className={styles.contentBody}>
            {!reportData && <div className={styles.noData}>Đang tải dữ liệu báo cáo...</div>}

            {showStatsTable ? (
              renderSummaryTable()
            ) : (
              <>
                {activeTab === 'voting' && reportData?.resolutions.map(res => renderVotingReport(res))}
                {activeTab === 'election' && reportData?.elections.map(elec => renderElectionReport(elec))}
              </>
            )}
          </div>
        </div>

        <div className={styles.sidePanel}>
          <select className={styles.sidebarSelect}>
            <option>1. Tỷ lệ biểu quyết/bầu cử</option>
          </select>

          <select
            className={styles.sidebarSelect}
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
          >
            {meetings.map((m) => (
              <option key={m.id || m.meetingCode} value={m.id || m.meetingCode}>
                {m.title}
              </option>
            ))}
          </select>

          <select
            className={styles.sidebarSelect}
            value={selectedItemId}
            onChange={(e) => {
              const val = e.target.value;
              if (reportData?.resolutions.find(r => r.resolutionId === val)) {
                setActiveTab('voting');
                setSelectedItemId(val);
              } else if (reportData?.elections.find(el => el.electionId === val)) {
                setActiveTab('election');
                setSelectedItemId(val);
              }
            }}
          >
            <optgroup label="Biểu quyết">
              {reportData?.resolutions.map((res, i) => (
                <option key={res.resolutionId} value={res.resolutionId}>
                  {i + 1}. {res.resolutionTitle}
                </option>
              ))}
            </optgroup>
            <optgroup label="Bầu cử">
              {reportData?.elections.map((elec, i) => (
                <option key={elec.electionId} value={elec.electionId}>
                  {i + 1}. {elec.electionTitle}
                </option>
              ))}
            </optgroup>
          </select>

          <select className={styles.sidebarSelect}>
            <option>1. Dạng lưới</option>
          </select>

          <button
            className={styles.sidebarBtn}
            onClick={() => {
              if (selectedMeetingId) {
                fetchReport(selectedMeetingId);
              }
            }}
          >
            Xem (F3)
          </button>

          <div className={styles.sidebarSpacer}></div>

          <div className={styles.bottomActions}>
            <button className={styles.sidebarBtn} onClick={() => alert('Chức năng đang được phát triển')}>
              Nội dung biểu quyết chi tiết
            </button>
            <div className={styles.printContainer}>
              <button
                className={styles.smallInBtn}
                onClick={() => window.print()}
              >
                In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
