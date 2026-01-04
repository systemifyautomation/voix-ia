import OpenAI from 'openai';
import { ConversationContext } from '../models/Reservation';
import { ReservationService } from './ReservationService';

export class AIService {
  private openai: OpenAI;
  private reservationService: ReservationService;
  private conversations: Map<string, ConversationContext> = new Map();

  constructor(reservationService: ReservationService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.reservationService = reservationService;
  }

  /**
   * Get or create conversation context
   */
  private getConversationContext(sessionId: string, phoneNumber: string): ConversationContext {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        sessionId,
        phoneNumber,
        conversationHistory: [],
      });
    }
    return this.conversations.get(sessionId)!;
  }

  /**
   * Process user input and generate AI response
   */
  async processUserInput(
    sessionId: string,
    phoneNumber: string,
    userInput: string
  ): Promise<string> {
    const context = this.getConversationContext(sessionId, phoneNumber);
    
    // Add user message to history
    context.conversationHistory.push({
      role: 'user',
      content: userInput,
    });

    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(context);

    try {
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...context.conversationHistory,
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      const assistantResponse = completion.choices[0].message.content || 
        "I'm sorry, I didn't quite catch that. Could you please repeat?";

      // Add assistant response to history
      context.conversationHistory.push({
        role: 'assistant',
        content: assistantResponse,
      });

      // Process any reservation actions based on the conversation
      await this.processReservationIntent(context, userInput, assistantResponse);

      return assistantResponse;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try again.";
    }
  }

  /**
   * Build system prompt with business context
   */
  private buildSystemPrompt(context: ConversationContext): string {
    const businessName = process.env.BUSINESS_NAME || 'Our Restaurant';
    const businessHours = process.env.BUSINESS_HOURS || '9:00 AM - 10:00 PM';

    return `You are a friendly and professional AI receptionist for ${businessName}.
Your role is to help customers with:
1. Making new reservations
2. Modifying existing reservations
3. Canceling reservations
4. Answering questions about reservations

Business hours: ${businessHours}

Guidelines:
- Be warm, professional, and efficient
- Collect required information: name, date, time, party size
- Confirm all details before finalizing
- For modifications or cancellations, verify the customer's identity
- Keep responses concise and natural for voice conversation
- Ask one question at a time
- Always confirm the final action taken

When gathering reservation details, collect:
- Full name
- Date (in format YYYY-MM-DD)
- Time (in format HH:MM AM/PM)
- Party size (number of people)
- Any special requests (optional)

Current conversation context:
${context.intent ? `Intent: ${context.intent}` : 'Intent not yet determined'}
${context.currentReservation ? `Current reservation data: ${JSON.stringify(context.currentReservation)}` : ''}

Respond naturally and conversationally.`;
  }

  /**
   * Process reservation intent from the conversation
   */
  private async processReservationIntent(
    context: ConversationContext,
    userInput: string,
    _assistantResponse: string
  ): Promise<void> {
    const lowerInput = userInput.toLowerCase();

    // Detect intent if not already set
    if (!context.intent) {
      if (lowerInput.includes('make') || lowerInput.includes('book') || lowerInput.includes('reserve')) {
        context.intent = 'make';
      } else if (lowerInput.includes('change') || lowerInput.includes('modify') || lowerInput.includes('update')) {
        context.intent = 'modify';
      } else if (lowerInput.includes('cancel')) {
        context.intent = 'cancel';
      }
    }

    // Extract information from user input
    this.extractReservationData(context, userInput);

    // Execute reservation action if we have enough information
    if (context.intent === 'make' && this.hasCompleteReservationData(context)) {
      await this.executeCreateReservation(context);
    }
  }

  /**
   * Extract reservation data from user input
   */
  private extractReservationData(context: ConversationContext, input: string): void {
    if (!context.currentReservation) {
      context.currentReservation = {};
    }

    // Extract date (simple pattern matching - can be enhanced)
    const dateMatch = input.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      context.currentReservation.date = dateMatch[1];
    }

    // Extract time
    const timeMatch = input.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
    if (timeMatch) {
      context.currentReservation.time = timeMatch[1].toUpperCase();
    }

    // Extract party size
    const partySizeMatch = input.match(/(\d+)\s*(?:people|person|guests?|party)/i);
    if (partySizeMatch) {
      context.currentReservation.partySize = parseInt(partySizeMatch[1], 10);
    }

    // Extract name (simplified - looks for "name is X" or "this is X")
    const nameMatch = input.match(/(?:name is|this is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
    if (nameMatch) {
      context.currentReservation.name = nameMatch[1];
    }
  }

  /**
   * Check if we have all required data for a reservation
   */
  private hasCompleteReservationData(context: ConversationContext): boolean {
    const res = context.currentReservation;
    return !!(
      res?.name &&
      res?.date &&
      res?.time &&
      res?.partySize &&
      context.phoneNumber
    );
  }

  /**
   * Execute reservation creation
   */
  private async executeCreateReservation(context: ConversationContext): Promise<void> {
    const res = context.currentReservation!;
    
    try {
      const reservation = this.reservationService.createReservation({
        name: res.name!,
        phoneNumber: context.phoneNumber,
        email: res.email,
        date: res.date!,
        time: res.time!,
        partySize: res.partySize!,
        specialRequests: res.specialRequests,
      });

      console.log('Reservation created:', reservation);
      // Clear the current reservation from context
      context.currentReservation = undefined;
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  }

  /**
   * Clear conversation context
   */
  clearConversation(sessionId: string): void {
    this.conversations.delete(sessionId);
  }
}
