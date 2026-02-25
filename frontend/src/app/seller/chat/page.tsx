'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/axios';
import { createChatSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { HiChat, HiUser, HiPhotograph } from 'react-icons/hi';

type Message = { id: string; content: string; imageUrl?: string | null; senderId: string; sender: { name: string }; createdAt: string; receiverId?: string };

const displayName = (name: string | undefined) => (name?.toLowerCase() === 'admin' ? 'Customer support' : name) || 'Customer support';

export default function SellerChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{ id: string; name: string } | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = () => {
    api.get('/seller/chat/messages').then((res) => {
      setMessages(res.data?.data?.messages ?? []);
    }).catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      api.get('/seller/chat/admin'),
      api.get('/seller/chat/messages'),
    ])
      .then(([adminRes, msgRes]) => {
        setAdminId(adminRes.data?.data?.adminId ?? null);
        setOtherUser(adminRes.data?.data?.admin ?? msgRes.data?.data?.otherUser ?? null);
        setMessages(msgRes.data?.data?.messages ?? []);
      })
      .catch(() => toast.error('Could not load chat'))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (!fetching) {
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [fetching]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token || !adminId) return;
    const socket = createChatSocket(token);
    if (!socket) return;
    socket.on('chat:message', (msg: Message) => setMessages((p) => [...p, msg]));
    socket.on('chat:error', (e: { message?: string }) => toast.error(e?.message || 'Chat error'));
    return () => {
      socket.disconnect();
    };
  }, [adminId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setLoading(true);
    setInput('');
    try {
      const res = await api.post('/seller/chat/messages', { content });
      setMessages((p) => [...p, res.data.data]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to send. Run database/add-chat-messages.sql in MySQL.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const { data } = await api.post('/upload', fd);
      const url = data?.urls?.[0];
      if (url) {
        setLoading(true);
        try {
          const res = await api.post('/seller/chat/messages', { content: '', imageUrl: url });
          setMessages((p) => [...p, res.data.data]);
        } catch {
          toast.error('Failed to send image');
        } finally {
          setLoading(false);
        }
      } else {
        toast.error('Upload failed');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (fetching) return <div className="flex items-center justify-center min-h-[400px] text-gray-500">Loading chat...</div>;

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <HiChat className="w-7 h-7 text-amber-600" />
        Chat with Us
      </h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
        <header className="p-4 border-b bg-gray-50 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <HiUser className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{displayName(otherUser?.name)}</p>
            <p className="text-sm text-gray-500">{otherUser ? 'Online' : 'Connecting...'}</p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <div className="space-y-2">
            {messages.map((m) => {
              const isMe = !!adminId && m.senderId !== adminId;
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMe ? 'bg-amber-500 text-white rounded-br-md' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                    }`}
                  >
                    {!isMe && <p className="text-xs font-medium text-amber-600 mb-0.5">{displayName(m.sender?.name)}</p>}
                    {m.imageUrl && (
                      <a href={m.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
                        <img src={m.imageUrl} alt="Shared" className="max-w-full max-h-48 rounded-lg object-contain" />
                      </a>
                    )}
                    {m.content && <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>}
                    <p className={`text-[11px] mt-1 ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <form onSubmit={send} className="p-4 border-t shrink-0">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploading}
              className="p-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-50 shrink-0"
              title="Upload image"
            >
              <HiPhotograph className="w-5 h-5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or upload image..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none min-w-0"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || uploading}
              className="px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
            >
              {loading ? 'Sending...' : uploading ? 'Uploading...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
