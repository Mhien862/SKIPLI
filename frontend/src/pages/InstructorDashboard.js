import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, message } from 'antd';
import { UserOutlined, BookOutlined, MessageOutlined, LogoutOutlined, CheckSquareOutlined } from '@ant-design/icons';
import StudentManagement from '../components/StudentManagement';
import LessonAssignment from '../components/LessonAssignment';
import LessonTracking from '../components/LessonTracking';
import ChatComponent from '../components/ChatComponent';
import { instructorAPI } from '../config/api';
import './InstructorDashboard.css';

const { Header, Content, Sider } = Layout;

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('students');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await instructorAPI.getStudents();
      setStudents(response.data.students);
    } catch (error) {
      message.error('Failed to fetch students');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userLogin'));
    navigate('/', { replace: true });
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'students':
        return <StudentManagement students={students} fetchStudents={fetchStudents} />;
      case 'lessons':
        return <LessonAssignment students={students} />;
      case 'tracking':
        return <LessonTracking students={students} />;
      case 'chat':
        return (
          <ChatComponent 
            currentUser={user} 
            students={students}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
          />
        );
      default:
        return <StudentManagement students={students} fetchStudents={fetchStudents} />;
    }
  };

  return (
    <Layout className="instructor-layout">
      <Header className="instructor-header">
        <h2>Instructor Dashboard</h2>
        <Button icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Button>
      </Header>
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            onClick={(e) => setSelectedMenu(e.key)}
            className="instructor-sider"
            items={[
              { key: 'students', icon: <UserOutlined />, label: 'Students' },
              { key: 'lessons', icon: <BookOutlined />, label: 'Assign Lessons' },
              { key: 'tracking', icon: <CheckSquareOutlined />, label: 'Lesson Tracking' },
              { key: 'chat', icon: <MessageOutlined />, label: 'Messages' }
            ]}
          />
        </Sider>
        <Layout className="instructor-content-layout">
          <Content>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default InstructorDashboard;
