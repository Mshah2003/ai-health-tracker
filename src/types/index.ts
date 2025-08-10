export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  condition?: string;
  messages: Message[];
  userProfile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  conditions?: string[];
}

export interface AppState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  theme: 'light' | 'dark';
  userProfile: UserProfile;
}