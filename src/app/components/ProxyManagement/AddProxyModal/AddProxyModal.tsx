'use client';

import { useState, useEffect } from 'react';
import {
    UserOutlined,
    NumberOutlined,
    CalendarOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import ProxyService from '@/lib/api/proxy';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import modalStyles from '../../UserManagement/Modal/Modal.module.css';
import styles from './AddProxyModal.module.css';

interface AddProxyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    meetingId: string;
}

interface ShareholderInfo {
    id: string;
    fullName: string;
    investorCode: string;
    sharesOwned: number;
}

export default function AddProxyModal({ isOpen, onClose, onSuccess, meetingId }: AddProxyModalProps) {
    const [codes, setCodes] = useState({
        principalCode: '',
        proxyCode: ''
    });

    const [shares, setShares] = useState(0);
    const [doc, setDoc] = useState('');

    const [principalInfo, setPrincipalInfo] = useState<ShareholderInfo | null>(null);
    const [proxyInfo, setProxyInfo] = useState<ShareholderInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [checkingPrincipal, setCheckingPrincipal] = useState(false);
    const [checkingProxy, setCheckingProxy] = useState(false);

    const checkShareholder = async (code: string, type: 'principal' | 'proxy') => {
        if (!code) return;
        try {
            if (type === 'principal') setCheckingPrincipal(true);
            else setCheckingProxy(true);

            // SEARCH BY SYSTEM ID (since user said Mã cổ đông is the ID)
            const response = await ShareholderManage.getShareholderByCode(code);
            const info = (response as any).data || response;

            if (info && info.id) {
                if (type === 'principal') {
                    setPrincipalInfo({
                        id: info.id,
                        fullName: info.fullName,
                        investorCode: info.investorCode,
                        sharesOwned: info.sharesOwned
                    });
                    setShares(info.sharesOwned);
                } else {
                    setProxyInfo({
                        id: info.id,
                        fullName: info.fullName,
                        investorCode: info.investorCode,
                        sharesOwned: info.sharesOwned
                    });
                }
            } else {
                if (type === 'principal') setPrincipalInfo(null);
                else setProxyInfo(null);
            }
        } catch (error) {
            console.error('Error checking shareholder:', error);
            if (type === 'principal') setPrincipalInfo(null);
            else setProxyInfo(null);
        } finally {
            if (type === 'principal') setCheckingPrincipal(false);
            else setCheckingProxy(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!principalInfo || !proxyInfo || shares <= 0) {
            alert('Vui lòng nhập đầy đủ và kiểm tra thông tin cổ đông');
            return;
        }

        if (principalInfo.id === proxyInfo.id) {
            alert('Cổ đông không thể tự uỷ quyền cho chính mình');
            return;
        }

        setLoading(true);
        try {
            // SEND SYSTEM IDs TO BACKEND
            await ProxyService.createProxy(meetingId, {
                delegatorId: principalInfo.id,
                proxyId: proxyInfo.id,
                sharesDelegated: shares,
                authorizationDocument: doc
            });
            alert('Thêm uỷ quyền thành công');
            handleClose();
            onSuccess();
        } catch (error: any) {
            console.error('Error adding proxy:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi thêm uỷ quyền');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCodes({
            principalCode: '',
            proxyCode: ''
        });
        setShares(0);
        setDoc('');
        setPrincipalInfo(null);
        setProxyInfo(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={modalStyles.modalOverlay}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h3 className={modalStyles.modalTitle}>Thêm Uỷ quyền mới</h3>
                    <button
                        className={modalStyles.closeButton}
                        onClick={handleClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={modalStyles.modalForm}>
                    <div className={styles.proxyGrid}>
                        {/* Principal Section */}
                        <div className={styles.formGroup}>
                            <label className={`${modalStyles.formLabel} ${modalStyles.required}`}>
                                Cổ đông uỷ quyền (Mã số)
                            </label>
                            <div className={styles.inputCheck}>
                                <input
                                    type="text"
                                    value={codes.principalCode}
                                    onChange={(e) => setCodes({ ...codes, principalCode: e.target.value })}
                                    placeholder="Nhập mã cổ đông"
                                    disabled={loading}
                                    className={modalStyles.formInput}
                                />
                                <button
                                    type="button"
                                    onClick={() => checkShareholder(codes.principalCode, 'principal')}
                                    disabled={checkingPrincipal || !codes.principalCode}
                                    className={styles.checkBtn}
                                >
                                    {checkingPrincipal ? <SyncOutlined spin /> : <SearchOutlined />}
                                </button>
                            </div>
                            {principalInfo && (
                                <div className={styles.infoBox}>
                                    <CheckCircleOutlined className={styles.successIcon} />
                                    <span>{principalInfo.fullName} (Sở hữu: {principalInfo.sharesOwned.toLocaleString()} CP)</span>
                                </div>
                            )}
                        </div>

                        {/* Proxy Section */}
                        <div className={styles.formGroup}>
                            <label className={`${modalStyles.formLabel} ${modalStyles.required}`}>
                                Người nhận uỷ quyền (Mã số)
                            </label>
                            <div className={styles.inputCheck}>
                                <input
                                    type="text"
                                    value={codes.proxyCode}
                                    onChange={(e) => setCodes({ ...codes, proxyCode: e.target.value })}
                                    placeholder="Nhập mã người nhận"
                                    disabled={loading}
                                    className={modalStyles.formInput}
                                />
                                <button
                                    type="button"
                                    onClick={() => checkShareholder(codes.proxyCode, 'proxy')}
                                    disabled={checkingProxy || !codes.proxyCode}
                                    className={styles.checkBtn}
                                >
                                    {checkingProxy ? <SyncOutlined spin /> : <SearchOutlined />}
                                </button>
                            </div>
                            {proxyInfo && (
                                <div className={styles.infoBox}>
                                    <CheckCircleOutlined className={styles.successIcon} />
                                    <span>{proxyInfo.fullName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={modalStyles.formGroup}>
                        <label className={`${modalStyles.formLabel} ${modalStyles.required}`}>
                            Số cổ phần uỷ quyền
                        </label>
                        <div className={modalStyles.inputWithIcon}>
                            <NumberOutlined className={modalStyles.inputIcon} />
                            <input
                                type="number"
                                value={shares}
                                onChange={(e) => setShares(Number(e.target.value))}
                                placeholder="Nhập số cổ phần"
                                disabled={loading}
                                className={modalStyles.formInput}
                            />
                        </div>
                    </div>

                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.formLabel}>
                            Tài liệu uỷ quyền (Nếu có)
                        </label>
                        <div className={modalStyles.inputWithIcon}>
                            <FileTextOutlined className={modalStyles.inputIcon} />
                            <input
                                type="text"
                                value={doc}
                                onChange={(e) => setDoc(e.target.value)}
                                placeholder="Link tài liệu hoặc ghi chú uỷ quyền"
                                disabled={loading}
                                className={modalStyles.formInput}
                            />
                        </div>
                    </div>

                    <div className={modalStyles.formActions}>
                        <button
                            type="button"
                            className={modalStyles.cancelButton}
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className={modalStyles.saveButton}
                            disabled={loading || !principalInfo || !proxyInfo}
                        >
                            {loading ? 'Đang xử lý...' : 'Thêm uỷ quyền'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
