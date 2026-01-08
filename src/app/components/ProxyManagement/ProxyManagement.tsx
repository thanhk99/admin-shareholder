'use client';

import { useEffect, useState } from 'react';
import {
    SearchOutlined,
    DeleteOutlined,
    SyncOutlined,
    FilterOutlined,
    CalendarOutlined,
    PlusOutlined
} from '@ant-design/icons';
import styles from './ProxyManagement.module.css';
import ProxyService from '@/lib/api/proxy';
import { MeetingService } from '@/lib/api/meetings';
import { ProxyItem } from '@/app/types/proxy';
import { Meeting } from '@/app/types/meeting';
import { formatDate } from "@/utils/format";
import AddProxyModal from './AddProxyModal/AddProxyModal';

export default function ProxyManagement() {
    const [proxies, setProxies] = useState<ProxyItem[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [meetingsRes, ongoingRes] = await Promise.all([
                MeetingService.getAllMeetings(),
                MeetingService.getOngoingMeeting().catch(() => null)
            ]);

            if (Array.isArray(meetingsRes)) {
                setMeetings(meetingsRes);
            } else if ((meetingsRes as any).data) {
                setMeetings((meetingsRes as any).data);
            }

            if (ongoingRes && (ongoingRes as any).id) {
                setSelectedMeetingId((ongoingRes as any).id);
            } else if (Array.isArray(meetingsRes) && meetingsRes.length > 0) {
                setSelectedMeetingId(meetingsRes[0].id);
            } else if ((meetingsRes as any).data && (meetingsRes as any).data.length > 0) {
                setSelectedMeetingId((meetingsRes as any).data[0].id);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProxies = async () => {
        if (!selectedMeetingId) return;
        try {
            setLoading(true);
            const response = await ProxyService.getMeetingProxies(selectedMeetingId);
            if (Array.isArray(response)) {
                setProxies(response);
            } else if ((response as any).data) {
                setProxies((response as any).data);
            }
        } catch (error) {
            console.error('Error fetching proxies:', error);
            setProxies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedMeetingId) {
            fetchProxies();
        }
    }, [selectedMeetingId]);

    const handleRevokeProxy = async (proxyId: number) => {
        if (!confirm('Bạn có chắc chắn muốn thu hồi uỷ quyền này?')) {
            return;
        }

        try {
            setLoading(true);
            await ProxyService.revokeProxy(selectedMeetingId, proxyId);
            await fetchProxies();
            alert('Đã thu hồi uỷ quyền thành công');
        } catch (error) {
            console.error('Error revoking proxy:', error);
            alert('Có lỗi xảy ra khi thu hồi uỷ quyền');
        } finally {
            setLoading(false);
        }
    };

    const filteredProxies = proxies.filter(proxy => {
        const matchesSearch =
            (proxy.delegatorName || proxy.principalName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (proxy.proxyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (proxy.delegatorId || proxy.principalId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (proxy.proxyId || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || proxy.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className={styles.management}>
            <div className={styles.header}>
                <div>
                    <h1>Quản lý Uỷ quyền</h1>
                    <p>Theo dõi và quản lý các lượt uỷ quyền biểu quyết</p>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.meetingSelect}>
                        <CalendarOutlined />
                        <select
                            value={selectedMeetingId}
                            onChange={(e) => setSelectedMeetingId(e.target.value)}
                            className={styles.select}
                        >
                            <option value="">Chọn cuộc họp</option>
                            {meetings.map(m => (
                                <option key={m.id} value={m.id}>{m.title}</option>
                            ))}
                        </select>
                    </div>
                    <button className={styles.refreshButton} onClick={fetchProxies} disabled={loading || !selectedMeetingId}>
                        <SyncOutlined spin={loading} />
                        Làm mới
                    </button>
                    <button
                        className={styles.addButton}
                        onClick={() => setShowAddModal(true)}
                        disabled={!selectedMeetingId}
                    >
                        <PlusOutlined />
                        Thêm uỷ quyền
                    </button>
                </div>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <SearchOutlined />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc mã cổ đông..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.filters}>
                    <div className={styles.filterItem}>
                        <FilterOutlined />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={styles.select}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="ACTIVE">Đang hiệu lực</option>
                            <option value="REVOKED">Đã thu hồi</option>
                            <option value="EXPIRED">Đã hết hạn</option>
                        </select>
                    </div>
                </div>

                <div className={styles.stats}>
                    <span>Tổng số: {proxies.length} lượt</span>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Cổ đông uỷ quyền</th>
                            <th>Người nhận uỷ quyền</th>
                            <th>Số cổ phần</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProxies.length > 0 ? (
                            filteredProxies.map((proxy) => (
                                <tr key={proxy.id}>
                                    <td>
                                        <div className={styles.memberInfo}>
                                            <span className={styles.memberName}>{proxy.delegatorName || proxy.principalName}</span>
                                            <span className={styles.memberCode}>{proxy.delegatorId || proxy.principalId}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.memberInfo}>
                                            <span className={styles.memberName}>{proxy.proxyName}</span>
                                            <span className={styles.memberCode}>{proxy.proxyId}</span>
                                        </div>
                                    </td>
                                    <td className={styles.shares}>{proxy.sharesDelegated.toLocaleString()}</td>
                                    <td>{formatDate(proxy.createdAt)}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[proxy.status?.toLowerCase()]}`}>
                                            {proxy.status === 'ACTIVE' ? 'Đang hiệu lực' :
                                                proxy.status === 'REVOKED' ? 'Đã thu hồi' : 'Hết hạn'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            {proxy.status === 'ACTIVE' && (
                                                <button
                                                    className={styles.cancelButton}
                                                    title="Thu hồi uỷ quyền"
                                                    onClick={() => handleRevokeProxy(proxy.id)}
                                                    disabled={loading}
                                                >
                                                    <DeleteOutlined />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.emptyCell}>
                                    {selectedMeetingId ? 'Không tìm thấy dữ liệu uỷ quyền' : 'Vui lòng chọn cuộc họp'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingSpinner}></div>
                </div>
            )}

            <AddProxyModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchProxies}
                meetingId={selectedMeetingId}
            />
        </div>
    );
}
