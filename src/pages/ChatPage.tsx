import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/db/api';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Send, Bot, User } from 'lucide-react';
import type { ChatMessage } from '@/types';

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

  const handleSend = async () => {
    if (!input.trim() || !profile?.id) return;

    const userMessage = input.trim();
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

      const { data, error } = await supabase.functions.invoke('ayurvedic-chatbot', {
        body: { message: userMessage, conversationHistory },
      });

      if (error) {
        const errorMsg = await error?.context?.text?.();
        console.error('Chatbot error:', errorMsg || error?.message);
        toast.error('Failed to get response from AI assistant');
        return;
      }

      const aiResponse = data?.response || 'No response received';
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
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)]">
      <Card className="h-full flex flex-col relative overflow-hidden glass-effect border-primary/20">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7cf99d63-fce9-4d84-b3c0-af02c60926ca.jpg" 
            alt="Wellness spa background"
            className="w-full h-full object-cover"
          />
        </div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Ayurvedic Assistant
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 relative z-10">
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            <div className="space-y-4 py-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p>Ask me anything about Ayurveda, health, diet, or wellness!</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 bg-accent rounded-lg p-3">
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>

                  {msg.response && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="flex-1 bg-secondary/10 rounded-lg p-3">
                        <p className="text-sm whitespace-pre-wrap">{msg.response}</p>
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
                  <div className="flex-1 bg-secondary/10 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-secondary animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-secondary animate-bounce delay-100" />
                      <div className="h-2 w-2 rounded-full bg-secondary animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4 glass-effect relative z-10">
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
                placeholder="Ask about Ayurveda, diet, symptoms..."
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
