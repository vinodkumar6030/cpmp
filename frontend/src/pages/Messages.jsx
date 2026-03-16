import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const { productId, userId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (productId && userId) {
      openThread(parseInt(productId), parseInt(userId));
    }
  }, [productId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll messages every 5 seconds when thread is open
  useEffect(() => {
    if (!activeConv) return;
    const interval = setInterval(() => {
      fetchMessages(activeConv.productId, activeConv.otherUser.id, false);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConv]);

  const fetchConversations = async () => {
    setLoadingConvs(true);
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch { setConversations([]); }
    finally { setLoadingConvs(false); }
  };

  const fetchMessages = async (pId, uId, showLoader = true) => {
    if (showLoader) setLoadingMsgs(true);
    try {
      const res = await api.get(`/messages/${pId}/${uId}`);
      setMessages(res.data);
    } catch { setMessages([]); }
    finally { if (showLoader) setLoadingMsgs(false); }
  };

  const openThread = async (pId, uId) => {
    // Find in conversations or create a temporary active conv
    const existing = conversations.find(c => c.productId === pId && c.otherUser?.id === uId);
    if (existing) {
      setActiveConv(existing);
    } else {
      // Try to build from API (new conversation started from product page)
      try {
        const [productRes, userRes] = await Promise.all([
          api.get(`/products/${pId}`),
          api.get(`/users/${uId}/products`).catch(() => null)
        ]);
        setActiveConv({
          productId: pId,
          product: { id: pId, title: productRes.data.title, images: productRes.data.images },
          otherUser: productRes.data.seller?.id === uId ? productRes.data.seller : { id: uId, name: 'User' }
        });
      } catch {
        setActiveConv({ productId: pId, product: { id: pId, title: 'Product' }, otherUser: { id: uId, name: 'Seller' } });
      }
    }
    fetchMessages(pId, uId);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    setSending(true);
    try {
      await api.post(`/messages/${activeConv.productId}/${activeConv.otherUser?.id}`, { text });
      setText('');
      fetchMessages(activeConv.productId, activeConv.otherUser?.id, false);
      fetchConversations();
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const getConvImage = (conv) => {
    try {
      const imgs = JSON.parse(conv.product?.images || '[]');
      return imgs[0] ? `https://cpmp.onrender.com${imgs[0]}` : null;
    } catch { return null; }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="page-wrapper" style={{ paddingTop: '70px' }}>
      <div className="container" style={{ padding: '1rem 1.5rem', height: 'calc(100vh - 70px)' }}>
        <div className="chat-layout">
          {/* Sidebar */}
          <div className="chat-sidebar">
            <h3>💬 Messages</h3>
            {loadingConvs ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                No conversations yet
              </div>
            ) : (
              conversations.map((conv, i) => (
                <div
                  key={i}
                  className={`conversation-item ${activeConv?.productId === conv.productId && activeConv?.otherUser?.id === conv.otherUser?.id ? 'active' : ''}`}
                  onClick={() => openThread(conv.productId, conv.otherUser?.id)}
                >
                  <div className="conv-avatar">{getInitials(conv.otherUser?.name)}</div>
                  <div className="conv-info">
                    <div className="conv-name">{conv.otherUser?.name}</div>
                    <div className="conv-preview">{conv.product?.title}</div>
                    <div className="conv-preview" style={{ fontSize: '0.75rem' }}>{conv.lastMessage}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Main chat */}
          <div className="chat-main">
            {!activeConv ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                <div className="chat-header">
                  <div className="conv-avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>{getInitials(activeConv.otherUser?.name)}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{activeConv.otherUser?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Re: {activeConv.product?.title}</div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => navigate(`/products/${activeConv.productId}`)}
                  >View Listing</button>
                </div>

                <div className="chat-messages">
                  {loadingMsgs ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👋</div>
                      <p>Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`chat-bubble ${msg.senderId === user?.id ? 'mine' : 'theirs'}`}>
                        <div>{msg.text}</div>
                        <div className="bubble-time">{new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-bar" onSubmit={sendMessage}>
                  <input
                    className="form-control"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
                    {sending ? '...' : 'Send ➤'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
