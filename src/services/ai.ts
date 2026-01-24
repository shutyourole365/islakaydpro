import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  equipmentId?: string;
  categoryId?: string;
  location?: string;
  userId?: string;
}

interface ChatResponse {
  content: string;
  suggestions: string[];
  error?: string;
}

/**
 * Send a message to the AI assistant
 */
export async function sendMessage(
  messages: Message[],
  context?: ChatContext
): Promise<ChatResponse> {
  try {
    // Get auth token if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add user ID to context if authenticated
    const enhancedContext = {
      ...context,
      userId: session?.user?.id,
    };

    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        context: enhancedContext,
        provider: 'openai', // or 'anthropic'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    return await response.json();
  } catch (error) {
    console.error('AI chat error:', error);
    return {
      content: "I'm having trouble connecting right now. Please try again in a moment.",
      suggestions: ['Try again', 'Browse equipment', 'Contact support'],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Stream a message from the AI assistant (for real-time typing effect)
 */
export async function streamMessage(
  messages: Message[],
  context: ChatContext | undefined,
  onChunk: (chunk: string) => void,
  onComplete: (suggestions: string[]) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        context: {
          ...context,
          userId: session?.user?.id,
        },
        provider: 'openai',
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    // For now, we'll simulate streaming since Edge Functions don't support SSE easily
    const data = await response.json();
    
    // Simulate typing effect
    const words = data.content.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      onChunk(currentText);
      await new Promise(resolve => setTimeout(resolve, 30)); // 30ms per word
    }

    onComplete(data.suggestions || []);
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}

/**
 * Get AI-powered equipment recommendations
 */
export async function getRecommendations(
  query: string,
  filters?: {
    category?: string;
    maxPrice?: number;
    location?: string;
  }
): Promise<{
  recommendations: string[];
  explanation: string;
}> {
  const messages: Message[] = [
    {
      role: 'user',
      content: `I'm looking for equipment recommendations. ${query}${
        filters?.category ? ` Category preference: ${filters.category}.` : ''
      }${filters?.maxPrice ? ` Budget: up to $${filters.maxPrice}/day.` : ''}${
        filters?.location ? ` Location: ${filters.location}.` : ''
      } Please suggest specific types of equipment I should consider.`,
    },
  ];

  const response = await sendMessage(messages, {
    location: filters?.location,
    categoryId: filters?.category,
  });

  return {
    recommendations: response.suggestions,
    explanation: response.content,
  };
}

/**
 * Get AI help for a specific equipment listing
 */
export async function getEquipmentHelp(
  equipmentId: string,
  question: string
): Promise<ChatResponse> {
  const messages: Message[] = [
    {
      role: 'user',
      content: question,
    },
  ];

  return sendMessage(messages, { equipmentId });
}

/**
 * Generate smart search suggestions based on partial input
 */
export async function getSearchSuggestions(
  partialQuery: string
): Promise<string[]> {
  if (partialQuery.length < 2) {
    return [];
  }

  // For quick suggestions, use a simple matching approach
  // The AI can provide more sophisticated suggestions for longer queries
  const commonSearches = [
    'excavator rental',
    'camera kit',
    'power tools',
    'wedding tent',
    'DJ equipment',
    'party supplies',
    'construction equipment',
    'photography gear',
    'moving truck',
    'lawn mower',
  ];

  const matches = commonSearches.filter(search =>
    search.toLowerCase().includes(partialQuery.toLowerCase())
  );

  if (matches.length > 0) {
    return matches.slice(0, 5);
  }

  // If no common matches, generate AI suggestions for longer queries
  if (partialQuery.length >= 5) {
    const response = await sendMessage([
      {
        role: 'user',
        content: `Suggest 3-5 equipment search terms related to: "${partialQuery}"`,
      },
    ]);

    return response.suggestions.slice(0, 5);
  }

  return [];
}

/**
 * Analyze a project description and suggest needed equipment
 */
export async function analyzeProject(
  projectDescription: string
): Promise<{
  suggestedEquipment: string[];
  estimatedBudget: string;
  tips: string[];
}> {
  const messages: Message[] = [
    {
      role: 'user',
      content: `I have a project: ${projectDescription}. 
      
What equipment would I need? Please provide:
1. List of suggested equipment types
2. Rough budget estimate for rentals
3. Tips for the project`,
    },
  ];

  const response = await sendMessage(messages);

  // Parse the response into structured data
  // In production, you might want the AI to return JSON directly
  return {
    suggestedEquipment: response.suggestions,
    estimatedBudget: 'Contact for quote', // Would be parsed from AI response
    tips: [response.content],
  };
}

/**
 * Get personalized equipment recommendations for a user
 */
export async function getPersonalizedRecommendations(
  userId: string
): Promise<{
  recommendations: string[];
  basedOn: string;
}> {
  // Get user's rental history
  const { data: bookings } = await supabase
    .from('bookings')
    .select('equipment:equipment(title, category:categories(name))')
    .eq('renter_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const recentCategories = bookings
    ?.map(b => b.equipment?.category?.name)
    .filter(Boolean)
    .slice(0, 3);

  if (!recentCategories || recentCategories.length === 0) {
    return {
      recommendations: ['Browse popular equipment', 'View categories', 'See featured listings'],
      basedOn: 'Top picks for new users',
    };
  }

  const messages: Message[] = [
    {
      role: 'user',
      content: `Based on my recent rentals in these categories: ${recentCategories.join(', ')}, 
      what other equipment might I be interested in?`,
    },
  ];

  const response = await sendMessage(messages, { userId });

  return {
    recommendations: response.suggestions,
    basedOn: `Your interest in ${recentCategories.join(', ')}`,
  };
}
