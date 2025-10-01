import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Select, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import io from 'socket.io-client';
import './ChatComponent.css';

const { TextArea } = Input;

const ChatComponent = ({ currentUser, students, selectedStudent, setSelectedStudent, isStudent }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [chatPartner, setChatPartner] = useState(selectedStudent);
  const [instructorPhone, setInstructorPhone] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('join', { 
      userId: currentUser.phone, 
      role: currentUser.role 
    });

    newSocket.on('newMessage', (message) => {
      setMessages(prev => {
        const exists = prev.find(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    return () => newSocket.close();
  }, [currentUser]);

  useEffect(() => {
    if (isStudent) {
      const fetchInstructor = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/auth/getInstructor`);
          const data = await response.json();
          console.log('Instructor data:', data);
          if (data.success && data.instructor) {
            console.log('Setting instructor phone to:', data.instructor.phone);
            setInstructorPhone(data.instructor.phone);
            setChatPartner(data.instructor.phone);
          } else {
            console.error('No instructor found in response');
          }
        } catch (error) {
          console.error('Failed to fetch instructor:', error);
        }
      };
      fetchInstructor();
    }
  }, [isStudent]);

  useEffect(() => {
    if (socket && ((isStudent && instructorPhone) || (!isStudent && chatPartner))) {
      const partner = isStudent ? instructorPhone : chatPartner;
      if (!partner) return;

      socket.emit('getMessages', { 
        user1: currentUser.phone, 
        user2: partner
      }, (response) => {
        if (response.success) {
          setMessages(response.messages);
        }
      });
    }
  }, [chatPartner, socket, currentUser.phone, isStudent, instructorPhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    if (!isStudent && !chatPartner) {
      message.error('Please select a student to chat with');
      return;
    }

    const recipient = isStudent ? instructorPhone : chatPartner;

    if (!recipient) {
      message.error('Chat partner not found');
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      from: currentUser.phone,
      to: recipient,
      message: messageText,
      fromRole: currentUser.role,
      toRole: isStudent ? 'instructor' : 'student',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);

    socket.emit('sendMessage', {
      from: currentUser.phone,
      to: recipient,
      message: messageText,
      fromRole: currentUser.role,
      toRole: isStudent ? 'instructor' : 'student'
    });

    setMessageText('');
  };

  const renderMessages = () => (
    <div className="chat-messages-container">
      {messages.map((msg) => {
        const isOwn = msg.from === currentUser.phone;
        return (
          <div key={msg.id} className={`chat-message ${isOwn ? 'own' : 'other'}`}>
            <div className={`chat-message-bubble ${isOwn ? 'own' : 'other'}`}>
              <div className="chat-message-sender">
                {isOwn ? 'You' : msg.fromRole}
              </div>
              <div>{msg.message}</div>
              <div className="chat-message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );

  return (
    <Card 
      title={
        isStudent ? (
          'Chat with Instructor'
        ) : (
          <Select
            className="chat-student-select"
            placeholder="Select a student to chat"
            value={chatPartner}
            onChange={(value) => {
              setChatPartner(value);
              setSelectedStudent && setSelectedStudent(value);
            }}
          >
            {students?.map(student => (
              <Select.Option key={student.phone} value={student.phone}>
                {student.name} ({student.phone})
              </Select.Option>
            ))}
          </Select>
        )
      }
    >
      {renderMessages()}
      <div className="chat-input-container">
        <TextArea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onPressEnter={(e) => {
            if (e.nativeEvent.isComposing) {
              return;
            }
            if (!e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
          autoSize={{ minRows: 1, maxRows: 4 }}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSendMessage}
        >
          Send
        </Button>
      </div>
    </Card>
  );
};

export default ChatComponent;
