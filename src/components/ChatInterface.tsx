import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatSession, UserProfile } from '../types';
import { 
  Send, 
  Mic, 
  MicOff, 
  Loader2, 
  Heart, 
  Activity, 
  AlertCircle,
  Download,
  Bot,
  User as UserIcon
} from 'lucide-react';
// import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  session: ChatSession | null;
  onSendMessage: (content: string, isVoice?: boolean) => Promise<void>;
  isLoading: boolean;
  onGenerateReport: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  session,
  onSendMessage,
  isLoading,
  onGenerateReport
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // const { isRecording, startRecording, stopRecording } = useVoiceRecording();
  const [isListening, setIsListening] = useState(false);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await onSendMessage(message);
  };

const handleVoiceToggle = () => {
    if (isListening) return;
  
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
  
    setIsListening(true);
  
    const timeout = setTimeout(() => recognition.stop(), 100000);
  
    recognition.onresult = (event: any) => {
      clearTimeout(timeout);
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' : '') + transcript);
      setIsListening(false);
    };
  
    recognition.onerror = () => {
      clearTimeout(timeout);
      setIsListening(false);
    };
  
    recognition.onend = () => {
      clearTimeout(timeout);
      setIsListening(false);
    };
  
    recognition.start();
  };
  

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to HealthTracker AI
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Start a new chat to begin tracking your symptoms with AI assistance. 
            Each conversation is tailored to your specific health conditions and profile.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
              <Heart className="w-4 h-4" />
              <span>Personalized tracking</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
              <Activity className="w-4 h-4" />
              <span>AI insights</span>
            </div>
            <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
              <Download className="w-4 h-4" />
              <span>PDF reports</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
              <Mic className="w-4 h-4" />
              <span>Voice input</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${
              session.condition?.toLowerCase().includes('heart') ? 'from-red-400 to-pink-400' :
              session.condition?.toLowerCase().includes('diabetes') ? 'from-blue-400 to-indigo-400' :
              'from-teal-400 to-purple-400'
            } rounded-lg flex items-center justify-center`}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {session.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {session.messages.length} messages • Last updated {format(new Date(session.updatedAt), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
          {session.messages.length > 0 && (
            <button
              onClick={onGenerateReport}
              title="Generate Report"
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg hover:from-teal-600 hover:to-purple-600 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ready to help track your symptoms
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Tell me about how you're feeling today, any symptoms you're experiencing, 
              or questions about your health condition. I'm here to help you keep detailed records.
            </p>
          </div>
        ) : (
          session.messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-gradient-to-r from-teal-500 to-blue-500'
              }`}>
                {message.role === 'user' ? (
                  <UserIcon className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`flex-1 max-w-3xl ${
                message.role === 'user' ? 'text-right' : ''
              }`}>
                <div className={`inline-block p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.isVoice && (
                    <div className="flex items-center space-x-1 mt-2 opacity-75">
                      <Mic className="w-3 h-3" />
                      <span className="text-xs">Voice message</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {format(new Date(message.timestamp), 'h:mm a')}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-gray-500 dark:text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms, how you're feeling, or ask a health-related question..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors max-h-32"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl transition-all duration-200 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-xl hover:from-teal-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <div className="flex items-center justify-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-3 h-3 mr-1" />
          For medical emergencies, contact emergency services immediately
        </div>
      </div>
    </div>
  );
};