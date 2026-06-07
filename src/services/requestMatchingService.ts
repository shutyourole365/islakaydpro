/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

export interface EquipmentRequest {
  id: string;
  renter_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date: string;
  max_daily_rate: number;
  min_rating?: number;
  must_have_features: string[];
  status: 'open' | 'matched' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface MatchedEquipment {
  id: string;
  request_id: string;
  equipment_id: string;
  owner_id: string;
  match_score: number;
  match_reason: string;
  notified_at?: string;
  created_at: string;
}

export interface RequestMatch {
  request: EquipmentRequest;
  equipment: any;
  matchScore: number;
  matchReasons: string[];
}

export async function createEquipmentRequest(
  renterId: string,
  data: Omit<EquipmentRequest, 'id' | 'renter_id' | 'status' | 'created_at' | 'updated_at'>
): Promise<EquipmentRequest> {
  const { data: request, error } = await supabase
    .from('equipment_requests')
    .insert([{
      renter_id: renterId,
      ...data,
      status: 'open',
    }])
    .select()
    .single();

  if (error) throw error;
  return request as EquipmentRequest;
}

export async function getActiveRequests(renterId: string): Promise<EquipmentRequest[]> {
  const { data, error } = await supabase
    .from('equipment_requests')
    .select('*')
    .eq('renter_id', renterId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as EquipmentRequest[];
}

export async function getExpiringRequests(): Promise<EquipmentRequest[]> {
  const { data, error } = await supabase
    .from('equipment_requests')
    .select('*')
    .eq('status', 'open')
    .lte('expires_at', new Date().toISOString());

  if (error) throw error;
  return data as EquipmentRequest[];
}

export async function findMatches(requestId: string): Promise<RequestMatch[]> {
  const { data: request, error: requestError } = await supabase
    .from('equipment_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (requestError) throw requestError;

  const { data: equipment, error: equipmentError } = await supabase
    .from('equipment')
    .select('*, owner:owner_id(*)')
    .eq('category', request.category)
    .lte('daily_rate', request.max_daily_rate)
    .neq('status', 'unavailable');

  if (equipmentError) throw equipmentError;

  const matches: RequestMatch[] = [];

  equipment?.forEach((item: any) => {
    const { score, reasons } = calculateMatchScore(request, item);
    if (score >= 40) {
      matches.push({
        request,
        equipment: item,
        matchScore: score,
        matchReasons: reasons,
      });
    }
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

function calculateMatchScore(request: EquipmentRequest, equipment: any): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Category match
  if (equipment.category === request.category) {
    score += 20;
    reasons.push('Perfect category match');
  }

  // Price match
  if (equipment.daily_rate <= request.max_daily_rate) {
    const priceRatio = equipment.daily_rate / request.max_daily_rate;
    score += Math.round(20 * priceRatio);
    reasons.push(`${Math.round((1 - priceRatio) * 100)}% under budget`);
  }

  // Rating match
  if (request.min_rating && equipment.rating >= request.min_rating) {
    score += 15;
    reasons.push(`Excellent rating (${equipment.rating}/5)`);
  }

  // Feature match
  if (request.must_have_features.length > 0 && equipment.features) {
    const featureArray = Array.isArray(equipment.features) ? equipment.features : [];
    const matchedFeatures = request.must_have_features.filter(f =>
      featureArray.some((ef: string) => ef.toLowerCase().includes(f.toLowerCase()))
    );
    if (matchedFeatures.length > 0) {
      score += Math.round(15 * (matchedFeatures.length / request.must_have_features.length));
      reasons.push(`${matchedFeatures.length}/${request.must_have_features.length} features match`);
    }
  }

  // Location proximity bonus
  if (request.latitude && request.longitude && equipment.latitude && equipment.longitude) {
    const distance = calculateDistance(
      request.latitude,
      request.longitude,
      equipment.latitude,
      equipment.longitude
    );
    if (distance < 5) {
      score += 15;
      reasons.push(`Close by (${Math.round(distance)}km away)`);
    } else if (distance < 25) {
      score += 8;
      reasons.push(`Nearby (${Math.round(distance)}km away)`);
    }
  }

  // Availability match
  if (equipment.availability_status === 'available') {
    score += 10;
    reasons.push('Currently available');
  }

  return { score: Math.min(score, 100), reasons };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function recordMatch(
  requestId: string,
  equipmentId: string,
  ownerId: string,
  matchScore: number,
  matchReason: string
): Promise<MatchedEquipment> {
  const { data, error } = await supabase
    .from('matched_equipment')
    .insert([{
      request_id: requestId,
      equipment_id: equipmentId,
      owner_id: ownerId,
      match_score: matchScore,
      match_reason: matchReason,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as MatchedEquipment;
}

export async function getMatchesForRequest(requestId: string): Promise<MatchedEquipment[]> {
  const { data, error } = await supabase
    .from('matched_equipment')
    .select('*, equipment:equipment_id(*)')
    .eq('request_id', requestId)
    .order('match_score', { ascending: false });

  if (error) throw error;
  return data as MatchedEquipment[];
}

export async function updateRequestStatus(
  requestId: string,
  status: 'open' | 'matched' | 'fulfilled' | 'cancelled'
): Promise<EquipmentRequest> {
  const { data, error } = await supabase
    .from('equipment_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data as EquipmentRequest;
}

export async function getRequestsNearLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 25
): Promise<EquipmentRequest[]> {
  const { data, error } = await supabase
    .from('equipment_requests')
    .select('*')
    .eq('status', 'open')
    .gt('expires_at', new Date().toISOString());

  if (error) throw error;

  return (data as EquipmentRequest[]).filter(req => {
    if (!req.latitude || !req.longitude) return false;
    const distance = calculateDistance(latitude, longitude, req.latitude, req.longitude);
    return distance <= radiusKm;
  });
}

export async function getRecommendedRequests(
  ownerId: string,
  category: string
): Promise<EquipmentRequest[]> {
  const { data, error } = await supabase
    .from('equipment_requests')
    .select('*')
    .eq('category', category)
    .eq('status', 'open')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data as EquipmentRequest[];
}
