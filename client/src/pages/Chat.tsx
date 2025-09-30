import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { List, Input, Button } from 'antd';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const phone = localStorage.getItem('phone') || '';
  const peer = localStorage.getItem('chatPeer') || '';
  const roomId = useMemo(() => [phone, peer].sort().join(':'), [phone, peer]);
  const socket = useMemo(() => io(import.meta.env.VITE_API_URL || 'http://localhost:4000'), []);

  useEffect(() => {
    socket.emit('join', roomId);
    socket.on('message', (msg) => setMessages((m) => [...m, msg]));
    return () => {
      socket.off('message');
      socket.disconnect();
    };
  }, [roomId, socket]);

  const send = () => {
    if (!text.trim()) return;
    socket.emit('message', roomId, { fromPhone: phone, toPhone: peer, text });
    setText('');
  };

  return (
    <div style={{ maxWidth: 600, margin: '24px auto' }}>
      <List
        dataSource={messages}
        renderItem={(m) => (
          <List.Item style={{ justifyContent: m.fromPhone === phone ? 'flex-end' : 'flex-start' }}>
            <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 6 }}>{m.text}</div>
          </List.Item>
        )}
      />
      <Input.Group compact>
        <Input style={{ width: 'calc(100% - 100px)' }} value={text} onChange={(e) => setText(e.target.value)} onPressEnter={send} />
        <Button type="primary" onClick={send}>Send</Button>
      </Input.Group>
    </div>
  );
}


