import { useEffect, useState } from 'react';
import { List, Button, Space, Typography, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getMyLessons, markLessonDone, updateProfile } from '../api/student';

export default function Student() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const phone = localStorage.getItem('phone') || '';
  const navigate = useNavigate();

  const load = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const list = await getMyLessons(phone);
      setLessons(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDone = async (id: string) => {
    try {
      await markLessonDone(phone, id);
      message.success('Marked done');
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message);
    }
  };

  const onSaveProfile = async (values: any) => {
    try {
      await updateProfile(phone, values);
      message.success('Profile updated');
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '32px auto' }}>
      <Typography.Title level={3}>Student Dashboard</Typography.Title>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Typography.Title level={5}>My Lessons</Typography.Title>
        <Button onClick={() => { const peer = prompt('Instructor phone to chat?'); if (peer) { localStorage.setItem('chatPeer', peer); navigate('/chat'); } }}>Chat with Instructor</Button>
      </Space>
      <List
        loading={loading}
        dataSource={lessons}
        renderItem={(item) => (
          <List.Item actions={[item.status !== 'done' ? <Button onClick={() => onDone(item.id)}>Done</Button> : <span>Completed</span>]}> 
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />

      <div style={{ marginTop: 24 }}>
        <Typography.Title level={5}>Edit Profile</Typography.Title>
        <Form layout="vertical" onFinish={onSaveProfile} initialValues={{ name: localStorage.getItem('name') || '', email: localStorage.getItem('email') || '' }}>
          <Form.Item name="name" label="Name">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}> 
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">Save</Button>
        </Form>
      </div>
    </div>
  );
}


