import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

// Create Supabase client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// User usage tracking service
export class UserUsageService {
  /**
   * Check if user has unlimited access (for testing/admin accounts)
   */
  private static isUnlimitedAccount(clerkUserId: string): boolean {
    // Add your Clerk user ID here for unlimited testing
    const unlimitedAccounts = [
      'user_30KX5qrFxeg1XpKLJo2FYPQ2m1S', // Your actual Clerk user ID - UNLIMITED! 🚀
      'admin_test_unlimited',
      // Add more test accounts as needed
    ];
    
    return unlimitedAccounts.includes(clerkUserId);
  }

  /**
   * Get user's subscription-based generation limit from database
   */
  static async getUserGenerationLimit(clerkUserId: string): Promise<number> {
    try {
      const usage = await this.getUserUsage(clerkUserId);
      if (usage) {
        return usage.workflow_generations_limit || 3;
      }
      return 3; // Default free tier
    } catch (error) {
      console.error('Error getting user generation limit:', error);
      return 3; // Fallback to free tier
    }
  }

  /**
   * Create or update user in database
   */
  static async syncUserData(clerkUserId: string, userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }) {
    try {
      const { data, error } = await supabase.rpc('upsert_user', {
        p_user_id: clerkUserId,
        p_email: userData.email || '',
        p_first_name: userData.firstName || null,
        p_last_name: userData.lastName || null,
        p_image_url: userData.imageUrl || null
      });

      if (error) {
        console.error('Error syncing user data:', error);
        // Fallback to localStorage
        const userKey = `user_profile_${clerkUserId}`;
        localStorage.setItem(userKey, JSON.stringify({
          ...userData,
          lastSyncAt: new Date().toISOString()
        }));
      }

      return data;
    } catch (error) {
      console.error('Error in syncUserData:', error);
      // Fallback to localStorage
      const userKey = `user_profile_${clerkUserId}`;
      localStorage.setItem(userKey, JSON.stringify({
        ...userData,
        lastSyncAt: new Date().toISOString()
      }));
    }
  }

  /**
   * Get user's usage data from user_usage table
   */
  static async getUserUsage(clerkUserId: string) {
    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', clerkUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching user usage:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserUsage:', error);
      return null;
    }
  }

  /**
   * Get user's successful workflow generation count
   */
  static async getUserUsageCount(clerkUserId: string): Promise<number> {
    try {
      const usage = await this.getUserUsage(clerkUserId);
      if (usage) {
        return usage.workflow_generations_used || 0;
      }

      // Fallback to counting from user_requests table
      const { data, error } = await supabase.rpc('get_user_workflow_count', {
        p_user_id: clerkUserId
      });

      if (error) {
        console.error('Error fetching user usage count:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in getUserUsageCount:', error);
      return 0;
    }
  }

  /**
   * Check if user can generate more workflows
   */
  static async canUserGenerate(clerkUserId: string): Promise<boolean> {
    try {
      // Check if this is a test/admin account with unlimited access
      if (this.isUnlimitedAccount(clerkUserId)) {
        return true;
      }

      const usage = await this.getUserUsage(clerkUserId);
      const usedCount = usage?.workflow_generations_used || await this.getUserUsageCount(clerkUserId);
      
      // Get limit from database
      const limit = await this.getUserGenerationLimit(clerkUserId);

      return usedCount < limit;
    } catch (error) {
      console.error('Error in canUserGenerate:', error);
      return false;
    }
  }

  /**
   * Get remaining generations for user
   */
  static async getRemainingGenerations(clerkUserId: string): Promise<number> {
    try {
      // Check if this is a test/admin account with unlimited access
      if (this.isUnlimitedAccount(clerkUserId)) {
        return 999999; // Show unlimited
      }

      const usage = await this.getUserUsage(clerkUserId);
      const used = usage?.workflow_generations_used || await this.getUserUsageCount(clerkUserId);
      
      // Get limit from database
      const limit = await this.getUserGenerationLimit(clerkUserId);

      return Math.max(0, limit - used);
    } catch (error) {
      console.error('Error in getRemainingGenerations:', error);
      return 0;
    }
  }

  /**
   * Get user's usage statistics
   */
  static async getUserStats(clerkUserId: string): Promise<UserStats> {
    try {
      
      // Check if this is an unlimited account first
      if (this.isUnlimitedAccount(clerkUserId)) {
        return {
          total: 0,
          successful: 0,
          remaining: 999999, // Unlimited
          subscriptionStatus: 'premium',
          planName: 'Premium Plan',
          generationLimit: 999999
        };
      }

      const usage = await this.getUserUsage(clerkUserId);
      
      if (usage) {
        // Get limit from database
        const limit = await this.getUserGenerationLimit(clerkUserId);
        
        // Get user subscription status using admin client to bypass RLS
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('subscription_status')
          .eq('id', clerkUserId)
          .single();
        
        const subscriptionStatus = userData?.subscription_status || 'free';
        const planName = subscriptionStatus === 'pro' ? 'Pro Plan' : 
                        subscriptionStatus === 'premium' ? 'Premium Plan' : 'Free Plan';
        
        // Extract bonus generation data
        const bonusUsed = usage.bonus_generations_used || 0;
        const bonusLimit = usage.bonus_generations_limit || 0;
        const bonusRemaining = Math.max(0, bonusLimit - bonusUsed);
        
        return {
          total: usage.workflow_generations_used || 0,
          successful: usage.workflow_generations_used || 0,
          remaining: Math.max(0, limit - (usage.workflow_generations_used || 0)),
          subscriptionStatus,
          planName,
          generationLimit: limit,
          bonusUsed,
          bonusLimit,
          bonusRemaining
        };
      }

      // Fallback to user_requests table
      const { data, error } = await supabase
        .from('user_requests')
        .select('success, created_at')
        .eq('user_id', clerkUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user stats:', error);
        return { total: 0, successful: 0, remaining: 3 };
      }

      const total = data?.length || 0;
      const successful = data?.filter(req => req.success).length || 0;
      
      // Get limit from database
      const limit = await this.getUserGenerationLimit(clerkUserId);
      
      // Get user subscription status using admin client to bypass RLS
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('subscription_status')
        .eq('id', clerkUserId)
        .single();
      
      const subscriptionStatus = userData?.subscription_status || 'free';
      const planName = subscriptionStatus === 'pro' ? 'Pro Plan' : 
                      subscriptionStatus === 'premium' ? 'Premium Plan' : 'Free Plan';
      
      const remaining = Math.max(0, limit - successful);

      return { 
        total, 
        successful, 
        remaining,
        subscriptionStatus,
        planName,
        generationLimit: limit,
        bonusUsed: 0,
        bonusLimit: 0,
        bonusRemaining: 0
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return { 
        total: 0, 
        successful: 0, 
        remaining: 3,
        subscriptionStatus: 'free',
        planName: 'Free Plan',
        generationLimit: 3,
        bonusUsed: 0,
        bonusLimit: 0,
        bonusRemaining: 0
      };
    }
  }

  /**
   * Increment user usage after successful workflow generation
   */
  static async incrementUsage(clerkUserId: string) {
    try {
      console.log('🔄 Incrementing usage for user:', clerkUserId);
      
      // Call the secure database function to increment usage
      const { data, error } = await supabase.rpc('increment_user_usage', {
        p_user_id: clerkUserId
      });

      if (error) {
        console.error('❌ Error calling increment_user_usage function:', error);
        return false;
      }

      if (data && data.length > 0) {
        const result = data[0];
        console.log('✅ Usage incremented successfully');
        console.log('📊 New usage count:', result.new_usage_count);
        console.log('📊 Usage limit:', result.usage_limit);
        return true;
      } else {
        console.error('❌ No data returned from increment function');
        return false;
      }
    } catch (error) {
      console.error('❌ Error in incrementUsage:', error);
      return false;
    }
  }

  /**
   * Reset user usage count (useful when upgrading from free to paid)
   */
  static async resetUsageCount(clerkUserId: string) {
    try {
      // For now, we'll handle this through the normal usage tracking
      // In the future, we can create a separate database function if needed
      console.log(`⚠️ Reset usage count requested for user: ${clerkUserId}`);
      console.log(`⚠️ This should be handled through subscription webhooks`);
      return true;
    } catch (error) {
      console.error('Error in resetUsageCount:', error);
      return false;
    }
  }
}

// Types for better TypeScript support
export interface UserStats {
  total: number;
  successful: number;
  remaining: number;
  subscriptionStatus?: string;
  planName?: string;
  generationLimit?: number;
  // Bonus generation fields
  bonusUsed?: number;
  bonusLimit?: number;
  bonusRemaining?: number;
}

export interface UserProfile {
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  lastSyncAt?: string;
}