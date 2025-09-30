import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { instructorAPI } from '../config/api';
import './StudentManagement.css';

const StudentManagement = ({ students, fetchStudents }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [form] = Form.useForm();

  const handleAddStudent = () => {
    setIsEditMode(false);
    setCurrentStudent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditStudent = (student) => {
    setIsEditMode(true);
    setCurrentStudent(student);
    form.setFieldsValue({
      name: student.name,
      phone: student.phone,
      email: student.email
    });
    setIsModalVisible(true);
  };

  const handleDeleteStudent = async (phone) => {
    try {
      await instructorAPI.deleteStudent(phone);
      message.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      message.error('Failed to delete student');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditMode) {
        await instructorAPI.editStudent(currentStudent.phone, values);
        message.success('Student updated successfully');
      } else {
        await instructorAPI.addStudent(values);
        message.success('Student added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchStudents();
    } catch (error) {
      message.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditStudent(record)} />
          <Popconfirm
            title="Are you sure you want to delete this student?"
            onConfirm={() => handleDeleteStudent(record.phone)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="student-management-header">
        <h2>Student Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStudent}>
          Add Student
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={students} 
        rowKey="phone"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={isEditMode ? 'Edit Student' : 'Add Student'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please input phone!' }]}
          >
            <Input disabled={isEditMode} />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
