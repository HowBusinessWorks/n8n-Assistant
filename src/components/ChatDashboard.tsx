import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth, useUser, SignUp, UserButton } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Workflow,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  ArrowUp,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Trash2,
  Lock,
  MoreVertical,
  Edit3,
  Check,
  X,
  CreditCard,
  User,
  Settings,
  LogOut,
  Crown
} from 'lucide-react';
import { workflowAPI, WorkflowAPIResponse } from '../services/api';
import { UserUsageService, UserStats } from '../services/supabase';
import { ChatService } from '../services/chatService';
import { StripeService } from '../services/stripe';
import BonusPlansModal from './BonusPlansModal';

interface Message {
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

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
  sessionId: string; // API session ID for workflow continuity
}

// Workflow Dropdown Component
interface WorkflowDropdownProps {
  title: string;
  content: string;
}

function WorkflowDropdown({ title, content }: WorkflowDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#3a3a3a]/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-[#2a2a2a]/30 hover:bg-[#2a2a2a]/50 transition-colors duration-200"
      >
        <span className="text-sm font-medium text-[#EFD09E]">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-3 bg-[#1a1a1a]/50 border-t border-[#3a3a3a]/30">
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  
  // Get initial message from navigation state
  const initialMessage = location.state?.initialMessage;
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string>('');
  const [editingChatId, setEditingChatId] = useState<string>('');
  const [editingTitle, setEditingTitle] = useState('');
  const [showGuestMenu, setShowGuestMenu] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBonusPlansModal, setShowBonusPlansModal] = useState(false);
  const [selectedPrompts, setSelectedPrompts] = useState(5000);
  const [showPromptsDropdown, setShowPromptsDropdown] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [usageStats, setUsageStats] = useState<UserStats>({ 
    total: 0, 
    successful: 0, 
    remaining: 3,
    subscriptionStatus: 'free',
    planName: 'Free Plan',
    generationLimit: 3,
    bonusUsed: 0,
    bonusLimit: 0,
    bonusRemaining: 0
  });
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load user usage stats
  const loadUsageStats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingUsage(true);
      const stats = await UserUsageService.getUserStats(user.id);
      setUsageStats(stats);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setIsLoadingUsage(false);
    }
  }, [user?.id]);

  // Check if user can generate workflows
  const canGenerateWorkflow = useCallback(async () => {
    if (!user?.id) return false;
    return await UserUsageService.canUserGenerate(user.id);
  }, [user?.id]);

  // Save chat to database
  const saveChat = useCallback(async (chat: Chat) => {
    if (!user?.id) return;
    
    try {
      await ChatService.saveChat(user.id, chat);
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  }, [user?.id]);


  // Payment handlers
  const handleUpgradeToPremium = async () => {
    if (!user?.id) {
      alert('Please sign in to upgrade your plan');
      return;
    }

    try {
      const basePrice = getCurrentPrice();
      const finalPrice = isAnnual ? Math.ceil(basePrice * 0.8) : basePrice; // 20% annual discount
      
      const { sessionId } = await StripeService.createCustomCheckoutSession({
        amount: finalPrice,
        promptCount: selectedPrompts,
        userId: user.id,
        interval: isAnnual ? 'year' : 'month',
        currency: 'usd',
        productName: `${selectedPrompts.toLocaleString()} Workflow Generations`,
        successUrl: `${window.location.origin}/?success=true`,
        cancelUrl: `${window.location.origin}/?canceled=true`
      });

      // Redirect to Stripe Checkout
      const stripe = await StripeService.getStripe();
      if (stripe && sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw new Error(error.message || 'Failed to redirect to checkout');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  const handleUpgradeToPro = async () => {
    if (!user?.id) {
      alert('Please sign in to upgrade your plan');
      return;
    }

    try {
      const planId = isAnnual ? 'pro_yearly' : 'pro_monthly';
      await StripeService.createCheckoutSession(planId, user.id);
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleUpgradeToFree = async () => {
    if (!user?.id) {
      alert('Please sign in to upgrade your plan');
      return;
    }

    try {
      // For free plan, we could set up a basic plan or just close modal
      // since users already get 3 free generations
      setShowPricingModal(false);
      alert('You already have access to the free plan with 3 workflow generations!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id) {
      alert('Please sign in to cancel subscription');
      return;
    }

    try {
      // Call Supabase Edge Function to cancel subscription
      const response = await fetch('https://asljibfralcdthkuqosh.supabase.co/functions/v1/cancel-subscription', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbGppYmZyYWxjZHRoa3Vxb3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTUzMTEsImV4cCI6MjA2NzEzMTMxMX0.9E-p0fzLzlTTy3158BvQr65b9pHKjpjBK8T5JlHv7KA',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbGppYmZyYWxjZHRoa3Vxb3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTUzMTEsImV4cCI6MjA2NzEzMTMxMX0.9E-p0fzLzlTTy3158BvQr65b9pHKjpjBK8T5JlHv7KA'
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('Subscription cancelled successfully. You will retain access until the end of your billing period.');
        // Refresh user stats to reflect changes
        await loadUsageStats();
        setShowSettingsModal(false);
      } else {
        throw new Error(result.error || 'Failed to cancel subscription');
      }
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`Cancellation Error: ${error.message}`);
      } else {
        alert('An error occurred while cancelling your subscription. Please try again.');
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, activeChat]);

  // Load user chats from database
  const loadUserChats = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('Loading chats for user:', user.id);
      const savedChats = await ChatService.loadUserChats(user.id);
      setChats(savedChats);
      console.log('Loaded', savedChats.length, 'chats from database');
    } catch (error) {
      console.error('Error loading user chats:', error);
    }
  }, [user?.id]);

  // Sync user data and load stats when user is available
  useEffect(() => {
    if (isSignedIn && user?.id) {
      // First sync user to database to ensure they exist
      UserUsageService.syncUserData(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl
      }).then(() => {
        // Then load usage stats and chats
        loadUsageStats();
        loadUserChats();
      }).catch(error => {
        console.error('Failed to sync user, but continuing:', error);
        // Still try to load data even if sync fails
        loadUsageStats();
        loadUserChats();
      });
    }
  }, [isSignedIn, user?.id, loadUsageStats, loadUserChats]);

  // Handle payment success and refresh user stats
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('success') === 'true' && isSignedIn && user?.id) {
      // Payment was successful, refresh user stats
      console.log('Payment success detected, refreshing user stats...');
      loadUsageStats();
      // Clean up the URL
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, isSignedIn, user?.id, loadUsageStats]);

  // Handle initial message from navigation state or pending example
  useEffect(() => {
    if (isSignedIn && user) {
      // Check for navigation state message first
      if (initialMessage && initialMessage.trim()) {
        setCurrentMessage(initialMessage);
        // Clear the navigation state
        window.history.replaceState({}, document.title);
      } else {
        // Check for pending example from localStorage (from Examples component)
        const pendingExample = localStorage.getItem('pendingExample');
        if (pendingExample && pendingExample.trim()) {
          setCurrentMessage(pendingExample);
          // Clear the pending example
          localStorage.removeItem('pendingExample');
        }
      }
    }
  }, [initialMessage, isSignedIn, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenuId('');
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const getCurrentChat = () => chats.find(chat => chat.id === activeChat);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      lastMessage: '',
      timestamp: new Date(),
      messages: [],
      sessionId: workflowAPI.generateSessionId() // Generate session ID once per chat
    };
    setChats(prevChats => [newChat, ...prevChats]);
    setActiveChat(newChat.id);
    
    // Save new chat to database
    saveChat(newChat);
  };

  const deleteChat = async (chatId: string) => {
    if (user?.id) {
      try {
        await ChatService.deleteChat(user.id, chatId);
      } catch (error) {
        console.error('Error deleting chat from database:', error);
      }
    }
    
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat('');
    }
    setOpenMenuId('');
  };

  const startRenaming = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
    setOpenMenuId('');
  };

  const saveRename = (chatId: string) => {
    if (editingTitle.trim()) {
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, title: editingTitle.trim() }
            : chat
        );
        
        // Save the updated chat to database
        const updatedChat = updatedChats.find(chat => chat.id === chatId);
        if (updatedChat) {
          saveChat(updatedChat);
        }
        
        return updatedChats;
      });
    }
    setEditingChatId('');
    setEditingTitle('');
  };

  const cancelRename = () => {
    setEditingChatId('');
    setEditingTitle('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    // Check authentication first
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    // Check if user can generate workflows (regular or bonus)
    const canGenerate = await canGenerateWorkflow();
    const hasBonus = (usageStats.bonusRemaining || 0) > 0;
    
    if (!canGenerate && !hasBonus) {
      // No regular generations AND no bonus generations available
      // For paid users who hit their limit, show bonus plans modal
      // For free users, show regular pricing modal
      if (usageStats.subscriptionStatus && usageStats.subscriptionStatus !== 'free') {
        setShowBonusPlansModal(true);
      } else {
        setShowPricingModal(true);
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    let targetChatId = activeChat;

    // If no active chat, create one
    if (!activeChat) {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: currentMessage.slice(0, 50) + (currentMessage.length > 50 ? '...' : ''),
        lastMessage: currentMessage,
        timestamp: new Date(),
        messages: [userMessage],
        sessionId: workflowAPI.generateSessionId() // Generate session ID for new chat
      };
      targetChatId = newChat.id;
      setChats([newChat, ...chats]);
      setActiveChat(newChat.id);
      
      // Save new chat to database
      saveChat(newChat);
    } else {
      // Update existing chat
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => 
          chat.id === activeChat 
            ? { 
                ...chat, 
                messages: [...chat.messages, userMessage],
                lastMessage: currentMessage,
                timestamp: new Date(),
                title: chat.title === 'New Chat' ? currentMessage.slice(0, 50) + '...' : chat.title
              }
            : chat
        );
        
        // Save the updated chat to database
        const updatedChat = updatedChats.find(chat => chat.id === activeChat);
        if (updatedChat) {
          saveChat(updatedChat);
        }
        
        return updatedChats;
      });
    }

    const messageContent = currentMessage;
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Get the session ID from the current chat
      const currentChat = chats.find(chat => chat.id === targetChatId);
      const sessionId = currentChat?.sessionId || workflowAPI.generateSessionId();
      
      console.log('Sending API request:', { sessionId, messageContent, userId: user!.id });
      
      const response = await workflowAPI.sendMessage(sessionId, messageContent, user!.id, getToken);
      console.log('API Response:', response);

      let assistantContent = '';
      let workflowData = null;
      let workflowMetadata = undefined;
      
      // Extract rich information from the API response
      const intentParsing = response.intent_parsing?.parsed_intent;
      const processingInfo = response.processing_summary;
      const validationInfo = response.validation;
      
      // Check if this is an edit response (when we already have messages in the chat)
      const isEditRequest = currentChat && currentChat.messages.length > 0;
      
      console.log('Response processing:', {
        isEditRequest,
        hasEditedWorkflow: !!response.edited_workflow,
        hasFinalWorkflow: !!response.final_workflow,
        success: response.success
      });
      
      if (response.success) {
        if (response.edited_workflow) {
          // Edit response - use edited_workflow
          console.log('Processing edit response with edited_workflow');
          assistantContent = `✅ **Workflow Updated Successfully!**\n\nYour workflow has been modified and is ready to import into n8n.`;
          workflowData = response.edited_workflow;
        } else if (response.final_workflow) {
          // Initial generation response with full details
          let responseText = `✨ **Workflow Generated Successfully!**\n\n`;
          
          if (intentParsing?.description) {
            responseText += `**Description:**\n${intentParsing.description}\n\n`;
          }
          
          if (response.validation?.is_ready_for_import) {
            responseText += `✅ **Ready to Import:** This workflow has been validated and is ready to import into n8n!`;
          }
          
          assistantContent = responseText;
          workflowData = response.final_workflow;
          
          // Prepare metadata for dropdowns (only for initial generation)
          if (intentParsing) {
            const details: any = {};
            if (intentParsing.automation_pattern) details.automation_pattern = intentParsing.automation_pattern;
            if (intentParsing.complexity) details.complexity = intentParsing.complexity;
            if (intentParsing.estimated_nodes) details.estimated_nodes = intentParsing.estimated_nodes;
            if (intentParsing.confidence) details.confidence = intentParsing.confidence;
            if (validationInfo?.confidence_score) details.validation_score = validationInfo.confidence_score;

            workflowMetadata = {
              reasoning: intentParsing.reasoning,
              apps_needed: intentParsing.apps_needed,
              workflow_steps: intentParsing.workflow_steps,
              data_flow: intentParsing.data_flow,
              technical_details: Object.keys(details).length > 0 ? details : undefined,
              next_steps: response.next_steps
            };
            
            console.log('Prepared workflow metadata:', workflowMetadata);
          }
        }
      } else {
        console.log('API call failed or no workflow generated:', { 
          success: response.success, 
          hasFinalWorkflow: !!response.final_workflow,
          hasEditedWorkflow: !!response.edited_workflow,
          message: response.message,
          error: response.error
        });
        assistantContent = response.message || 'I encountered an issue generating your workflow. Please try again.';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        isWorkflow: response.success && !!workflowData,
        workflowData: workflowData,
        workflowMetadata: workflowMetadata
      };

      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => 
          chat.id === targetChatId 
            ? { 
                ...chat, 
                messages: [...chat.messages, assistantMessage],
                lastMessage: assistantMessage.content,
                timestamp: new Date()
              }
            : chat
        );
        
        // Save the updated chat to database
        const updatedChat = updatedChats.find(chat => chat.id === targetChatId);
        if (updatedChat) {
          saveChat(updatedChat);
        }
        
        return updatedChats;
      });

      // Reload usage stats if successful (Edge Function already incremented usage)
      if (response.success && user?.id) {
        await loadUsageStats();
      }

    } catch (error) {
      console.error('Error calling workflow API:', error);
      
      let errorContent = 'Sorry, I encountered an error while generating your workflow. Please try again.';
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorContent = 'The request timed out. The server might be busy. Please try again.';
        } else if (error.message.includes('Network error')) {
          errorContent = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('HTTP error! status: 500')) {
          errorContent = 'Server error occurred. Please try again in a moment.';
        }
        console.error('Detailed error:', error.message);
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        isWorkflow: false
      };

      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => 
          chat.id === targetChatId 
            ? { 
                ...chat, 
                messages: [...chat.messages, errorMessage],
                lastMessage: errorMessage.content,
                timestamp: new Date()
              }
            : chat
        );
        
        // Save the updated chat to database
        const updatedChat = updatedChats.find(chat => chat.id === targetChatId);
        if (updatedChat) {
          saveChat(updatedChat);
        }
        
        return updatedChats;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleExampleClick = (example: string) => {
    if (example === "Convert make.com workflow to n8n") {
      // Don't set message for coming soon feature
      return;
    }
    setCurrentMessage(example);
  };

  const promptOptions = [
    { prompts: 100, price: 20 },
    { prompts: 200, price: 40 },
    { prompts: 300, price: 60 },
    { prompts: 500, price: 100 },
    { prompts: 750, price: 150 },
    { prompts: 1000, price: 200 },
    { prompts: 2000, price: 400 },
    { prompts: 5000, price: 1000 }
  ];

  const getCurrentPrice = () => {
    const option = promptOptions.find(opt => opt.prompts === selectedPrompts);
    return option ? option.price : 1000;
  };

  const examplePrompts = [
    "Create weekly report from Gmail",
    "Backup files to Google Drive daily", 
    "Send Slack notification for new orders",
    "Convert make.com workflow to n8n"
  ];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#272727] via-[#2a2a2a] to-[#1f1f1f] flex relative transition-colors duration-300">
      {/* Subtle dotted grid background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle, #EFD09E 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      />
      
      {/* Sidebar */}
      <div className="w-64 bg-[#1f1f1f]/80 backdrop-blur-sm border-r border-[#3a3a3a]/50 flex flex-col relative z-10">
        {/* Header */}
        <div className="p-4 border-b border-[#3a3a3a]/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 p-2">
              <div className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] p-1.5 rounded-lg">
                <Workflow className="h-4 w-4 text-[#272727]" />
              </div>
              <span className="text-white text-sm font-medium">n8n Assistant</span>
            </div>
            
            <button 
              onClick={createNewChat}
              className="text-gray-400 hover:text-[#EFD09E] p-1 rounded-lg hover:bg-[#2a2a2a]/50 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-400 mb-2 px-2">Today</div>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`p-3 rounded-xl cursor-pointer hover:bg-[#2a2a2a]/50 transition-all duration-200 mb-1 group relative backdrop-blur-sm ${
                    activeChat === chat.id ? 'bg-[#2a2a2a]/50 border border-[#EFD09E]/20' : 'border border-transparent'
                  } ${
                    openMenuId === chat.id ? 'z-[200]' : 'z-10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {editingChatId === chat.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveRename(chat.id);
                            } else if (e.key === 'Escape') {
                              cancelRename();
                            }
                          }}
                          className="bg-[#2a2a2a] text-white text-sm px-2 py-1 rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#EFD09E]/50 flex-1"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveRename(chat.id);
                          }}
                          className="text-green-400 hover:text-green-300 p-1 rounded-lg hover:bg-green-900/20 transition-all duration-200"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelRename();
                          }}
                          className="text-gray-400 hover:text-gray-300 p-1 rounded-lg hover:bg-gray-900/20 transition-all duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-white text-sm truncate flex-1 pr-2">{chat.title}</h3>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === chat.id ? '' : chat.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#EFD09E] transition-all duration-200 p-1 rounded-lg hover:bg-[#2a2a2a]/50"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openMenuId === chat.id && (
                            <div 
                              ref={dropdownRef}
                              className="absolute right-0 top-8 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg shadow-lg z-[100] min-w-[120px]"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startRenaming(chat.id, chat.title);
                                }}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-[#EFD09E] hover:bg-[#2a2a2a]/50 transition-all duration-200 rounded-t-lg"
                              >
                                <Edit3 className="h-3 w-3" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChat(chat.id);
                                }}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200 rounded-b-lg"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-gray-400 text-sm">
                Your conversations will appear here once you start chatting!
              </p>
            </div>
          )}
        </div>

        {/* Bottom section */}
        <div className="p-4 border-t border-[#3a3a3a]/50">
          {isLoaded && isSignedIn ? (
            <div className="space-y-3">
              {/* Usage Stats */}
              <div className="bg-[#1f1f1f]/50 rounded-xl p-3">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Usage</div>
                <div className="text-sm text-white">
                  <span className="text-[#EFD09E]">{usageStats?.remaining || 0}</span>
                  <span className="text-gray-400"> / {usageStats?.generationLimit || 3} workflows remaining</span>
                </div>
                {/* Show bonus usage if user has bonus generations remaining */}
                {usageStats?.bonusRemaining && usageStats.bonusRemaining > 0 && (
                  <div className="text-xs text-[#EFD09E] mt-1">
                    +{usageStats.bonusRemaining} bonus generations
                  </div>
                )}
                {/* Buy More button for paid users at limit */}
                {usageStats.subscriptionStatus && usageStats.subscriptionStatus !== 'free' && usageStats.remaining === 0 && (
                  <button
                    onClick={() => setShowBonusPlansModal(true)}
                    className="mt-2 w-full text-xs bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] py-1.5 px-3 rounded-lg hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 font-medium"
                  >
                    Buy More
                  </button>
                )}
              </div>
              
              {/* User Account */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                        userButtonPopoverCard: "bg-[#1f1f1f] border border-[#3a3a3a]",
                        userButtonPopoverText: "text-white",
                        userButtonPopoverActionButton: "text-gray-300 hover:text-[#EFD09E]"
                      }
                    }}
                  />
                  <div>
                    <div className="text-sm text-white font-medium">
                      {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-400">{usageStats.planName || 'Free Plan'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {usageStats.subscriptionStatus === 'free' ? (
                    <button 
                      onClick={() => setShowPricingModal(true)}
                      className="text-xs text-[#EFD09E] hover:text-[#D4AA7D] transition-colors"
                    >
                      Upgrade
                    </button>
                  ) : (
                    <>
                      <div className="text-xs text-green-400 flex items-center">
                        <Crown className="h-3 w-3 mr-1" />
                        {usageStats.subscriptionStatus === 'pro' ? 'Pro' : 'Premium'}
                      </div>
                      <button 
                        onClick={() => setShowSettingsModal(true)}
                        className="text-xs text-gray-400 hover:text-[#EFD09E] transition-colors"
                      >
                        Manage
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] py-3 px-4 rounded-xl hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 font-semibold"
            >
              Sign In to Continue
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Subtle dotted grid background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, #EFD09E 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        />
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          {!activeChat || getCurrentChat()?.messages.length === 0 ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  What do you want to <span className="text-[#EFD09E]">build</span> today?
                </h1>
              </div>

              {/* Example Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className={`border rounded-xl p-4 text-left transition-all duration-200 group relative ${
                      index === 3 
                        ? 'bg-gradient-to-br from-blue-600/80 to-purple-600/80 border-blue-500/50 hover:from-blue-600/90 hover:to-purple-600/90 cursor-not-allowed shadow-lg backdrop-blur-sm'
                        : 'bg-[#1f1f1f]/90 border-[#3a3a3a] hover:bg-[#1f1f1f] hover:border-[#EFD09E]/30 shadow-lg backdrop-blur-sm'
                    }`}
                  >
                    {index === 3 && (
                      <div className="absolute -top-2 -right-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          Coming Soon
                        </span>
                      </div>
                    )}
                    <div className={`font-medium mb-1 ${
                      index === 3 
                        ? 'text-blue-200' 
                        : 'text-white'
                    }`}>
                      {prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="max-w-4xl mx-auto space-y-6">
              {getCurrentChat()?.messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D]' 
                          : 'bg-[#1f1f1f]/80 backdrop-blur-sm border border-[#3a3a3a]'
                      }`}>
                        {message.type === 'user' ? (
                          <div className="w-4 h-4 bg-[#272727] rounded-full"></div>
                        ) : (
                          <Sparkles className="h-4 w-4 text-[#D4AA7D]" />
                        )}
                      </div>
                      <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block p-4 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727]'
                            : 'bg-[#1f1f1f]/80 text-white border border-[#3a3a3a]'
                        }`}>
                          <div className="whitespace-pre-wrap space-y-2">
                            {message.content.split('\n\n').map((paragraph, index) => {
                              if (!paragraph.trim()) return null;
                              
                              // Handle bold markdown **text**
                              if (paragraph.includes('**')) {
                                const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                                return (
                                  <p key={index} className="leading-relaxed">
                                    {parts.map((part, partIndex) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        const boldText = part.slice(2, -2);
                                        return (
                                          <span key={partIndex} className="font-bold text-[#EFD09E]">
                                            {boldText}
                                          </span>
                                        );
                                      }
                                      return <span key={partIndex}>{part}</span>;
                                    })}
                                  </p>
                                );
                              }
                              
                              // Handle bullet points
                              if (paragraph.startsWith('•') || paragraph.match(/^\d+\./)) {
                                return (
                                  <p key={index} className="leading-relaxed ml-2">
                                    {paragraph}
                                  </p>
                                );
                              }
                              
                              // Regular paragraph
                              return (
                                <p key={index} className="leading-relaxed">
                                  {paragraph}
                                </p>
                              );
                            })}
                          </div>
                          
                          {/* Workflow Metadata Dropdowns */}
                          {message.workflowMetadata && message.type === 'assistant' && (
                            <div className="mt-4 space-y-2">
                              {/* Reasoning Dropdown */}
                              {message.workflowMetadata.reasoning && (
                                <WorkflowDropdown
                                  title="Reasoning"
                                  content={message.workflowMetadata.reasoning}
                                />
                              )}
                              
                              {/* Apps Used Dropdown */}
                              {message.workflowMetadata.apps_needed && message.workflowMetadata.apps_needed.length > 0 && (
                                <WorkflowDropdown
                                  title="Apps Used"
                                  content={message.workflowMetadata.apps_needed.map(app => `• ${app}`).join('\n')}
                                />
                              )}
                              
                              {/* Workflow Steps Dropdown */}
                              {message.workflowMetadata.workflow_steps && message.workflowMetadata.workflow_steps.length > 0 && (
                                <WorkflowDropdown
                                  title="Workflow Steps"
                                  content={message.workflowMetadata.workflow_steps.map(step => `${step.step}. ${step.action} (${step.app})`).join('\n')}
                                />
                              )}
                              
                              {/* Data Flow Dropdown */}
                              {message.workflowMetadata.data_flow && (
                                <WorkflowDropdown
                                  title="Data Flow"
                                  content={message.workflowMetadata.data_flow}
                                />
                              )}
                              
                              {/* Technical Details Dropdown */}
                              {message.workflowMetadata.technical_details && (
                                <WorkflowDropdown
                                  title="Technical Details"
                                  content={Object.entries(message.workflowMetadata.technical_details)
                                    .map(([key, value]) => {
                                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                      const displayValue = key === 'confidence' && typeof value === 'number' 
                                        ? `${Math.round(value * 100)}%`
                                        : key === 'validation_score' && typeof value === 'number'
                                        ? `${value}%`
                                        : value;
                                      return `${label}: ${displayValue}`;
                                    })
                                    .join(' • ')}
                                />
                              )}
                              
                              {/* Next Steps Dropdown */}
                              {message.workflowMetadata.next_steps && message.workflowMetadata.next_steps.length > 0 && (
                                <WorkflowDropdown
                                  title="Next Steps"
                                  content={message.workflowMetadata.next_steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}
                                />
                              )}
                            </div>
                          )}
                          
                          {message.isWorkflow && message.type === 'assistant' && message.workflowData && (
                            <div className="mt-4 pt-4 border-t border-[#3a3a3a]">
                              <div className="mb-3">
                                <h4 className="text-sm font-semibold text-[#EFD09E] mb-2">Generated n8n Workflow:</h4>
                                <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#2a2a2a] max-h-64 overflow-auto">
                                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                                    {JSON.stringify(message.workflowData, null, 2)}
                                  </pre>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <button 
                                  onClick={() => navigator.clipboard.writeText(JSON.stringify(message.workflowData, null, 2))}
                                  className="flex items-center space-x-2 text-gray-400 hover:text-[#EFD09E] transition-colors p-2 rounded-lg hover:bg-[#2a2a2a]/50"
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="text-xs">Copy Workflow</span>
                                </button>
                                <button className="text-gray-400 hover:text-[#EFD09E] transition-colors p-1 rounded-lg hover:bg-[#2a2a2a]/50">
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                                <button className="text-gray-400 hover:text-[#EFD09E] transition-colors p-1 rounded-lg hover:bg-[#2a2a2a]/50">
                                  <ThumbsDown className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#1f1f1f]/80 backdrop-blur-sm border border-[#3a3a3a] flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-[#D4AA7D]" />
                    </div>
                    <div className="bg-[#1f1f1f]/80 text-white border border-[#3a3a3a] rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#D4AA7D] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#D4AA7D] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#D4AA7D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="bg-[#1f1f1f]/50 border border-[#3a3a3a] rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-200 focus-within:border-[#EFD09E]/50">
                <div className="bg-[#1f1f1f]/50 rounded-2xl p-2 border border-[#3a3a3a]">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Describe your workflow step by step..."
                    className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-3 resize-none focus:outline-none text-base"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <div className="flex items-center justify-between px-4 py-2 border-t border-[#3a3a3a] mt-2">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="flex items-center space-x-2 text-sm text-gray-500 cursor-not-allowed transition-colors duration-200"
                        title="File upload feature coming soon!"
                      >
                        <Paperclip className="h-4 w-4" />
                        <span>Upload file</span>
                      </div>
                    </div>
                    <div className="text-sm text-[#EFD09E] font-medium">
                      {usageStats.remaining || 0} generations left
                    </div>
                  </div>
                </div>
                <div className="absolute right-4 top-4">
                  <button
                    type="submit"
                    disabled={!currentMessage.trim()}
                    className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] p-3 rounded-xl hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Pricing Plans Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-[#1f1f1f] rounded-3xl shadow-2xl border border-[#3a3a3a] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] p-2 rounded-xl">
                  <CreditCard className="h-5 w-5 text-[#272727]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Pricing Plans</h2>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#2a2a2a] transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-8">
                <p className="text-gray-300 text-lg">Choose the perfect plan for your automation needs</p>
                
                {/* Billing Toggle */}
                <div className="flex items-center justify-center mt-6 mb-8 relative">
                  <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
                  <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    className="mx-4 relative inline-flex h-6 w-11 items-center rounded-full bg-[#3a3a3a] transition-colors focus:outline-none"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] transition-transform ${
                        isAnnual ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${isAnnual ? 'text-white' : 'text-gray-400'}`}>Annual</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Premium Plan */}
                <div className="bg-[#2a2a2a] rounded-2xl p-6 border border-[#3a3a3a] flex flex-col h-full">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
                    <div className="text-3xl font-bold text-[#EFD09E] mb-1">
                      ${isAnnual ? Math.ceil(getCurrentPrice() * 0.8) : getCurrentPrice()}
                    </div>
                    <p className="text-gray-400 text-sm">per month</p>
                    {isAnnual && (
                      <p className="text-green-400 text-sm mt-1">Save 20% annually</p>
                    )}
                    
                    {/* Prompts Selector */}
                    <div className="mt-4 relative">
                      <button
                        onClick={() => setShowPromptsDropdown(!showPromptsDropdown)}
                        className="w-full bg-[#1f1f1f] border border-[#3a3a3a] text-white px-4 py-2 rounded-lg flex items-center justify-between hover:bg-[#2a2a2a] transition-all duration-200"
                      >
                        <span>{selectedPrompts.toLocaleString()} prompts</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showPromptsDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showPromptsDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          {promptOptions.map((option) => (
                            <button
                              key={option.prompts}
                              onClick={() => {
                                setSelectedPrompts(option.prompts);
                                setShowPromptsDropdown(false);
                              }}
                              className={`w-full px-4 py-2 text-left hover:bg-[#2a2a2a] transition-all duration-200 flex justify-between ${
                                selectedPrompts === option.prompts ? 'bg-[#2a2a2a] text-[#EFD09E]' : 'text-white'
                              }`}
                            >
                              <span>{option.prompts.toLocaleString()} prompts</span>
                              <span>${option.price}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      {selectedPrompts.toLocaleString()} workflow generations
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Advanced AI models
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Team collaboration
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Priority support
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Custom integrations
                    </li>
                  </ul>
                  <button 
                    onClick={usageStats.subscriptionStatus === 'premium' ? undefined : handleUpgradeToPremium}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 mt-auto ${
                      usageStats.subscriptionStatus === 'premium'
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]'
                    }`}
                    disabled={usageStats.subscriptionStatus === 'premium'}
                  >
                    {usageStats.subscriptionStatus === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
                  </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-[#EFD09E]/10 to-[#D4AA7D]/10 rounded-2xl p-6 border-2 border-[#EFD09E]/30 relative flex flex-col h-full">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                    <div className="text-3xl font-bold text-[#EFD09E] mb-1">
                      ${isAnnual ? '10' : '15'}
                    </div>
                    <p className="text-gray-400 text-sm">per month</p>
                    {isAnnual && (
                      <p className="text-green-400 text-sm mt-1">Save $60/year</p>
                    )}
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      50 workflow generations
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Advanced templates
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Priority support
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Export workflows
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Email support
                    </li>
                  </ul>
                  <button 
                    onClick={usageStats.subscriptionStatus === 'pro' ? undefined : handleUpgradeToPro}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 mt-auto ${
                      usageStats.subscriptionStatus === 'pro'
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] hover:from-[#D4AA7D] hover:to-[#c19660]'
                    }`}
                    disabled={usageStats.subscriptionStatus === 'pro'}
                  >
                    {usageStats.subscriptionStatus === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                  </button>
                </div>

                {/* Free Plan */}
                <div className="bg-[#2a2a2a] rounded-2xl p-6 border border-[#3a3a3a] flex flex-col h-full">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                    <div className="text-3xl font-bold text-[#EFD09E] mb-1">$0</div>
                    <p className="text-gray-400 text-sm">per month</p>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      3 workflow generations
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Basic templates
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Community support
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Standard workflows
                    </li>
                    <li className="flex items-center text-gray-300">
                      <Check className="h-4 w-4 text-green-400 mr-3" />
                      Basic documentation
                    </li>
                  </ul>
                  <button 
                    onClick={usageStats.subscriptionStatus === 'free' ? undefined : handleUpgradeToFree}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 mt-auto ${
                      usageStats.subscriptionStatus === 'free'
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-[#3a3a3a] text-white hover:bg-[#4a4a4a]'
                    }`}
                    disabled={usageStats.subscriptionStatus === 'free'}
                  >
                    {usageStats.subscriptionStatus === 'free' ? 'Current Plan' : 'Downgrade to Free'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-[#1f1f1f] rounded-3xl shadow-2xl border border-[#3a3a3a] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] p-2 rounded-xl">
                  <Settings className="h-5 w-5 text-[#272727]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Settings</h2>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#2a2a2a] transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Subscription Management */}
              {usageStats.subscriptionStatus !== 'free' ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Subscription</h3>
                  <div className="space-y-3">
                    <div className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium flex items-center">
                            <Crown className="h-4 w-4 text-green-400 mr-2" />
                            Current Plan: {usageStats.planName}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {usageStats.generationLimit} workflow generations per month
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white">
                            {usageStats.remaining} / {usageStats.generationLimit} remaining
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">Change Plan</div>
                          <div className="text-gray-400 text-sm">Upgrade or modify your subscription</div>
                        </div>
                        <button 
                          onClick={() => {
                            setShowSettingsModal(false);
                            setShowPricingModal(true);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] rounded-lg hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 font-medium text-sm"
                        >
                          View Plans
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">Usage History</div>
                          <div className="text-gray-400 text-sm">View your workflow generation history</div>
                        </div>
                        <button className="px-4 py-2 bg-[#3a3a3a] text-white rounded-lg hover:bg-[#4a4a4a] transition-colors duration-200 font-medium text-sm">
                          View History
                        </button>
                      </div>
                    </div>

                    <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-red-400 font-medium">Cancel Subscription</div>
                          <div className="text-red-300/70 text-sm">End your subscription and return to free plan</div>
                        </div>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
                              handleCancelSubscription();
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">No subscription to manage</div>
                  <button 
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowPricingModal(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] text-[#272727] rounded-lg hover:from-[#D4AA7D] hover:to-[#c19660] transition-all duration-200 font-medium"
                  >
                    View Plans
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-[#1f1f1f] rounded-3xl shadow-2xl border border-[#3a3a3a] max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] p-2 rounded-xl">
                  <User className="h-5 w-5 text-[#272727]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-[#2a2a2a] transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <p className="text-gray-300 mb-6">
                Please sign in to start creating workflows and track your usage.
              </p>
              <div className="space-y-3">
                <SignUp 
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-transparent shadow-none border-0",
                      headerTitle: "text-white",
                      headerSubtitle: "text-gray-400",
                      socialButtonsBlockButton: "bg-[#2a2a2a] border border-[#3a3a3a] text-white hover:bg-[#3a3a3a]",
                      formButtonPrimary: "bg-gradient-to-r from-[#EFD09E] to-[#D4AA7D] hover:from-[#D4AA7D] hover:to-[#c19660] text-[#272727]",
                      formFieldInput: "bg-[#2a2a2a] border border-[#3a3a3a] text-white",
                      formFieldLabel: "text-gray-300",
                      footerActionLink: "text-[#EFD09E] hover:text-[#D4AA7D]"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Plans Modal */}
      <BonusPlansModal
        isOpen={showBonusPlansModal}
        onClose={() => setShowBonusPlansModal(false)}
        userId={user?.id || ''}
        currentUsage={{
          workflow_used: usageStats.total,
          workflow_limit: usageStats.generationLimit || 3,
          bonus_used: usageStats.bonusUsed || 0,
          bonus_limit: usageStats.bonusLimit || 0
        }}
      />
    </div>
  );
}