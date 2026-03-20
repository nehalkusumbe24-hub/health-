import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send, Bot, User, Sparkles, Leaf, Heart, Dumbbell, Apple, Brain } from 'lucide-react';
import type { ChatMessage } from '@/types';

const SUGGESTED_QUESTIONS = [
  { text: "What is my Dosha type?", icon: Sparkles },
  { text: "Tell me about Ayurvedic diet tips", icon: Apple },
  { text: "What yoga poses help with stress?", icon: Dumbbell },
  { text: "How can I improve my sleep naturally?", icon: Brain },
  { text: "What herbs boost immunity?", icon: Leaf },
  { text: "Tell me about Dinacharya routine", icon: Heart },
];

function renderMarkdown(text: string) {
  // Convert **bold** to <strong>
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert bullet points
  html = html.replace(/^• /gm, '<span class="inline-block w-4">•</span>');
  html = html.replace(/^\d+\. /gm, (match) => `<span class="inline-block w-6 font-semibold">${match}</span>`);
  return html;
}

export default function ChatPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.id) {
      loadMessages();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!profile?.id) return;
    try {
      const data = await api.chatMessages.listByUser(profile.id);
      setMessages(data.reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSend = async (messageOverride?: string) => {
    const userMessage = (messageOverride || input).trim();
    if (!userMessage || !profile?.id) return;

    setInput('');
    setLoading(true);

    try {
      const savedMessage = await api.chatMessages.create({
        user_id: profile.id,
        message: userMessage,
      });

      setMessages(prev => [...prev, savedMessage]);

      const conversationHistory = messages.slice(-5).map(msg => ({
        role: 'user' as const,
        content: msg.message,
      }));

      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/functions/v1/ayurvedic-chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: userMessage, conversationHistory })
      });

      const text = await response.text();
      if (!response.ok) {
        let errorMsg = 'Failed to get response from AI assistant';
        if (text) {
          try {
            const errorBody = JSON.parse(text);
            errorMsg = errorBody.error || errorBody.message || errorMsg;
          } catch {
            errorMsg = text;
          }
        }
        throw new Error(errorMsg);
      }

      const data = text ? JSON.parse(text) : {};
      const aiResponse = data?.response || data?.message || 'No response received';
      await api.chatMessages.updateResponse(savedMessage.id, aiResponse);

      setMessages(prev =>
        prev.map(msg =>
          msg.id === savedMessage.id ? { ...msg, response: aiResponse } : msg
        )
      );

      if (data?.shouldEscalate) {
        toast.info('This query may require doctor consultation. Consider booking an appointment.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <Card className="h-full flex flex-col relative overflow-hidden glass-effect border-primary/20">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7cf99d63-fce9-4d84-b3c0-af02c60926ca.jpg" 
            alt="Wellness spa background"
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader className="relative z-10 border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}>
              <Bot className="h-4 w-4 text-white" />
            </div>
            AI Ayurvedic Assistant
            <span className="text-xs font-normal ml-auto text-muted-foreground">Powered by Ayurvedic Knowledge Base</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 relative z-10 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 scroll-smooth" ref={scrollRef}>
            <div className="space-y-4 py-4">
              {messages.length === 0 && (
                <div className="py-6 space-y-6">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2))' }}>
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">🙏 Namaste!</h3>
                    <p className="text-muted-foreground text-sm">
                      I'm your Ayurvedic AI assistant. Ask me about doshas, diet, yoga, herbs, or any wellness topic!
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center">Try asking about:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SUGGESTED_QUESTIONS.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(q.text)}
                          disabled={loading}
                          className="flex items-center gap-2 p-3 rounded-lg border text-left hover:bg-accent hover:shadow-sm transition-all duration-200 text-sm group"
                        >
                          <q.icon className="h-4 w-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">{q.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 bg-primary text-primary-foreground rounded-xl rounded-tl-none p-3">
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>

                  {msg.response && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="flex-1 bg-accent rounded-xl rounded-tl-none p-3">
                        <p
                          className="text-sm whitespace-pre-wrap leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.response) }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="flex-1 bg-accent rounded-xl rounded-tl-none p-3">
                    <div className="flex gap-1.5 items-center h-5">
                      <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t p-4 glass-effect relative z-10">
            {/* Quick suggestion chips when there are messages */}
            {messages.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {["Vata dosha tips", "Best herbs", "Sleep naturally", "Yoga for stress"].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    disabled={loading}
                    className="text-xs px-3 py-1.5 border rounded-full whitespace-nowrap hover:bg-accent transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Ayurveda, diet, symptoms, herbs..."
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
