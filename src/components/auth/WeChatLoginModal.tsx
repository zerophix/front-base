'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal, Spin, Typography, Button, message } from 'antd';
import { getWeChatUrls } from '@/config/api';

const { Text } = Typography;

interface WeChatLoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (token: string) => void;
}

const WeChatLoginModal: React.FC<WeChatLoginModalProps> = ({ visible, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrTicket, setQrTicket] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setChecking(false);
  };

  const fetchWeChatQRCode = async () => {
    setLoading(true);
    setError(null);
    console.log('开始获取微信二维码...');
    
    try {
      const wechatUrls = getWeChatUrls();
      console.log('微信二维码API URL:', wechatUrls.qrCode);
      
      const res = await fetch(wechatUrls.qrCode, {
        headers: { Accept: 'application/json' }
      });
      
      console.log('API响应状态:', res.status);
      
      if (!res.ok) {
        throw new Error(`API请求失败: ${res.status} ${res.statusText}`);
      }
      
      const json = await res.json();
      console.log('API响应数据:', json);
      
      // 检查响应码
      if (json.code === '0000') {
        const wechatQrUrl: string | undefined = json?.data || json?.url || json?.qrCodeUrl;
        if (typeof wechatQrUrl === 'string' && wechatQrUrl.startsWith('https://mp.weixin.qq.com/cgi-bin/showqrcode')) {
          console.log('微信二维码URL:', wechatQrUrl);
          
          // 提取ticket参数
          try {
            const urlObj = new URL(wechatQrUrl);
            const ticket = urlObj.searchParams.get('ticket');
            console.log('提取的ticket:', ticket);
            
            if (ticket) {
              setQrTicket(ticket);
              // 使用代理接口显示二维码图片，避免CORS问题
              const proxyImageUrl = `/api/v1/login/wechat_qrcode_image?ticket=${encodeURIComponent(ticket)}`;
              setQrImageUrl(proxyImageUrl);
              console.log('代理二维码图片URL:', proxyImageUrl);
            } else {
              throw new Error('无法从URL中提取ticket参数');
            }
          } catch (e) {
            console.error('提取ticket失败:', e);
            setError('无法解析二维码URL');
            setQrImageUrl(null);
            setQrTicket(null);
          }
        } else {
          const errorMsg = '后端返回的二维码URL格式不正确';
          console.error(errorMsg, 'URL:', wechatQrUrl);
          setError(errorMsg);
          message.error(errorMsg);
          setQrImageUrl(null);
          setQrTicket(null);
        }
      } else {
        const errorMsg = json.message || '获取二维码失败';
        console.error('后端返回错误:', json);
        setError(errorMsg);
        message.error(errorMsg);
        setQrImageUrl(null);
        setQrTicket(null);
      }
    } catch (err) {
      const errorMsg = `获取微信二维码失败: ${err instanceof Error ? err.message : String(err)}`;
      console.error(errorMsg, err);
      setError(errorMsg);
      message.error(errorMsg);
      setQrImageUrl(null);
      setQrTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (ticket: string) => {
    stopPolling();
    setChecking(true);
    console.log('开始轮询登录状态, ticket:', ticket);
    
    pollTimerRef.current = window.setInterval(async () => {
      try {
        const wechatUrls = getWeChatUrls();
        const checkUrl = `${wechatUrls.checkLogin}?ticket=${encodeURIComponent(ticket)}`;
        console.log('检查登录状态URL:', checkUrl);
        
        const resp = await fetch(checkUrl, {
          headers: { Accept: 'application/json' }
        });
        const j = await resp.json();
        console.log('登录状态检查:', j);
        
        const code = j?.code;
        if (code === '0000') {
          const token = j?.data;
          if (token && onSuccess) onSuccess(String(token));
          message.success('微信登录成功');
          stopPolling();
          onClose();
        } else if (code === '0003') {
          // 未登录，继续等待
          console.log('用户尚未扫码登录，继续等待...');
        } else {
          console.log('登录状态检查返回其他状态:', code);
        }
      } catch (e) {
        console.error('登录状态检查失败:', e);
        // 网络错误，继续尝试
      }
    }, 2000);
  };

  useEffect(() => {
    if (visible) {
      fetchWeChatQRCode();
    } else {
      stopPolling();
      setQrImageUrl(null);
      setQrTicket(null);
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && qrTicket) {
      startPolling(qrTicket);
    }
    return () => {
      stopPolling();
    };
  }, [qrTicket, visible]);

  return (
    <Modal
      open={visible}
      onCancel={() => { stopPolling(); onClose(); }}
      footer={null}
      centered
      width={360}
      title="微信扫码登录"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {loading ? (
          <div style={{ padding: '40px 0' }}>
            <Spin />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">正在获取二维码...</Text>
            </div>
          </div>
        ) : error ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Text type="danger">{error}</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={fetchWeChatQRCode}>
                重新获取
              </Button>
            </div>
          </div>
        ) : qrImageUrl ? (
          <>
            <img
              src={qrImageUrl}
              alt="微信登录二维码"
              style={{ width: 240, height: 240 }}
              onLoad={() => console.log('二维码图片加载成功')}
              onError={(e) => {
                console.error('二维码图片加载失败:', e);
                setError('二维码图片加载失败');
              }}
            />
            <Text type="secondary" style={{ marginTop: 8, textAlign: 'center' }}>
              打开微信"扫一扫"，我们正在检测登录状态...
            </Text>
            <Button type="link" onClick={() => { stopPolling(); fetchWeChatQRCode(); }} style={{ marginTop: 8 }}>
              刷新二维码
            </Button>
          </>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Text type="danger">二维码加载失败，请重试</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={fetchWeChatQRCode}>
                重新获取
              </Button>
            </div>
          </div>
        )}
        {checking && !loading && qrImageUrl && (
          <Text type="secondary" style={{ marginTop: 8 }}>正在轮询登录状态...</Text>
        )}
      </div>
    </Modal>
  );
};

export default WeChatLoginModal;