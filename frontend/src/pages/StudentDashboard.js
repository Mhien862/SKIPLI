import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Card, List, Tag, Modal, Form, Input, message } from 'antd';
import { BookOutlined, MessageOutlined, UserOutlined, LogoutOutlined, CheckOutlined } from '@ant-design/icons';
import ChatComponent from '../components/ChatComponent';
import { studentAPI } from '../config/api';
import './StudentDashboard.css';

const { Header, Content, Sider } = Layout;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('lessons');
  const [lessons, setLessons] = useState([]);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone
      });
    }
  }, [form, user]);

  const fetchLessons = async () => {
    try {
      if (!user) {
        console.error('User is missing');
        message.error('Please login again.');
        return;
      }

      if (user.lessons && user.lessons.length > 0) {
        console.log('Loading lessons from localStorage:', user.lessons);
        setLessons(user.lessons);
        return;
      }

      if (!user.phone) {
        console.error('User phone is missing:', user);
        message.error('User phone number not found. Please login again.');
        return;
      }

      console.log('Fetching lessons from API for phone:', user.phone);
      const response = await studentAPI.getMyLessons(user.phone);
      setLessons(response.data.lessons);
      
      const updatedUser = { ...user, lessons: response.data.lessons };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error fetching lessons:', error);
      
      if (user.lessons) {
        console.log('API failed, using lessons from localStorage');
        setLessons(user.lessons);
      } else {
        message.error(error.response?.data?.error || 'Failed to fetch lessons');
      }
    }
  };

  const handleMarkDone = async (lessonId) => {
    try {
      if (!user || !user.phone) {
        message.error('User phone number not found');
        return;
      }
      const response = await studentAPI.markLessonDone(user.phone, lessonId);
      const updatedLessons = response.data.lessons;
      setLessons(updatedLessons);
      const updatedUser = { ...user, lessons: updatedLessons };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      message.success('Lesson marked as done');
    } catch (error) {
      console.error('Error marking lesson done:', error);
      message.error(error.response?.data?.error || 'Failed to mark lesson as done');
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      if (!user || !user.phone) {
        message.error('User phone number not found');
        return;
      }
      const response = await studentAPI.editProfile({
        phone: user.phone,
        name: values.name,
        email: values.email
      });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('userLogin'));
      message.success('Profile updated successfully');
      setIsProfileModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userLogin'));
    navigate('/', { replace: true });
  };

  const renderLessons = () => (
    <Card title="My Lessons">
      <List
        dataSource={lessons}
        renderItem={(lesson) => (
          <List.Item
            actions={[
              lesson.status === 'completed' ? (
                <Tag color="success">Completed</Tag>
              ) : (
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />}
                  onClick={() => handleMarkDone(lesson.id)}
                >
                  Mark as Done
                </Button>
              )
            ]}
          >
            <List.Item.Meta
              title={lesson.title}
              description={lesson.description}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderChat = () => (
    <ChatComponent currentUser={user} isStudent={true} />
  );

  const renderContent = () => {
    switch (selectedMenu) {
      case 'lessons':
        return renderLessons();
      case 'chat':
        return renderChat();
      default:
        return renderLessons();
    }
  };

  return (
    <Layout className="student-layout">
      <Header className="student-header">
        <h2>Student Dashboard</h2>
        <div className="student-header-actions">
          <Button 
            icon={<UserOutlined />} 
            onClick={() => setIsProfileModalVisible(true)}
          >
            Profile
          </Button>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            onClick={(e) => setSelectedMenu(e.key)}
            className="student-sider"
            items={[
              { key: 'lessons', icon: <BookOutlined />, label: 'My Lessons' },
              { key: 'chat', icon: <MessageOutlined />, label: 'Chat with Instructor' }
            ]}
          />
        </Sider>
        <Layout className="student-content-layout">
          <Content>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
      <Modal
        title="Edit Profile"
        open={isProfileModalVisible}
        onCancel={() => setIsProfileModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleUpdateProfile} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input disabled />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default StudentDashboard;
