import { useState, useEffect } from 'react';
import { DocumentSidebar } from './components/sidebar/DocumentSidebar';
import { ChatArea } from './components/chat/ChatArea';
import { SourcePanel } from './components/sources/SourcePanel';
import { Toaster } from 'sonner';
import axios from 'axios';
import type { Message, Document } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function App() {
  console.log("App Rendering...");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm DocuMind. Upload your documents and ask questions to extract insights, summaries, and answers."
    }
  ]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedSources, setSelectedSources] = useState<any[]>([]);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/query`, { question: message });
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.data.sources && response.data.sources.length > 0) {
        setSelectedSources(response.data.sources);
        setIsSourcePanelOpen(true);
      }
    } catch (error) {
      console.error('Error querying RAG:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <DocumentSidebar 
        documents={documents} 
        onRefresh={fetchDocuments} 
        apiBaseUrl={API_BASE_URL}
      />
      
      <main className="flex-1 flex flex-col relative border-r border-border/50">
        <ChatArea 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          onShowSources={(sources) => {
            setSelectedSources(sources);
            setIsSourcePanelOpen(true);
          }}
        />
      </main>

      {isSourcePanelOpen && (
        <SourcePanel 
          sources={selectedSources} 
          onClose={() => setIsSourcePanelOpen(false)} 
        />
      )}
      
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
