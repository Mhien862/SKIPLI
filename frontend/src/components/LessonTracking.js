import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { instructorAPI } from '../config/api';

const LessonTracking = ({ students }) => {
  const [lessonData, setLessonData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('all');

  useEffect(() => {
    processLessonData();
  }, [students, selectedStudent]);

  const processLessonData = () => {
    const allLessons = [];
    
    students.forEach(student => {
      if (student.lessons && student.lessons.length > 0) {
        student.lessons.forEach(lesson => {
          allLessons.push({
            key: `${student.phone}-${lesson.id}`,
            studentName: student.name,
            studentPhone: student.phone,
            lessonTitle: lesson.title,
            lessonDescription: lesson.description,
            status: lesson.status,
            assignedAt: lesson.assignedAt,
            completedAt: lesson.completedAt
          });
        });
      }
    });

    if (selectedStudent !== 'all') {
      const filtered = allLessons.filter(item => item.studentPhone === selectedStudent);
      setLessonData(filtered);
    } else {
      setLessonData(allLessons);
    }
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      sorter: (a, b) => a.studentName.localeCompare(b.studentName)
    },
    {
      title: 'Lesson Title',
      dataIndex: 'lessonTitle',
      key: 'lessonTitle'
    },
    {
      title: 'Description',
      dataIndex: 'lessonDescription',
      key: 'lessonDescription',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        status === 'completed' ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Completed
          </Tag>
        ) : (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Pending
          </Tag>
        )
      ),
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'Pending', value: 'pending' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.assignedAt) - new Date(b.assignedAt)
    },
    {
      title: 'Completed Date',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    }
  ];

  const getStatistics = () => {
    const total = lessonData.length;
    const completed = lessonData.filter(item => item.status === 'completed').length;
    const pending = total - completed;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    return { total, completed, pending, completionRate };
  };

  const stats = getStatistics();

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Lesson Tracking</h2>
            <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
              <span>Total: <strong>{stats.total}</strong></span>
              <span>Completed: <strong style={{ color: '#52c41a' }}>{stats.completed}</strong></span>
              <span>Pending: <strong style={{ color: '#faad14' }}>{stats.pending}</strong></span>
              <span>Completion Rate: <strong>{stats.completionRate}%</strong></span>
            </div>
          </div>
          <div>
            <Select
              style={{ width: 200 }}
              placeholder="Filter by student"
              value={selectedStudent}
              onChange={setSelectedStudent}
            >
              <Select.Option value="all">All Students</Select.Option>
              {students.map(student => (
                <Select.Option key={student.phone} value={student.phone}>
                  {student.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={lessonData}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default LessonTracking;

