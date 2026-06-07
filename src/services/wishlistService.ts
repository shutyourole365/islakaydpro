import { supabase } from '../lib/supabase';

export interface SharedWishlist {
  id: string;
  wishlist_id: string;
  owner_id: string;
  shared_with_email?: string;
  shared_with_user_id?: string;
  permission_level: 'view' | 'add_suggestions' | 'edit';
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface WishlistShareLink {
  id: string;
  wishlist_id: string;
  share_code: string;
  permission_level: 'view' | 'add_suggestions' | 'edit';
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

export async function shareWishlistWithUser(
  wishlistId: string,
  email: string,
  permissionLevel: 'view' | 'add_suggestions' | 'edit' = 'view'
): Promise<SharedWishlist> {
  const { data, error } = await supabase
    .from('shared_wishlists')
    .insert([{
      wishlist_id: wishlistId,
      shared_with_email: email,
      permission_level: permissionLevel,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as SharedWishlist;
}

export async function createShareLink(
  wishlistId: string,
  permissionLevel: 'view' | 'add_suggestions' | 'edit' = 'view',
  expiresIn?: number
): Promise<WishlistShareLink> {
  const shareCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn).toISOString() : undefined;

  const { data, error } = await supabase
    .from('wishlist_share_links')
    .insert([{
      wishlist_id: wishlistId,
      share_code: shareCode,
      permission_level: permissionLevel,
      expires_at: expiresAt,
      is_active: true,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as WishlistShareLink;
}

export async function getSharedWishlists(userId: string): Promise<SharedWishlist[]> {
  const { data, error } = await supabase
    .from('shared_wishlists')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SharedWishlist[];
}

export async function getReceivedWishlists(userEmail: string): Promise<SharedWishlist[]> {
  const { data, error } = await supabase
    .from('shared_wishlists')
    .select('*')
    .eq('shared_with_email', userEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SharedWishlist[];
}

export async function removeWishlistShare(shareId: string): Promise<void> {
  const { error } = await supabase
    .from('shared_wishlists')
    .delete()
    .eq('id', shareId);

  if (error) throw error;
}

export async function disableShareLink(linkId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlist_share_links')
    .update({ is_active: false })
    .eq('id', linkId);

  if (error) throw error;
}

export async function getAccessibleWishlist(
  wishlistId: string,
  userEmail?: string,
  userId?: string
): Promise<SharedWishlist | null> {
  const query = supabase
    .from('shared_wishlists')
    .select('*')
    .eq('wishlist_id', wishlistId);

  if (userEmail) {
    query.eq('shared_with_email', userEmail);
  }
  if (userId) {
    query.eq('shared_with_user_id', userId);
  }

  const { data, error } = await query.single();

  if (error && error.code === 'PGRST116') {
    return null;
  }
  if (error) throw error;

  return data as SharedWishlist;
}

export async function updateSharePermission(
  shareId: string,
  permissionLevel: 'view' | 'add_suggestions' | 'edit'
): Promise<SharedWishlist> {
  const { data, error } = await supabase
    .from('shared_wishlists')
    .update({ permission_level: permissionLevel })
    .eq('id', shareId)
    .select()
    .single();

  if (error) throw error;
  return data as SharedWishlist;
}
