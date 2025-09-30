import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Tabs, message } from 'antd';
import { PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { authAPI } from '../config/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePhoneLogin = async (values) => {
    setLoading(true);
    try {
      await authAPI.createAccessCode(values.phoneNumber);
      localStorage.setItem('tempPhone', values.phoneNumber);
      localStorage.setItem('loginMethod', 'phone');
      message.success('Access code sent to your phone (check console in dev mode)');
      navigate('/verify');
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to send access code');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (values) => {
    setLoading(true);
    try {
      await authAPI.loginEmail(values.email);
      localStorage.setItem('tempEmail', values.email);
      localStorage.setItem('loginMethod', 'email');
      message.success('Access code sent to your email (check console in dev mode)');
      navigate('/verify');
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to send access code');
    } finally {
      setLoading(false);
    }
  };

  const phoneTab = (
    <Form onFinish={handlePhoneLogin} layout="vertical">
      <Form.Item
        label="Phone Number"
        name="phoneNumber"
        rules={[{ required: true, message: 'Please input your phone number!' }]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="+1234567890" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          Send Access Code
        </Button>
      </Form.Item>
    </Form>
  );

  const emailTab = (
    <Form onFinish={handleEmailLogin} layout="vertical">
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' }
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="your@email.com" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          Send Access Code
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="login-container">
      <Card 
        title={<h2 className="login-card-title">Classroom Management</h2>}
        className="login-card"
      >
        <Tabs
          defaultActiveKey="phone"
          items={[
            { key: 'phone', label: 'Phone Login', children: phoneTab },
            { key: 'email', label: 'Email Login', children: emailTab }
          ]}
        />
      </Card>
    </div>
  );
};

export default Login;
