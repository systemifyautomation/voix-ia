# Architecture

This document describes the architecture of the Voix-IA AI receptionist system.

## High-Level Architecture

```
┌─────────────┐
│   Caller    │
│  (Customer) │
└──────┬──────┘
       │ Calls Twilio Number
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                     Twilio Platform                     │
│  ┌──────────────┐         ┌─────────────────┐          │
│  │ Voice Call   │────────▶│  TwiML Response │          │
│  │   Handler    │◀────────│    Generator    │          │
│  └──────────────┘         └─────────────────┘          │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP Webhook
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Voix-IA Server                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │          Controllers Layer                     │    │
│  │  ┌──────────────────┐  ┌────────────────────┐ │    │
│  │  │ VoiceController  │  │ReservationController│ │    │
│  │  │ - Incoming Call  │  │ - REST API         │ │    │
│  │  │ - Process Speech │  │ - CRUD Endpoints   │ │    │
│  │  └────────┬─────────┘  └──────────┬─────────┘ │    │
│  └───────────┼────────────────────────┼───────────┘    │
│              │                        │                 │
│  ┌───────────┼────────────────────────┼───────────┐    │
│  │           │   Services Layer       │           │    │
│  │  ┌────────▼─────────┐   ┌─────────▼────────┐  │    │
│  │  │ TwilioService    │   │ReservationService│  │    │
│  │  │ - Voice/TwiML    │   │ - Create/Update  │  │    │
│  │  │ - SMS Messages   │   │ - Availability   │  │    │
│  │  └────────┬─────────┘   │ - Query/Delete   │  │    │
│  │           │              └──────────────────┘  │    │
│  │  ┌────────▼─────────┐                         │    │
│  │  │   AIService      │                         │    │
│  │  │ - Conversation   │                         │    │
│  │  │ - Context Mgmt   │                         │    │
│  │  │ - Intent Extract │                         │    │
│  │  └────────┬─────────┘                         │    │
│  └───────────┼───────────────────────────────────┘    │
│              │                                          │
│  ┌───────────▼───────────────────────────────────┐    │
│  │              Data Layer                       │    │
│  │  ┌─────────────────────────────────────────┐ │    │
│  │  │ In-Memory Storage (Map)                 │ │    │
│  │  │ - Reservations                          │ │    │
│  │  │ - Conversation Contexts                 │ │    │
│  │  └─────────────────────────────────────────┘ │    │
│  └───────────────────────────────────────────────┘    │
│                                                          │
└──────────────────┬───────────────────────────────────────┘
                   │
       ┌───────────┴──────────────┐
       │                          │
       ▼                          ▼
┌──────────────┐          ┌──────────────┐
│   OpenAI     │          │   Twilio     │
│   API        │          │   API        │
│ - GPT-4      │          │ - Voice      │
│ - Completion │          │ - SMS        │
└──────────────┘          └──────────────┘
```

## Component Details

### 1. Controllers

#### VoiceController
Handles Twilio voice webhooks:
- **handleIncomingCall**: Processes initial call and generates greeting
- **processSpeech**: Handles user speech input and generates responses
- **handleCallStatus**: Manages call lifecycle events

#### ReservationController
Manages REST API endpoints:
- **createReservation**: Creates new reservations
- **getReservation**: Retrieves reservation by ID
- **updateReservation**: Modifies existing reservations
- **cancelReservation**: Cancels reservations
- **checkAvailability**: Checks time slot availability

### 2. Services

#### TwilioService
Integrates with Twilio for voice communications:
- Generates TwiML responses
- Manages call flow (gather, say, hangup)
- Sends SMS confirmations
- Handles voice synthesis (Polly.Joanna)

#### AIService
Powers the AI conversation engine:
- Maintains conversation context per session
- Processes user input through OpenAI GPT-4
- Extracts reservation information from natural language
- Manages conversation flow and intent detection
- Triggers reservation actions when data is complete

#### ReservationService
Manages reservation data:
- CRUD operations for reservations
- Availability checking
- Phone number and name-based searches
- Capacity management

### 3. Data Models

#### Reservation
```typescript
{
  id: string;           // UUID
  name: string;         // Customer name
  phoneNumber: string;  // E.164 format
  email?: string;       // Optional
  date: string;         // YYYY-MM-DD
  time: string;         // HH:MM AM/PM
  partySize: number;    // Number of guests
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
```

#### ConversationContext
```typescript
{
  sessionId: string;    // Call SID
  phoneNumber: string;  // Caller ID
  intent?: 'make' | 'modify' | 'cancel' | 'query';
  currentReservation?: Partial<Reservation>;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

## Call Flow

### Making a Reservation

```
1. Customer calls Twilio number
   ↓
2. Twilio POSTs to /voice/incoming
   ↓
3. VoiceController.handleIncomingCall
   ↓
4. TwilioService generates greeting TwiML
   ↓
5. Twilio speaks greeting to customer
   ↓
