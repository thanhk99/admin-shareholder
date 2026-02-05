'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PrinterOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  PieChartOutlined,
  HomeOutlined,
  CalendarOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { Tabs, Table, Tag, message } from 'antd';
import styles from './ShareholderDetail.module.css';
import { Shareholder } from '@/app/types/shareholder';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import ShareholderLogs from '../UserManagement/ShareholderLogs/ShareholderLogs';
import EditShareholderModal from '../UserManagement/EditShareholderModal/EditShareholderModal';
import ProxyService from '@/lib/api/proxy';
import { MeetingService } from '@/lib/api/meetings';
import { ProxyItem } from '@/app/types/proxy';
import { formatDate } from '@/utils/format';
import MagicQrModal from '../UserManagement/MagicQrModal/MagicQrModal';
import QrConfigModal from '../UserManagement/MagicQrModal/QrConfigModal';

export default function ShareholderDetail() {
  const params = useParams();
  const router = useRouter();
  const [shareholder, setShareholder] = useState<Shareholder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [proxyPeople, setProxyPeople] = useState<ProxyItem[]>([]);
  const [delegates, setDelegates] = useState<ProxyItem[]>([]);
  const [loadingProxy, setLoadingProxy] = useState(false);

  // New state for tabs and history
  const [activeTab, setActiveTab] = useState('1');
  const [voteHistory, setVoteHistory] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Magic QR State
  const [showQrModal, setShowQrModal] = useState(false);
  const [showQrConfigModal, setShowQrConfigModal] = useState(false);
  const [qrContent, setQrContent] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const shareholderId = params.id as string;

  const fetchShareholderDetail = async () => {
    try {
      setLoading(true);
      const response = await ShareholderManage.getShareholderByCode(shareholderId);
      if (response) {
        setShareholder(response as any);
      } else {
        setShareholder(null);
      }
    } catch (err) {
      setError('Không thể tải thông tin cổ đông');
      console.error('Error fetching shareholder detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProxyInfo = async (userId: string, investorCode: string) => {
    try {
      setLoadingProxy(true);
      // FIRST: Get ongoing meeting
      const ongoingRes = await MeetingService.getOngoingMeeting().catch(() => null);
      if (!ongoingRes || !(ongoingRes as any).id) {
        // If no ongoing meeting, we can't fetch meeting-specific proxies
        // Fallback to old methods if they still work or show empty
        const [personRes, delegatesRes] = await Promise.all([
          ProxyService.getProxyPerson(investorCode).catch(() => null),
          ProxyService.getProxyDelegates(investorCode).catch(() => null)
        ]);
        if (personRes && (personRes as any).data && (personRes as any).data.status === 'ACTIVE') {
          setProxyPeople([(personRes as any).data]);
        }
        if (delegatesRes && Array.isArray(delegatesRes)) {
          setDelegates(delegatesRes.filter(p => p.status === 'ACTIVE'));
        }
        return;
      }

      const meetingId = (ongoingRes as any).id;
      const [peopleRes, delegatesRes] = await Promise.all([
        ProxyService.getProxiesByDelegator(meetingId, userId),
        ProxyService.getProxiesByProxy(meetingId, userId)
      ]);

      if (Array.isArray(peopleRes)) {
        setProxyPeople(peopleRes.filter(p => p.status === 'ACTIVE'));
      }
      if (Array.isArray(delegatesRes)) {
        setDelegates(delegatesRes.filter(p => p.status === 'ACTIVE'));
      }
    } catch (err) {
      console.error('Error fetching proxy info:', err);
    } finally {
      setLoadingProxy(false);
    }
  };

  const fetchHistory = async () => {
    if (!shareholderId) return;
    try {
      setLoadingHistory(true);
      const [votesRes, loginsRes] = await Promise.all([
        ShareholderManage.getUserVoteHistory(shareholderId).catch(() => ({ data: [] })),
        ShareholderManage.getUserLoginHistory(shareholderId).catch(() => ({ data: [] }))
      ]);

      // Handle both simple array or {data: []} response structures if necessary
      const votesData = (votesRes as any).data || (Array.isArray(votesRes) ? votesRes : []);
      const loginsData = (loginsRes as any).data || (Array.isArray(loginsRes) ? loginsRes : []);

      setVoteHistory(votesData);
      setLoginHistory(loginsData);
    } catch (e) {
      console.error("Failed to fetch user history", e);
    } finally {
      setLoadingHistory(false);
    }
  }

  const handleOpenQrConfig = async () => {
    if (!shareholderId) return;
    try {
      setIsGeneratingQr(true);
      // Try to get existing token first
      const response: any = await ShareholderManage.getExistingQrToken(shareholderId);
      const data = response?.data || response;

      if (data && data.qrContent && data.token) {
        setQrContent(data.qrContent);
        setQrToken(data.token);
        setShowQrModal(true);
      } else {
        // No existing token, open config to create new
        setShowQrConfigModal(true);
      }
    } catch (e) {
      // Error (e.g. 404), proceed to create new
      setShowQrConfigModal(true);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleGenerateQr = async (expiresAt?: string) => {
    if (!shareholderId) return;
    try {
      setIsGeneratingQr(true);
      setShowQrConfigModal(false);

      const response: any = await ShareholderManage.generateQrLogin(shareholderId, expiresAt);

      // Adjust based on actual API response structure (flat or nested data)
      const data = response.data || response;

      if (data && data.qrContent && data.token) {
        setQrContent(data.qrContent);
        setQrToken(data.token);
        setShowQrModal(true);
      } else {
        message.error('Không thể tạo mã QR. Định dạng phản hồi không hợp lệ.');
      }
    } catch (error) {
      console.error("Failed to generate QR", error);
      message.error('Lỗi khi tạo mã QR đăng nhập.');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  useEffect(() => {
    if (shareholder?.id && shareholder?.investorCode) {
      fetchProxyInfo(shareholder.id, shareholder.investorCode);
    }
  }, [shareholder?.id, shareholder?.investorCode]);

  useEffect(() => {
    if (shareholderId) {
      fetchShareholderDetail();
    }
  }, [shareholderId]);

  useEffect(() => {
    if (activeTab === '2' || activeTab === '3') {
      fetchHistory();
    }
  }, [activeTab, shareholderId]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEditSuccess = () => {
    fetchShareholderDetail();
    setShowEditModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };


  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải thông tin cổ đông...</p>
      </div>
    );
  }

  if (error || !shareholder) {
    return (
      <div className={styles.error}>
        <h2>Không tìm thấy thông tin cổ đông</h2>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeftOutlined />
          Quay lại
        </button>
      </div>
    );
  }

  // Columns for history tables
  const voteColumns = [
    { title: 'Nội dung', dataIndex: 'resolutionTitle', key: 'resolutionTitle' },
    { title: 'Lựa chọn', dataIndex: 'votingOptionName', key: 'votingOptionName' },
    { title: 'Số quyền', dataIndex: 'voteWeight', key: 'voteWeight', render: (val: number) => val ? val.toLocaleString() : '0' },
    { title: 'Thời gian', dataIndex: 'votedAt', key: 'votedAt', render: (val: string) => formatDate(val) },
    { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress' },
  ];

  const loginColumns = [
    { title: 'Thời gian đăng nhập', dataIndex: 'loginTime', key: 'loginTime', render: (val: string) => formatDate(val) },
    { title: 'Thời gian đăng xuất', dataIndex: 'logoutTime', key: 'logoutTime', render: (val: string) => val ? formatDate(val) : '-' },
    { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress' },
    { title: 'User Agent', dataIndex: 'userAgent', key: 'userAgent', ellipsis: true },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (val: string) => <Tag color={val === 'SUCCESS' ? 'green' : 'red'}>{val}</Tag> },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeftOutlined />
          Quay lại
        </button>
        <div className={styles.headerActions}>
          <button
            onClick={handleOpenQrConfig}
            className={styles.printButton}
            disabled={isGeneratingQr}
            style={{ marginRight: 8 }}
          >
            <QrcodeOutlined />
            {isGeneratingQr ? 'Đang kiểm tra...' : 'Mã QR Đăng nhập'}
          </button>
          <button onClick={handlePrint} className={styles.printButton}>
            <PrinterOutlined />
            In thông tin
          </button>
          <button onClick={handleEdit} className={styles.editButton}>
            <EditOutlined />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          <UserOutlined />
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.name}>{shareholder.fullName}</h1>
          <p className={styles.id}>Mã cổ đông: {shareholder.id}</p>
          <span className={`${styles.status} ${styles[shareholder.enabled.toString()]}`}>
            {shareholder.enabled ? 'Đang hoạt động' : 'Ngừng hoạt động'}
          </span>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={[
          {
            key: '1',
            label: 'Thông tin chung',
            children: (
              <div className={styles.content}>
                {/* Thông tin cá nhân */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>
                    <UserOutlined />
                    Thông Tin Cá Nhân
                  </h2>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <label>Họ và tên</label>
                      <span>{shareholder.fullName}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Email</label>
                      <span>
                        <MailOutlined />
                        {shareholder.email}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Số điện thoại</label>
                      <span>
                        <PhoneOutlined />
                        {shareholder.phoneNumber}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <label>CCCD/CMND</label>
                      <span>
                        <IdcardOutlined />
                        {shareholder.cccd}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Ngày cấp</label>
                      <span>
                        <CalendarOutlined />
                        {shareholder.dateOfIssue}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Quốc tịch</label>
                      <span>
                        <GlobalOutlined />
                        {shareholder.nation || 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItemFull}>
                    <label>Địa chỉ</label>
                    <span>
                      <HomeOutlined />
                      {shareholder.address}
                    </span>
                  </div>
                </div>

                {/* Thông tin cổ phần */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>
                    <PieChartOutlined />
                    Thông Tin Cổ Phần
                  </h2>
                  <div className={styles.sharesSection}>
                    <div className={styles.shareCard}>
                      <div className={styles.shareNumber}>
                        {(shareholder.sharesOwned || 0) + (shareholder.receivedProxyShares || 0)}
                      </div>
                      <div className={styles.shareLabel}>Tổng số cổ phần biểu quyết</div>
                    </div>
                    <div className={styles.shareStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statValue}>{shareholder.sharesOwned || 0}</span>
                        <span className={styles.statLabel}>Cổ phần sở hữu</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statValue}>{shareholder.delegatedShares || 0}</span>
                        <span className={styles.statLabel}>Cổ phần đã ủy quyền</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statValue}>{shareholder.receivedProxyShares || 0}</span>
                        <span className={styles.statLabel}>Cổ phần nhận ủy quyền</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin uỷ quyền */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>
                    <CheckCircleOutlined />
                    Thông Tin Uỷ Quyền (Tại cuộc họp hiện tại)
                  </h2>

                  <div className={styles.proxyContent}>
                    <div className={styles.proxySection}>
                      <h3>Danh sách người nhận uỷ quyền</h3>
                      {proxyPeople.length > 0 ? (
                        <div className={styles.delegatesList}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>Họ và tên</th>
                                <th>Mã cổ đông</th>
                                <th>Số cổ phần</th>
                                <th>Ngày uỷ quyền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {proxyPeople.map((proxy, index) => (
                                <tr key={index}>
                                  <td>{proxy.proxyName}</td>
                                  <td>{proxy.proxyId}</td>
                                  <td>{proxy.sharesDelegated.toLocaleString()}</td>
                                  <td>{formatDate(proxy.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className={styles.emptyText}>Chưa uỷ quyền cho ai</p>
                      )}
                    </div>

                    <div className={styles.proxySection}>
                      <h3>Danh sách cổ đông uỷ quyền cho</h3>
                      {delegates.length > 0 ? (
                        <div className={styles.delegatesList}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>Mã cổ đông</th>
                                <th>Họ và tên</th>
                                <th>Số cổ phần</th>
                                <th>Ngày uỷ quyền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {delegates.map((delegate, index) => (
                                <tr key={index}>
                                  <td>{delegate.delegatorId}</td>
                                  <td>{delegate.delegatorName}</td>
                                  <td>{delegate.sharesDelegated.toLocaleString()}</td>
                                  <td>{formatDate(delegate.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className={styles.emptyText}>Chưa nhận uỷ quyền từ ai</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thông tin hệ thống */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Thông Tin Hệ Thống</h2>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <label>Ngày tạo</label>
                      <span>{formatDate(shareholder.createdAt)}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Ngày cập nhật</label>
                      <span>{formatDate(shareholder.updatedAt)}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Trạng thái</label>
                      <span className={`${styles.status} ${styles[shareholder.enabled.toString()]}`}>
                        {shareholder.enabled ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            key: '2',
            label: 'Lịch sử biểu quyết',
            children: (
              <div className={styles.card}>
                <Table
                  dataSource={voteHistory}
                  columns={voteColumns}
                  loading={loadingHistory}
                  rowKey={(record) => record.voteId || Math.random().toString()}
                  pagination={{ pageSize: 10 }}
                  style={{ marginTop: 16 }}
                />
              </div>
            )
          },
          {
            key: '3',
            label: 'Lịch sử đăng nhập',
            children: (
              <div className={styles.card}>
                <Table
                  dataSource={loginHistory}
                  columns={loginColumns}
                  loading={loadingHistory}
                  rowKey={(record) => record.id || Math.random().toString()}
                  pagination={{ pageSize: 10 }}
                  style={{ marginTop: 16 }}
                />
              </div>
            )
          },
          {
            key: '4',
            label: 'Nhật ký hoạt động',
            children: (
              <ShareholderLogs shareholderCode={shareholderId} showFilter={false} />
            )
          }
        ]}
      />

      {/* Edit Modal */}
      {shareholder && (
        <EditShareholderModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
          shareholder={shareholder}
        />
      )}

      {/* QR Config Modal */}
      <QrConfigModal
        isOpen={showQrConfigModal}
        onClose={() => setShowQrConfigModal(false)}
        onGenerate={handleGenerateQr}
        loading={isGeneratingQr}
      />

      {/* MagicQrModal */}
      <MagicQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        qrContent={qrContent}
        qrToken={qrToken}
        userName={shareholder?.fullName || 'Người dùng'}
        onRegenerate={() => {
          setShowQrModal(false);
          setShowQrConfigModal(true);
        }}
      />
    </div>
  );
}