import React, { useState } from 'react';
import { Send, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="relative flex items-center gap-2 bg-card border border-border rounded-xl p-1.5 shadow-xl shadow-black/20 focus-within:border-primary/30 transition-all duration-200"
    >
      <div className="pl-3 text-muted-foreground flex items-center justify-center">
        <Brain className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question about your documents..."
        disabled={disabled}
        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 outline-none disabled:opacity-50 text-foreground placeholder:text-muted-foreground"
      />
      <Button 
        type="submit" 
        size="icon" 
        className="rounded-lg h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
        disabled={!input.trim() || disabled}
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};
