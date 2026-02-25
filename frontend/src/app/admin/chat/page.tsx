'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { api } from '@/lib/axios';
import { createChatSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { HiChat, HiUser, HiPhotograph } from 'react-icons/hi';

type Seller = { id: string; name: string; email: string; lastMessage?: { content: string; createdAt: string } };
type Message = { id: string; content: string; imageUrl?: string | null; senderId: string; receiverId?: string; sender: { name: string }; createdAt: string };

export default function AdminChatPage() {
  const [sellersRaw, setSellersRaw] = useState<Seller[]>([]);
  const [selected, setSelected] = useState<Seller | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof createChatSocket>>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sellers = useMemo(() => {
    const seen = new Set<string>();
    return sellersRaw.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [sellersRaw]);

  useEffect(() => {
    api
      .get('/admin/chat/sellers')
      .then((r) => setSellersRaw(r.data?.data ?? []))
      .catch(() => toast.error('Could not load sellers'))
      .finally(() => setFetching(false));
  }, []);

  const fetchMessages = () => {
    if (!selected) return;
    api.get(`/admin/chat/messages/${selected.id}`).then((r) => setMessages(r.data?.data?.messages ?? [])).catch(() => {});
  };

  useEffect(() => {
    if (selected) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selected?.id]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    const socket = createChatSocket(token);
    if (!socket) return;
    socketRef.current = socket;
    socket.on('chat:message', (msg: Message) => {
      if (selected && (msg.senderId === selected.id || msg.receiverId === selected.id)) {
        setMessages((p) => [...p, msg]);
      }
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selected?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !selected) return;
    setLoading(true);
    setInput('');
    try {
      const res = await api.post(`/admin/chat/messages/${selected.id}`, { content: content || '' });
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
    if (!file || !selected) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const { data } = await api.post('/upload', fd);
      const url = data?.urls?.[0];
      if (url) {
        setLoading(true);
        try {
          const res = await api.post(`/admin/chat/messages/${selected.id}`, { content: '', imageUrl: url });
          setMessages((p) => [...p, res.data.data]);
        } catch {
          toast.error('Failed to send image');
        } finally {
          setLoading(false);
        }
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (fetching) return <div className="flex items-center justify-center min-h-[400px] text-gray-500">Loading...</div>;

  return (
    <div className="w-full max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <HiChat className="w-7 h-7 text-amber-600" />
        Chat with Sellers
      </h1>
      <div className="flex gap-4 bg-white rounded-xl shadow-sm border overflow-hidden" style={{ minHeight: '560px' }}>
        <aside className="w-80 shrink-0 border-r flex flex-col">
          <div className="p-3 border-b bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sellers</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sellers.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No sellers yet</div>
            ) : (
              sellers.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`w-full p-4 text-left flex items-start gap-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${
                    selected?.id === s.id ? 'bg-amber-50/80' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <HiUser className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.email}</p>
                    {s.lastMessage && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{s.lastMessage.content}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              <header className="p-4 border-b bg-gray-50 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <HiUser className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selected.name}</p>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                <div className="space-y-2">
                  {messages.map((m) => {
                    const isAdmin = m.senderId !== selected.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isAdmin
                              ? 'bg-amber-500 text-white rounded-br-md'
                              : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                          }`}
                        >
                          {!isAdmin && <p className="text-xs font-medium text-amber-600 mb-0.5">{m.sender?.name}</p>}
                          {m.imageUrl && (
                            <a href={m.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
                              <img src={m.imageUrl} alt="Shared" className="max-w-full max-h-48 rounded-lg object-contain" />
                            </a>
                          )}
                          {m.content && <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>}
                          <p className={`text-[11px] mt-1 ${isAdmin ? 'text-amber-100' : 'text-gray-400'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <form onSubmit={send} className="p-4 border-t bg-white shrink-0">
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <HiChat className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium">Select a seller to start chatting</p>
              <p className="text-sm">Choose from the list on the left</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