6. Customer responds (speech-to-text)
   ↓
7. Twilio POSTs speech result to /voice/process
   ↓
8. VoiceController.processSpeech
   ↓
9. AIService.processUserInput
   ↓
10. OpenAI analyzes intent and extracts data
   ↓
11. AIService builds response
   ↓
12. TwilioService generates TwiML response
   ↓
13. Twilio speaks response to customer
   ↓
14. Loop steps 6-13 until reservation complete
   ↓
15. ReservationService.createReservation
   ↓
16. Confirmation message to customer
   ↓
17. Optional: Send SMS confirmation
   ↓
18. Call ends
```

## Data Flow

### Conversation State Management

1. **Session Initialization**
   - Call SID used as unique session ID
   - Caller phone number captured
   - Empty conversation context created

2. **Intent Detection**
   - AI analyzes first user input
   - Determines intent (make/modify/cancel)
   - Sets context intent

3. **Data Collection**
   - Each user response analyzed
   - Relevant data extracted (name, date, time, party size)
   - Stored in currentReservation object

4. **Validation**
   - Check if all required fields collected
   - Verify availability
   - Confirm with customer

5. **Action Execution**
   - Create/modify/cancel reservation
   - Update database
   - Generate confirmation

6. **Cleanup**
   - Remove conversation context on call end
   - Free memory resources

## Storage Architecture

### Current: In-Memory Storage

**Pros:**
- Fast access
- Simple implementation
- No external dependencies

**Cons:**
- Data lost on restart
- Not suitable for production
- No persistence

### Recommended for Production: PostgreSQL

```
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ reservations table                 │ │
│  │ - id (UUID, PK)                    │ │
│  │ - name (VARCHAR)                   │ │
│  │ - phone_number (VARCHAR)           │ │
│  │ - email (VARCHAR, nullable)        │ │
│  │ - date (DATE)                      │ │
│  │ - time (TIME)                      │ │
│  │ - party_size (INTEGER)             │ │
│  │ - special_requests (TEXT, nullable)│ │
│  │ - status (ENUM)                    │ │
│  │ - created_at (TIMESTAMP)           │ │
│  │ - updated_at (TIMESTAMP)           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Indexes:                                │
│  - idx_phone_number                      │
│  - idx_date_time                         │
│  - idx_status                            │
└─────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

To scale across multiple instances:

1. **Shared Database**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Session Storage**: Use Redis for conversation contexts
3. **Load Balancer**: Distribute incoming webhook requests
4. **Stateless Design**: Ensure each request is independent

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize OpenAI API calls (caching, batching)
- Add database connection pooling

## Security

### API Key Management
- Store in environment variables
- Never commit to version control
- Rotate regularly

### Webhook Security
- Validate Twilio signatures
- Use HTTPS only
- Implement rate limiting

### Data Protection
- Encrypt sensitive data at rest
- Use secure connections (TLS)
- Implement access controls

## Monitoring

### Key Metrics

1. **Call Metrics**
   - Total calls
   - Average call duration
   - Success rate

2. **Reservation Metrics**
   - Reservations created
   - Modifications
   - Cancellations
   - Availability rate

3. **AI Metrics**
   - Average response time
   - Intent detection accuracy
   - Data extraction success rate

4. **System Metrics**
   - API response times
   - Error rates
   - Resource utilization

### Recommended Tools

- **Application Monitoring**: New Relic, Datadog
- **Log Management**: ELK Stack, Splunk
- **Error Tracking**: Sentry
- **Uptime Monitoring**: Pingdom, UptimeRobot

## Future Enhancements

### Phase 2
- Database persistence (PostgreSQL)
- Redis for session management
- SMS confirmations for all reservations
- Email confirmations
- Calendar integration (Google Calendar, Outlook)

### Phase 3
- Multi-language support
- Advanced analytics dashboard
- Customer management system
- Loyalty program integration
- Payment processing

### Phase 4
- Multi-location support
- Franchise management
- Advanced AI features (sentiment analysis, upselling)
- Integration with POS systems
- Real-time capacity management

## API Integration Points

### External Services

1. **Twilio**
   - Voice API
   - SMS API
   - Status Callbacks

2. **OpenAI**
   - Chat Completions API
   - Model: GPT-4

3. **Future Integrations**
   - Google Calendar API
   - SendGrid (email)
   - Stripe (payments)
   - POS systems
   - CRM systems

## Error Handling

### Call Failures
- Graceful degradation
- Retry logic for API calls
- Fallback messages

### AI Failures
- Timeout handling
- Default responses
- Error logging

### Database Failures
- Connection retry
- Transaction rollback
- Data consistency checks

## Performance Optimization

### Caching Strategy
- Cache common AI responses
- Cache business hours/availability rules
- Use CDN for static assets

### Database Optimization
- Index frequently queried fields
- Use connection pooling
- Implement query optimization

### API Optimization
- Batch OpenAI requests when possible
- Use streaming for long responses
- Implement request queuing
