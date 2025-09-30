import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import './SetupAccount.css';

const SetupAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      message.error('Invalid setup link');
      navigate('/');
    }
  }, [email, navigate]);

  const handleSetup = async (values) => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/setupAccount`, {
        email: email,
        name: values.name,
        password: values.password
      });

      message.success('Account setup successful! Please login with your email.');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to setup account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-account-container">
      <Card 
        title={<h2 className="setup-account-title">Setup Your Account</h2>}
        className="setup-account-card"
      >
        <p className="setup-account-subtitle">
          Welcome! Please complete your account setup.
        </p>
        <Form onFinish={handleSetup} layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            initialValue={email}
          >
            <Input 
              prefix={<MailOutlined />} 
              disabled 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: 'Please input your name!' },
              { min: 2, message: 'Name must be at least 2 characters!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your full name" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Create a password" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Re-enter your password" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              size="large"
            >
              Complete Setup
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

export default SetupAccount;
