import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, FileSearch } from 'lucide-react';
import type { Message } from '@/types';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: Message;
  onShowSources: (sources: any[]) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onShowSources }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex items-start gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center shrink-0 border
        ${isAssistant ? 'bg-card border-border text-primary' : 'bg-muted border-border text-muted-foreground'}
      `}>
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      
      <div className={`flex flex-col max-w-[85%] ${isAssistant ? 'items-start' : 'items-end'}`}>
        <div className={`
          px-5 py-3 rounded-xl text-sm leading-relaxed border
          ${isAssistant 
            ? 'bg-card border-border rounded-tl-none text-foreground' 
            : 'bg-muted/50 border-border rounded-tr-none text-foreground'}
        `}>
          <div className="markdown-content">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        
        {isAssistant && message.sources && message.sources.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-[10px] font-semibold uppercase tracking-wider gap-2 h-7 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={() => onShowSources(message.sources!)}
          >
            <FileSearch className="w-3.5 h-3.5" />
            View {message.sources.length} Sources
          </Button>
        )}
      </div>
    </div>
  );
};
