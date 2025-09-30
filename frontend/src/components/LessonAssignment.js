import React from 'react';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { instructorAPI } from '../config/api';

const { TextArea } = Input;

const LessonAssignment = ({ students }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await instructorAPI.assignLesson({
        studentPhone: values.studentPhone,
        title: values.title,
        description: values.description
      });
      message.success('Lesson assigned successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to assign lesson');
    }
  };

  return (
    <Card title="Assign Lesson">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Select Student"
          name="studentPhone"
          rules={[{ required: true, message: 'Please select a student!' }]}
        >
          <Select placeholder="Select a student">
            {students.map(student => (
              <Select.Option key={student.phone} value={student.phone}>
                {student.name} ({student.phone})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Lesson Title"
          name="title"
          rules={[{ required: true, message: 'Please input lesson title!' }]}
        >
          <Input placeholder="Enter lesson title" />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input description!' }]}
        >
          <TextArea rows={4} placeholder="Enter lesson description" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Assign Lesson
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LessonAssignment;
