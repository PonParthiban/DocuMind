import React from 'react';
import { FileText, Trash2, Calendar, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import type { Document } from '@/types';

interface DocumentListProps {
  documents: Document[];
  onRefresh: () => void;
  apiBaseUrl: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  onRefresh, 
  apiBaseUrl 
}) => {
  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(`${apiBaseUrl}/documents/${filename}`);
      toast.success('Document deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString();
  };

  if (documents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
        <FileText className="w-10 h-10 mb-2" />
        <p className="text-xs font-medium">No documents uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      {documents.map((doc) => (
        <div 
          key={doc.id}
          className="group relative p-3 rounded-lg border border-border bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate pr-6" title={doc.name}>
                {doc.name}
              </p>
              <div className="flex items-center gap-3 mt-1.5 opacity-60">
                <div className="flex items-center gap-1 text-[10px]">
                  <Calendar className="w-3 h-3" />
                  {formatDate(doc.upload_date)}
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <HardDrive className="w-3 h-3" />
                  {formatSize(doc.size)}
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-opacity"
            onClick={() => handleDelete(doc.name)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
};
