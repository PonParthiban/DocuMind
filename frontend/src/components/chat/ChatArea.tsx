import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import type { Message } from '@/types';
import { Sparkles, Brain } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onShowSources: (sources: any[]) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  onShowSources
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const suggestions = [
    "Summarize the key points of this document.",
    "What are the main findings or topics discussed?",
    "Are there any important dates, milestones, or deadlines?",
    "Identify any potential risks or key obligations mentioned."
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.03),transparent_50%)] pointer-events-none" />
      
      <header className="px-8 py-4 border-b border-border flex items-center justify-between bg-black/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">DocuMind Workspace</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">System Active</span>
            </div>
          </div>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg, i) => (
            <MessageBubble 
              key={i} 
              message={msg} 
              onShowSources={onShowSources}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          )}
          
          {messages.length === 1 && !isLoading && (
            <div className="pt-10">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" />
                Suggested Inquiries
              </p>
              <div className="grid grid-cols-2 gap-3">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(s)}
                    className="text-left p-4 rounded-xl border border-border bg-card hover:border-border/80 hover:bg-muted/30 transition-all text-xs font-medium leading-relaxed group text-muted-foreground hover:text-foreground"
                  >
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-6 bg-gradient-to-t from-background to-transparent">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={onSendMessage} disabled={isLoading} />
          <p className="text-[10px] text-center text-muted-foreground mt-4">
            DocuMind analyzes documents to provide summaries and answers. Verify critical information independently.
          </p>
        </div>
      </div>
    </div>
  );
};
