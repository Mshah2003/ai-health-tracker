import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, Message, UserProfile, AppState } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ProfileSetup } from './components/ProfileSetup';
// import { ApiKeySetup } from './components/ApiKeySetup';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { generateResponse, generateReport, initializeGemini } from './services/geminiService';
import { generatePDFReport } from './services/pdfService';


function App() {
  const [appState, setAppState] = useLocalStorage<AppState>('healthtracker-app', {
    sessions: [],
    activeSessionId: null,
    theme: 'light',
    userProfile: {}
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);

  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  useEffect(() => {
    if (apiKey) {
      const configured = initializeGemini(apiKey);
      setIsApiKeyConfigured(configured);
    } else {
      setIsApiKeyConfigured(false);
    }
  }, [apiKey]);
  
    useEffect(() => {
    const { age, gender } = appState.userProfile || {};
    if (!age || !gender) {
      setShowProfileSetup(true);
    }
  }, [appState.userProfile]);

  // Apply theme
  useEffect(() => {
    if (appState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.theme]);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Health Chat',
      condition: 'General Health',
      messages: [],
      userProfile: appState.userProfile,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAppState(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      activeSessionId: newSession.id
    }));
  }, [appState.userProfile, setAppState]);

  const selectSession = useCallback((sessionId: string) => {
    setAppState(prev => ({ ...prev, activeSessionId: sessionId }));
  }, [setAppState]);

  const sendMessage = useCallback(async (content: string, isVoice = false) => {
    if (!appState.activeSessionId || !isApiKeyConfigured) return;

    const activeSession = appState.sessions.find(s => s.id === appState.activeSessionId);
    if (!activeSession) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
      isVoice
    };

    setAppState(prev => {
      const updatedSessions = prev.sessions.map(session => 
        session.id === appState.activeSessionId
          ? { ...session, messages: [...session.messages, userMessage], updatedAt: new Date() }
          : session
      );
      return { ...prev, sessions: updatedSessions };
    });

    setIsLoading(true);

    try {
      const allMessages = [...activeSession.messages, userMessage];
      const response = await generateResponse(
        allMessages,
        activeSession.userProfile || appState.userProfile,
        activeSession.condition
      );

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setAppState(prev => {
        const updatedSessions = prev.sessions.map(session => 
          session.id === appState.activeSessionId
            ? { ...session, messages: [...session.messages, userMessage, assistantMessage], updatedAt: new Date() }
            : session
        );
        return { ...prev, sessions: updatedSessions };
      });
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key configuration and try again.`,
        timestamp: new Date()
      };

      setAppState(prev => {
        const updatedSessions = prev.sessions.map(session => 
          session.id === appState.activeSessionId
            ? { ...session, messages: [...(session.messages.find(m => m.id === userMessage.id) ? session.messages : [...session.messages, userMessage]), errorMessage], updatedAt: new Date() }
            : session
        );
        return { ...prev, sessions: updatedSessions };
      });
    } finally {
      setIsLoading(false);
    }
  }, [appState.activeSessionId, appState.sessions, appState.userProfile, isApiKeyConfigured, setAppState]);

  const handleGenerateReport = useCallback(async (sessionId?: string) => {
    const targetSessionId = sessionId || appState.activeSessionId;
    if (!targetSessionId || !isApiKeyConfigured) {
      alert('Please ensure you have an active chat session and valid API key.');
      return;
    }

    const session = appState.sessions.find(s => s.id === targetSessionId);
    if (!session || session.messages.length === 0) {
      alert('No messages found in this chat session to generate a report.');
      return;
    }

    try {
      setIsLoading(true);
      const reportContent = await generateReport(
        session.messages,
        session.userProfile || appState.userProfile,
        session.condition
      );
      await generatePDFReport(session, reportContent);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Error generating report: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [appState.activeSessionId, appState.sessions, appState.userProfile, isApiKeyConfigured]);

  const deleteSession = useCallback((sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      setAppState(prev => {
        const updatedSessions = prev.sessions.filter(s => s.id !== sessionId);
        const newActiveId = prev.activeSessionId === sessionId 
          ? (updatedSessions.length > 0 ? updatedSessions[0].id : null)
          : prev.activeSessionId;
        
        return {
          ...prev,
          sessions: updatedSessions,
          activeSessionId: newActiveId
        };
      });
    }
  }, [setAppState]);

  // const toggleTheme = useCallback(() => {
  //   setAppState(prev => ({
  //     ...prev,
  //     theme: prev.theme === 'light' ? 'dark' : 'light'
  //   }));
  // }, [setAppState]);

  const updateProfile = useCallback((profile: UserProfile) => {
    setAppState(prev => ({ ...prev, userProfile: profile }));
    setShowProfileSetup(false);
  }, [setAppState]);

  const skipProfile = useCallback(() => {
    setAppState(prev => ({ ...prev, userProfile: {} }));
    setShowProfileSetup(false);
  }, [setAppState]);

  // const handleApiKeySet = (newApiKey: string) => {
  //   setApiKey(newApiKey)
  //   const configured = initializeGemini(newApiKey)
  //   setIsApiKeyConfigured(configured)
  // }



  const activeSession = appState.sessions.find(s => s.id === appState.activeSessionId);

  // Show API key setup if not configured
  // if (!apiKey || !isApiKeyConfigured) {
  //   return "You need to set up your API key.";
  // }

  // Show profile setup if needed
  if (showProfileSetup) {
    return (
      <ProfileSetup 
        onComplete={updateProfile}
        onSkip={skipProfile}
        initialProfile={appState.userProfile}
        isUpdate={Object.keys(appState.userProfile).length > 0}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        sessions={appState.sessions}
        activeSessionId={appState.activeSessionId}
        userProfile={appState.userProfile}
        onNewSession={createNewSession}
        onSelectSession={selectSession}
        onEditProfile={() => setShowProfileSetup(true)}
        onGenerateReport={handleGenerateReport}
        onDeleteSession={deleteSession}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <ChatInterface
        session={activeSession || null}
        onSendMessage={sendMessage}
        isLoading={isLoading}
        onGenerateReport={() => handleGenerateReport()}
      />
    </div>
  );
}

export default App;