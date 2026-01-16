/**
 * Supabase RLS-Compliant Helpers
 * 
 * These helpers ensure all queries comply with strict Row Level Security (RLS) policies.
 * They handle errors gracefully and provide permission-aware error messages.
 */

import { supabase } from "@/integrations/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Result type for safe Supabase operations
 */
export interface SafeQueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
  isPermissionDenied: boolean;
  message: string;
}

/**
 * Check if an error is a permission/RLS denial
 */
export function isPermissionError(error: PostgrestError | null): boolean {
  if (!error) return false;
  // Common RLS denial codes and messages
  return (
    error.code === '42501' || // insufficient privilege
    error.code === 'PGRST116' || // Row not found (could be RLS)
    error.message?.toLowerCase().includes('permission denied') ||
    error.message?.toLowerCase().includes('row-level security') ||
    error.message?.toLowerCase().includes('policy')
  );
}

/**
 * Get a user-friendly error message for permission errors
 */
export function getPermissionErrorMessage(context: string): string {
  return `You don't have permission to ${context}. Please ensure you're logged in with the correct account.`;
}

/**
 * Wrapper for safe Supabase select queries
 * Handles RLS errors gracefully and returns empty data instead of crashing
 */
export async function safeSelect<T>(
  queryFn: () => ReturnType<typeof supabase.from>,
  context: string = "access this data"
): Promise<SafeQueryResult<T[]>> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      const isPermDenied = isPermissionError(error);
      return {
        data: null,
        error,
        isPermissionDenied: isPermDenied,
        message: isPermDenied 
          ? getPermissionErrorMessage(context)
          : error.message,
      };
    }
    
    return {
      data: data as T[],
      error: null,
      isPermissionDenied: false,
      message: "",
    };
  } catch (err) {
    return {
      data: null,
      error: err as PostgrestError,
      isPermissionDenied: false,
      message: "An unexpected error occurred",
    };
  }
}

/**
 * Wrapper for safe Supabase single-row queries
 */
export async function safeSingle<T>(
  queryFn: () => ReturnType<typeof supabase.from>,
  context: string = "access this data"
): Promise<SafeQueryResult<T>> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      const isPermDenied = isPermissionError(error);
      return {
        data: null,
        error,
        isPermissionDenied: isPermDenied,
        message: isPermDenied 
          ? getPermissionErrorMessage(context)
          : error.message,
      };
    }
    
    return {
      data: data as T,
      error: null,
      isPermissionDenied: false,
      message: "",
    };
  } catch (err) {
    return {
      data: null,
      error: err as PostgrestError,
      isPermissionDenied: false,
      message: "An unexpected error occurred",
    };
  }
}

/**
 * Wrapper for safe Supabase mutations (insert, update, delete)
 */
export async function safeMutate<T>(
  mutationFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  context: string = "perform this action"
): Promise<SafeQueryResult<T>> {
  try {
    const { data, error } = await mutationFn();
    
    if (error) {
      const isPermDenied = isPermissionError(error);
      return {
        data: null,
        error,
        isPermissionDenied: isPermDenied,
        message: isPermDenied 
          ? getPermissionErrorMessage(context)
          : error.message,
      };
    }
    
    return {
      data: data as T,
      error: null,
      isPermissionDenied: false,
      message: "",
    };
  } catch (err) {
    return {
      data: null,
      error: err as PostgrestError,
      isPermissionDenied: false,
      message: "An unexpected error occurred",
    };
  }
}

/**
 * RLS-compliant type definitions for public profile data
 * Only contains fields that are safe to display publicly
 */
export interface PublicProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

/**
 * Fetch public profile information for display (seller names, etc.)
 * This query is RLS-compliant as profiles table has public SELECT policy
 */
export async function fetchPublicProfile(userId: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, avatar_url')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error || !data) return null;
  return data as PublicProfile;
}

/**
 * Fetch multiple public profiles by user IDs
 */
export async function fetchPublicProfiles(userIds: string[]): Promise<Map<string, PublicProfile>> {
  if (userIds.length === 0) return new Map();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, full_name, avatar_url')
    .in('user_id', userIds);
  
  const map = new Map<string, PublicProfile>();
  if (!error && data) {
    data.forEach(profile => {
      map.set(profile.user_id, profile as PublicProfile);
    });
  }
  return map;
}
