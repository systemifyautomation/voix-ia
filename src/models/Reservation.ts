export interface Reservation {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationCreate {
  name: string;
  phoneNumber: string;
  email?: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
}

export interface ReservationUpdate {
  date?: string;
  time?: string;
  partySize?: number;
  specialRequests?: string;
}

export interface ConversationContext {
  sessionId: string;
  phoneNumber: string;
  intent?: 'make' | 'modify' | 'cancel' | 'query';
  currentReservation?: Partial<Reservation>;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
