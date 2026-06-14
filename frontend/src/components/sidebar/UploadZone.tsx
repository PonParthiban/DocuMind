import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface UploadZoneProps {
  onUploadSuccess: () => void;
  apiBaseUrl: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess, apiBaseUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    let hasPdf = false;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type === 'application/pdf') {
        formData.append('files', files[i]);
        hasPdf = true;
      }
    }

    if (!hasPdf) {
      toast.error('Please upload PDF files only');
      return;
    }

    setIsUploading(true);
    try {
      await axios.post(`${apiBaseUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/multipart-form-data' }
      });
      toast.success('Documents uploaded and indexed');
      onUploadSuccess();
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-xl p-6
        flex flex-col items-center justify-center gap-2
        transition-all duration-200
        ${isDragOver 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-border hover:border-primary/50 hover:bg-primary/5'}
      `}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleUpload(e.dataTransfer.files);
      }}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        id="fileInput"
        type="file"
        multiple
        accept=".pdf"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center
        ${isUploading ? 'bg-muted' : 'bg-primary/10 text-primary group-hover:scale-110 transition-transform'}
      `}>
        {isUploading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Upload className="w-6 h-6" />
        )}
      </div>
      
      <div className="text-center">
        <p className="text-sm font-semibold">
          {isUploading ? 'Uploading...' : 'Upload Documents'}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
          Drag & Drop or click to browse
        </p>
      </div>
    </div>
  );
};
