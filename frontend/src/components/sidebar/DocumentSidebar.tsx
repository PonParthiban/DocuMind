import React, { useState } from 'react';
import { UploadZone } from './UploadZone';
import { DocumentList } from './DocumentList';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Document } from '@/types';

interface DocumentSidebarProps {
  documents: Document[];
  onRefresh: () => void;
  apiBaseUrl: string;
}

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({ 
  documents, 
  onRefresh, 
  apiBaseUrl 
}) => {
  const [isReindexing, setIsReindexing] = useState(false);

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      await axios.post(`${apiBaseUrl}/reindex`);
      toast.success('Index rebuilt successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to rebuild index');
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <aside className="w-80 flex flex-col border-r border-border bg-[#111111]">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center border border-border">
          <Brain className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">DocuMind</h1>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold truncate">
            Intelligent Document Assistant
          </p>
        </div>
      </div>

      <div className="px-6 py-2">
        <UploadZone onUploadSuccess={onRefresh} apiBaseUrl={apiBaseUrl} />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <FileText className="w-4 h-4 text-primary" />
            Documents ({documents.length})
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={onRefresh}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <DocumentList 
            documents={documents} 
            onRefresh={onRefresh} 
            apiBaseUrl={apiBaseUrl} 
          />
        </div>
      </div>

      <div className="p-6 border-t border-border bg-card">
        <Button 
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold rounded-lg" 
          onClick={handleReindex}
          disabled={isReindexing}
        >
          <RefreshCw className={cn("w-4 h-4", isReindexing && "animate-spin")} />
          {isReindexing ? 'Reindexing...' : 'Rebuild Index'}
        </Button>
      </div>
    </aside>
  );
};
