import React, { useState , useEffect } from 'react';
import { ChatSession, UserProfile } from '../types';
import { 
  Plus, 
  Stethoscope,
  Activity,
  User,
  Download,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  userProfile: UserProfile;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onEditProfile: () => void;
  onGenerateReport: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  userProfile,
  onNewSession,
  onSelectSession,
  onEditProfile,
  onGenerateReport,
  onDeleteSession,
  isCollapsed,
  onToggleCollapse
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    // Collapse only once on mount if mobile
    if (mobile && !isCollapsed) {
      setTimeout(() => {
        onToggleCollapse();
      }, 0);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 
      ${isMobile 
        ? (isCollapsed ? 'w-16' : 'fixed inset-0 w-full z-50') 
        : (isCollapsed ? 'w-16' : 'w-80')
      }`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">HealthTracker</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Symptom Assistant</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={() => {
            onNewSession();
            if (isMobile) onToggleCollapse();
          }}
          className={`w-full bg-gradient-to-r from-teal-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-teal-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2 ${
            isCollapsed ? 'px-1' : ''
          }`}
          title={isCollapsed ? 'New Chat' : ''}
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-4 pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Recent Chats
            </h3>
          </div>
        )}
        <div className="space-y-1 px-2">
          {sessions.map((session) => (
            <div key={session.id} className="group relative">
              <button
              onClick={() => {
                onSelectSession(session.id);
                if (isMobile) onToggleCollapse();
              }}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  activeSessionId === session.id 
                    ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800' 
                    : ''
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? session.title : ''}
              >
                <div className={`w-8 h-8 bg-gradient-to-r ${
                  session.condition?.toLowerCase().includes('heart') ? 'from-red-400 to-pink-400' :
                  session.condition?.toLowerCase().includes('diabetes') ? 'from-blue-400 to-indigo-400' :
                  'from-teal-400 to-purple-400'
                } rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Activity className="w-4 h-4 text-white" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {session.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {format(new Date(session.updatedAt), 'MMM d')} • {session.messages.length} messages
                    </p>
                  </div>
                )}
              </button>
              {!isCollapsed && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateReport(session.id);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-400 hover:text-gray-600"
                    title="Generate Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-600"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      {/* <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`w-full flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Settings' : ''}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span>Settings</span>}
        </button> */}

          <div className="space-y-2 px-2 border-x-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={onEditProfile}
              className={`w-full flex items-center p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                isCollapsed ? 'justify-around' : 'justify-center'
              }`}
            >
              <User className="w-5 h-5" />
              {!isCollapsed && <span>Edit Profile</span>}
            </button>


          </div>
      

        {!isCollapsed && userProfile.age && (
          <div className="text-xs text-gray-500 dark:text-gray-400 p-2">
            Age: {userProfile.age} • Gender: {userProfile.gender || 'Not set'}
          </div>
        )}
      </div>
    // </div>
  );
};