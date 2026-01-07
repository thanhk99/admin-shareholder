'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';
import AuthService from '@/lib/api/auth';
import TokenService from '@/lib/api/token';
import { useNotify } from '../hooks/useNotificationHook';
import axios from 'axios';
import { useAuth } from '@/lib/context/AuthProvider';
import { tokenManager } from '@/utils/tokenManager';
import { loginAction } from '@/actions/auth';

export default function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const notify = useNotify();
  const { onLoginSuccess } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!account || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      setLoading(false);
      return;
    }

    try {
      const response: any = await AuthService.login(account, password);

      if (response && response.accessToken) {
        // 1. Set in-memory token for immediate Client-Side use
        tokenManager.setAccessToken(response.accessToken);

        // 2. Call Server Action to set HttpOnly cookies
        await loginAction({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });

        onLoginSuccess();
        notify.success('Đăng nhập thành công', 'Chào mừng trở lại!');
        router.push('/');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            marginBottom: '1rem'
          }}>
            <BankOutlined style={{ fontSize: '24px', color: 'white' }} />
          </div>
          <h1 style={{
            margin: '0 0 0.5rem 0',
            color: '#2d3748',
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            Đăng nhập
          </h1>
          <p style={{
            margin: 0,
            color: '#718096',
            fontSize: '0.9rem'
          }}>
            Truy cập vào hệ thống quản lý
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#4a5568',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              Tài khoản
            </label>
            <div style={{ position: 'relative' }}>
              <UserOutlined style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#a0aec0'
              }} />
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                placeholder="Nhập tài khoản của bạn"
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#4a5568',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <LockOutlined style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#a0aec0'
              }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                placeholder="Nhập mật khẩu"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}