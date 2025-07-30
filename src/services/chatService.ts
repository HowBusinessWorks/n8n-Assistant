// Using Supabase for database operations
import { supabase } from './supabase';

// Import interfaces from ChatDashboard to ensure compatibility
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isWorkflow?: boolean;
  workflowData?: any;
  workflowMetadata?: {
    reasoning?: string;
    apps_needed?: string[];
    workflow_steps?: Array<{step: number, action: string, app: string}>;
    data_flow?: string;
    technical_details?: {
      automation_pattern?: string;
      complexity?: string;
      estimated_nodes?: number;
      confidence?: number;
      validation_score?: number;
    };
    next_steps?: string[];
  };
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
  sessionId: string; // API session ID for workflow continuity
}

export class ChatService {
  /**
   * Load all chat sessions for a user from Supabase
   */
  static async loadUserChats(userId: string): Promise<Chat[]> {
    try {
      console.log('📥 Loading chats for user:', userId);
      
      let allChats: Chat[] = [];
      
      // 1. Load from localStorage first
      const storageKey = `n8n-chats-${userId}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const localChats: Chat[] = JSON.parse(stored);
          const processedLocalChats = localChats.map(chat => ({
            ...chat,
            timestamp: new Date(chat.timestamp),
            messages: chat.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          allChats = processedLocalChats;
          console.log('📱 Loaded', processedLocalChats.length, 'chats from localStorage');
        } catch (e) {
          console.warn('Error parsing localStorage chats:', e);
        }
      }
      
      // 2. Load from database using the function that bypasses RLS
      try {
        const { data, error } = await supabase.rpc('get_user_chats', {
          p_user_id: userId
        });

        if (!error && data && data.length > 0) {
          console.log('🗄️ Found', data.length, 'chats in database');
          
          const dbChats = data.map(row => ({
            id: row.id,
            title: row.title,
            lastMessage: row.messages.length > 0 ? row.messages[row.messages.length - 1].content : '',
            timestamp: new Date(row.updated_at),
            messages: row.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })) || [],
            sessionId: row.session_id || ''
          }));
          
          // Merge with localStorage chats (avoid duplicates)
          const localChatIds = new Set(allChats.map(chat => chat.id));
          const newDbChats = dbChats.filter(chat => !localChatIds.has(chat.id));
          
          allChats = [...allChats, ...newDbChats];
          console.log('🔄 Added', newDbChats.length, 'new chats from database');
        } else if (error) {
          console.log('⚠️ Database function error:', error.message);
        }
      } catch (dbError) {
        console.log('⚠️ Database access failed:', dbError);
      }
      
      // Sort all chats by timestamp (most recent first)
      allChats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      console.log('✅ Total loaded:', allChats.length, 'chats');
      return allChats;
    } catch (error) {
      console.error('Error in loadUserChats:', error);
      return [];
    }
  }

  /**
   * Save a chat session to Supabase
   */
  static async saveChat(userId: string, chat: Chat): Promise<boolean> {
    try {
      console.log('💾 Saving chat:', {
        chatId: chat.id,
        userId,
        title: chat.title,
        messageCount: chat.messages.length,
        sessionId: chat.sessionId
      });
      
      // Save to both database and localStorage for redundancy
      
      // 1. Save to database using the function
      try {
        const { error } = await supabase.rpc('save_user_chat', {
          p_id: chat.id,
          p_user_id: userId,
          p_title: chat.title,
          p_messages: chat.messages,
          p_session_id: chat.sessionId
        });

        if (error) {
          console.error('⚠️ Database save failed:', error.message);
        } else {
          console.log('✅ Chat saved to database:', chat.id);
        }
      } catch (dbError) {
        console.error('⚠️ Database save error:', dbError);
      }
      
      // 2. Also save to localStorage as backup
      const storageKey = `n8n-chats-${userId}`;
      let existingChats: Chat[] = [];
      
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          existingChats = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Error parsing existing chats from localStorage');
      }
      
      // Update or add the chat
      const chatIndex = existingChats.findIndex(c => c.id === chat.id);
      if (chatIndex >= 0) {
        existingChats[chatIndex] = chat;
      } else {
        existingChats.unshift(chat);
      }
      
      // Keep only the latest 50 chats
      existingChats = existingChats.slice(0, 50);
      
      localStorage.setItem(storageKey, JSON.stringify(existingChats));
      console.log('✅ Chat saved to localStorage:', chat.id);
      
      return true;
    } catch (error) {
      console.error('❌ Error in saveChat:', error);
      return false;
    }
  }

  /**
   * Delete a chat session from Supabase
   */
  static async deleteChat(userId: string, chatId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting chat:', chatId);
      
      // Delete from both database and localStorage
      
      // 1. Delete from database using the function
      try {
        const { error } = await supabase.rpc('delete_user_chat', {
          p_id: chatId,
          p_user_id: userId
        });

        if (error) {
          console.error('⚠️ Database delete failed:', error.message);
        } else {
          console.log('✅ Chat deleted from database:', chatId);
        }
      } catch (dbError) {
        console.error('⚠️ Database delete error:', dbError);
      }
      
      // 2. Delete from localStorage
      const storageKey = `n8n-chats-${userId}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const chats: Chat[] = JSON.parse(stored);
        const filteredChats = chats.filter(chat => chat.id !== chatId);
        localStorage.setItem(storageKey, JSON.stringify(filteredChats));
        console.log('✅ Chat deleted from localStorage:', chatId);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteChat:', error);
      return false;
    }
  }

}