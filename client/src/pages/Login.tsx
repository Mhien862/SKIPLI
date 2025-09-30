import { useState } from 'react';
import { Tabs, Form, Input, Button, Typography, message } from 'antd';
import { requestSmsCode, verifySmsCode, requestEmailCode, verifyEmailCode, passwordLogin } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [smsRequested, setSmsRequested] = useState(false);
  const [emailRequested, setEmailRequested] = useState(false);
  const navigate = useNavigate();

  const onSmsRequest = async (values: any) => {
    try {
      setLoading(true);
      await requestSmsCode(values.phoneNumber);
      setSmsRequested(true);
      message.success('SMS code sent');
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onSmsVerify = async (values: any) => {
    try {
      setLoading(true);
      const { token, role } = await verifySmsCode(values.phoneNumber, values.accessCode);
      localStorage.setItem('token', token);
      const payload = jwtDecode<{ phone: string; role: 'instructor' | 'student' }>(token);
      localStorage.setItem('phone', payload.phone);
      localStorage.setItem('role', payload.role);
      navigate(role === 'instructor' ? '/instructor' : '/student');
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onEmailRequest = async (values: any) => {
    try {
      setLoading(true);
      await requestEmailCode(values.email);
      setEmailRequested(true);
      message.success('Email code sent');
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onEmailVerify = async (values: any) => {
    try {
      setLoading(true);
      const { token } = await verifyEmailCode(values.email, values.accessCode);
      localStorage.setItem('token', token);
      const payload = jwtDecode<{ phone: string; role: 'instructor' | 'student' }>(token);
      localStorage.setItem('phone', payload.phone);
      localStorage.setItem('role', payload.role || 'student');
      navigate('/student');
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordLogin = async (values: any) => {
    try {
      setLoading(true);
      const { token, role } = await passwordLogin(values.username, values.password);
      localStorage.setItem('token', token);
      const payload = jwtDecode<{ phone: string; role: 'instructor' | 'student' }>(token);
      localStorage.setItem('phone', payload.phone);
      localStorage.setItem('role', payload.role);
      navigate(role === 'instructor' ? '/instructor' : '/student');
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '72px auto' }}>
      <Typography.Title level={3} style={{ textAlign: 'center' }}>Classroom App Login</Typography.Title>
      <Tabs
        items={[
          {
            key: 'sms',
            label: 'SMS Login',
            children: (
              <>
                <Form layout="vertical" onFinish={smsRequested ? onSmsVerify : onSmsRequest} disabled={loading}>
                  <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}> 
                    <Input placeholder="+1 555 123 4567" />
                  </Form.Item>
                  {smsRequested && (
                    <Form.Item name="accessCode" label="Access Code" rules={[{ required: true }]}> 
                      <Input placeholder="6-digit code" />
                    </Form.Item>
                  )}
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    {smsRequested ? 'Verify Code' : 'Send Code'}
                  </Button>
                </Form>
              </>
            )
          },
          {
            key: 'email',
            label: 'Email Login',
            children: (
              <>
                <Form layout="vertical" onFinish={emailRequested ? onEmailVerify : onEmailRequest} disabled={loading}>
                  <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}> 
                    <Input placeholder="you@example.com" />
                  </Form.Item>
                  {emailRequested && (
                    <Form.Item name="accessCode" label="Access Code" rules={[{ required: true }]}> 
                      <Input placeholder="6-digit code" />
                    </Form.Item>
                  )}
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    {emailRequested ? 'Verify Code' : 'Send Code'}
                  </Button>
                </Form>
              </>
            )
          },
          {
            key: 'password',
            label: 'Password Login',
            children: (
              <Form layout="vertical" onFinish={onPasswordLogin} disabled={loading}>
                <Form.Item name="username" label="Username" rules={[{ required: true }]}> 
                  <Input />
                </Form.Item>
                <Form.Item name="password" label="Password" rules={[{ required: true }]}> 
                  <Input.Password />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>Login</Button>
              </Form>
            )
          }
        ]}
      />
    </div>
  );
}


