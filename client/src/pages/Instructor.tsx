import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { addStudent, assignLesson, fetchStudents, deleteStudent } from '../api/instructor';

export default function Instructor() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openAssign, setOpenAssign] = useState<null | string>(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const list = await fetchStudents();
      setStudents(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onAdd = async (values: any) => {
    try {
      await addStudent(values.name, values.phone, values.email);
      message.success('Student added');
      setOpenAdd(false);
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message);
    }
  };

  const onAssign = async (values: any) => {
    try {
      if (!openAssign) return;
      await assignLesson(openAssign, values.title, values.description);
      message.success('Lesson assigned');
      setOpenAssign(null);
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message);
    }
  };

  const onDelete = async (phone: string) => {
    try {
      await deleteStudent(phone);
      message.success('Deleted');
      load();
    } catch (e: any) {
      message.error(e?.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '32px auto' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3}>Instructor Dashboard</Typography.Title>
        <Button type="primary" onClick={() => setOpenAdd(true)}>Add Student</Button>
      </Space>
      <Table
        rowKey={(r) => r.phone}
        loading={loading}
        dataSource={students}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Phone', dataIndex: 'phone' },
          { title: 'Email', dataIndex: 'email' },
          {
            title: 'Actions',
            render: (_: any, rec: any) => (
              <Space>
                <Button onClick={() => setOpenAssign(rec.phone)}>Assign Lesson</Button>
                <Button onClick={() => { localStorage.setItem('chatPeer', rec.phone); navigate('/chat'); }}>Chat</Button>
                <Button danger onClick={() => onDelete(rec.phone)}>Delete</Button>
              </Space>
            )
          }
        ]}
      />

      <Modal open={openAdd} onCancel={() => setOpenAdd(false)} footer={null} title="Add Student">
        <Form layout="vertical" onFinish={onAdd}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input placeholder="+1 555 123 4567" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Add</Button>
        </Form>
      </Modal>

      <Modal open={!!openAssign} onCancel={() => setOpenAssign(null)} footer={null} title="Assign Lesson">
        <Form layout="vertical" onFinish={onAssign}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Assign</Button>
        </Form>
      </Modal>
    </div>
  );
}


