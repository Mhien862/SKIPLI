import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { authAPI } from '../config/api';
import './VerifyCode.css';

const VerifyCode = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const loginMethod = localStorage.getItem('loginMethod');
  const tempPhone = localStorage.getItem('tempPhone');
  const tempEmail = localStorage.getItem('tempEmail');

  const handleVerify = async (values) => {
    setLoading(true);
    try {
      let response;
      if (loginMethod === 'phone') {
        response = await authAPI.validateAccessCode(tempPhone, values.accessCode);
      } else {
        response = await authAPI.validateEmailAccessCode(tempEmail, values.accessCode);
      }

      const { userType, user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('tempPhone');
      localStorage.removeItem('tempEmail');
      localStorage.removeItem('loginMethod');
      
      window.dispatchEvent(new Event('userLogin'));
      
      message.success('Login successful');
      
      if (userType === 'instructor') {
        navigate('/instructor', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (error) {
      message.error(error.response?.data?.error || 'Invalid access code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <Card 
        title={<h2 className="verify-card-title">Verify Access Code</h2>}
        className="verify-card"
      >
        <p className="verify-instruction">
          Enter the 6-digit code sent to your {loginMethod === 'phone' ? 'phone' : 'email'}
        </p>
        <Form onFinish={handleVerify} layout="vertical">
          <Form.Item
            label="Access Code"
            name="accessCode"
            rules={[
              { required: true, message: 'Please input your access code!' },
              { len: 6, message: 'Access code must be 6 digits!' }
            ]}
          >
            <Input 
              prefix={<LockOutlined />} 
              placeholder="000000" 
              maxLength={6}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Verify
            </Button>
          </Form.Item>
          <Button type="link" onClick={() => navigate('/')} block>
            Back to Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default VerifyCode;
