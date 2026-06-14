import React from 'react';
import { X, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Source {
  file: string;
  page: string;
  score: number;
  text: string;
}

interface SourcePanelProps {
  sources: Source[];
  onClose: () => void;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({ sources, onClose }) => {
  return (
    <div className="w-96 border-l border-border bg-[#111111] flex flex-col animate-in slide-in-from-right duration-300">
      <header className="px-6 py-6 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground">Sources & References</h2>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">Retrieved Knowledge</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50">
          <X className="w-4 h-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-6">
          {sources.map((source, i) => (
            <div key={i} className="space-y-3 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center text-primary">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold truncate max-w-[140px] text-foreground" title={source.file}>
                      {source.file}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                      Page {source.page}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border text-[9px] font-semibold">
                  <Award className="w-3 h-3" />
                  <span>{(source.score * 100).toFixed(0)}% Score</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full" />
                <p className="pl-4 text-xs leading-relaxed text-muted-foreground italic">
                  "{source.text}"
                </p>
              </div>
              
              <div className="h-[1px] w-full bg-border/30 mt-6" />
            </div>
          ))}
          
          {sources.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center opacity-30">
              <FileText className="w-8 h-8 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No context retrieved</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
