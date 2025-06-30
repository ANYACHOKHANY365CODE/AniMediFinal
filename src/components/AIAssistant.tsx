import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Paperclip, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePet } from '../contexts/PetContext';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const { user, profile } = useAuth();
  const { activePet } = usePet();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [petRecords, setPetRecords] = useState<any[]>([]);
  const [petReminders, setPetReminders] = useState<any[]>([]);
  const [petLogs, setPetLogs] = useState<any[]>([]);
  const [fullPetRow, setFullPetRow] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    if (!isOpen || !user || !activePet) return;
    setIsLoading(true);
    try {
        const response = await fetch(`http://localhost:3000/api/chat/history?user_id=${user.id}&pet_id=${activePet.id}`);
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        setMessages(data.history || []);
    } catch (error) {
        console.error("Error fetching chat history:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [isOpen, activePet]); // Refetch when modal opens or active pet changes

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch all context data when chat opens or pet changes
  useEffect(() => {
    const fetchContextData = async () => {
      if (!isOpen || !activePet) return;
      try {
        // Fetch full pet row
        const { data: petRows } = await supabase
          .from('pets')
          .select('*')
          .eq('id', activePet.id)
          .limit(1);
        const fullPet = petRows && petRows.length > 0 ? petRows[0] : activePet;
        // Medical Records
        const { data: records } = await supabase
          .from('medical_records')
          .select('*')
          .eq('pet_id', activePet.id)
          .order('date', { ascending: false });
        setPetRecords(records || []);
        // Reminders
        const { data: reminders } = await supabase
          .from('reminders')
          .select('*')
          .eq('pet_id', activePet.id)
          .order('due_date', { ascending: false });
        setPetReminders(reminders || []);
        // Logs
        const { data: logs } = await supabase
          .from('logs')
          .select('*')
          .eq('pet_id', activePet.id)
          .order('created_at', { ascending: false });
        setPetLogs(logs || []);
        // Store full pet row in state for context
        setFullPetRow(fullPet);
      } catch (err) {
        console.error('Error fetching pet context:', err);
      }
    };
    fetchContextData();
  }, [isOpen, activePet]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Accept images and PDFs
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setAttachment(file);
      } else {
        alert('Please upload an image or PDF file.');
      }
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;
    const userMessageText = input.trim();
    const currentAttachment = attachment;
    setMessages(prev => [...prev, { role: 'user', content: userMessageText }]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);
    let attachmentData: string | null = null;
    if (currentAttachment) {
      attachmentData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(currentAttachment);
      });
    }
    // Build full context
    const contextData = {
      user: { id: user?.id, name: profile?.name },
      pet: fullPetRow ? {
        id: fullPetRow.id,
        name: fullPetRow.name,
        species: fullPetRow.species,
        breed: fullPetRow.breed,
        age: fullPetRow.age,
        gender: fullPetRow.gender,
        color: fullPetRow.color,
        weight: fullPetRow.weight,
        notes: fullPetRow.notes,
      } : null,
      reminders: petReminders,
      medical_records: petRecords,
      logs: petLogs,
    };
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          context: contextData,
          attachment: attachmentData,
        }),
      });
      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length-1].role === 'user') {
              newMessages.pop();
          }
          return [...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant Chat"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#8B5CF6',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
          zIndex: 9999,
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span style={{ fontSize: '24px' }}>🐾</span>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '150px',
            right: '20px',
            width: '100%',
            maxWidth: '400px',
            height: '500px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={24} color="#8B5CF6" />
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>
                AI Assistant
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Assistant Chat"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                backgroundColor: '#F3F4F6',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} color="#374151" />
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#6B7280',
                marginTop: '40px',
                padding: '0 20px'
              }}>
                <Bot size={40} color="#8B5CF6" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Hi! I'm your AI assistant. Ask me anything about pet healthcare or how to use AniMedi.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  <div style={{
                    backgroundColor: message.role === 'user' ? '#8B5CF6' : '#F3F4F6',
                    color: message.role === 'user' ? '#FFFFFF' : '#374151',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    borderBottomRightRadius: message.role === 'user' ? '4px' : '12px',
                    borderBottomLeftRadius: message.role === 'assistant' ? '4px' : '12px',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {message.role === 'assistant' ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                padding: '12px 16px',
                borderRadius: '12px',
                borderBottomLeftRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Loader2 className="animate-spin" size={16} />
                Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            borderTop: '1px solid #E5E7EB',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {attachment && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px',
                backgroundColor: '#F3F4F6',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '12px', color: '#374151' }}>{attachment.name}</span>
                <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <XCircle size={16} color="#6B7280" />
                </button>
              </div>
            )}
            <div style={{
                display: 'flex',
                gap: '8px'
            }}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/*,application/pdf"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#F3F4F6',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <Paperclip size={20} color="#6B7280" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!input.trim() && !attachment) || isLoading}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: (input.trim() || attachment) && !isLoading ? '#8B5CF6' : '#E5E7EB',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (input.trim() || attachment) && !isLoading ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Send size={20} color={(input.trim() || attachment) && !isLoading ? '#FFFFFF' : '#9CA3AF'} />
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant; 