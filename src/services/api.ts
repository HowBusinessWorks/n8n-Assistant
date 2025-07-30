// Secure API service using Supabase Edge Functions
import { supabase } from './supabase';

export interface WorkflowAPIRequest {
  session_id: string;
  user_input: string;
}

export interface WorkflowAPIResponse {
  success: boolean;
  message?: string;
  pipeline_status?: string;
  session_id?: string;
  confidence_score?: number;
  final_workflow?: object;
  edited_workflow?: object;
  corrected_workflow?: object;
  intent_parsing?: {
    success: boolean;
    parsed_intent?: {
      trigger_type?: string;
      apps_needed?: string[];
      workflow_steps?: Array<{step: number, action: string, app: string}>;
      data_flow?: string;
      automation_pattern?: string;
      complexity?: string;
      estimated_nodes?: number;
      confidence?: number;
      reasoning?: string;
      description?: string;
      parsed_at?: string;
      session_id?: string;
      original_request?: string;
      parsing_success?: boolean;
    };
    automation_pattern?: string;
  };
  rag_retrieval?: {
    examples_found?: number;
    search_quality?: string;
  };
  workflow_generation?: {
    success?: boolean;
    workflow_generated?: boolean;
  };
  validation?: {
    status?: string;
    is_ready_for_import?: boolean;
    confidence_score?: number;
    validation_summary?: {
      errors_found?: number;
      warnings_found?: number;
      fixes_applied?: number;
    };
  };
  import_ready?: boolean;
  next_steps?: string[];
  processing_summary?: {
    total_agents_executed?: number;
    pipeline_success_rate?: string;
    processing_time?: string;
    confidence_score?: number;
  };
  error?: boolean;
  // Additional error fields for security responses
  retry_after?: number;
  usage?: {
    workflow_used: number;
    workflow_limit: number;
    premium_used: number;
    premium_limit: number;
    subscription_status: string;
  };
}

export class WorkflowAPI {
  private timeout: number;

  constructor() {
    this.timeout = 100000; // 100 seconds as specified
  }

  /**
   * Generate a session ID in the format expected by the backend
   */
  generateSessionId(): string {
    const timestamp = Date.now().toString().slice(-8);
    return `session_${timestamp}`;
  }

  /**
   * Send a message to the secure workflow generation Edge Function
   */
  async sendMessage(
    sessionId: string, 
    userInput: string, 
    userId: string,
    getToken?: () => Promise<string | null>
  ): Promise<WorkflowAPIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log('🔒 Making secure API call to Edge Function');
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/generate-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey,
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_input: userInput,
          user_id: userId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        } else if (response.status === 429) {
          const retryAfter = errorData.retry_after || 60;
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
        } else if (response.status === 404) {
          throw new Error('User not found. Please refresh and try again.');
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Secure API call successful');
      return data as WorkflowAPIResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - the server took too long to respond');
        }
        throw error; // Re-throw the original error with its message
      }
      throw new Error('Unknown error occurred');
    }
  }

  /**
   * Check if the secure API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check by verifying we can get a session
      const { data: sessionData } = await supabase.auth.getSession();
      return !!sessionData?.session?.access_token;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const workflowAPI = new WorkflowAPI();