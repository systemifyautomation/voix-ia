# Voix-IA 🎙️

An AI-powered voice receptionist for managing restaurant reservations via phone calls. Built with Twilio for voice communication and OpenAI for intelligent conversation handling.

## Features

✨ **Natural Voice Interaction**: Customers can call and speak naturally to make, modify, or cancel reservations

🤖 **AI-Powered Conversations**: Uses OpenAI GPT-4 for intelligent, context-aware responses

📞 **Twilio Integration**: Professional voice handling with text-to-speech capabilities

📊 **Reservation Management**: Complete CRUD operations for reservations

🚀 **Easy Deployment**: Dockerized for simple deployment anywhere

📱 **SMS Confirmations**: Automatic SMS confirmations for reservations (optional)

## Architecture

The system consists of several key components:

- **VoiceController**: Handles incoming Twilio voice webhooks
- **AIService**: Processes natural language using OpenAI and manages conversation context
- **ReservationService**: Manages reservation data and availability
- **TwilioService**: Handles Twilio voice and SMS operations

## Prerequisites

- Node.js 20+ or Docker
- Twilio account with a phone number
- OpenAI API key
- ngrok or similar tool for local development (to expose webhooks)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/systemifyautomation/voix-ia.git
cd voix-ia
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=3000
NODE_ENV=development

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_actual_account_sid
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI Configuration
OPENAI_API_KEY=your_actual_openai_api_key
OPENAI_MODEL=gpt-4

# Business Configuration
BUSINESS_NAME=Your Restaurant Name
BUSINESS_HOURS=9:00 AM - 10:00 PM
MAX_PARTY_SIZE=20
```

### 4. Build and run

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

**Using Docker:**
```bash
docker-compose up -d
```

### 5. Set up Twilio webhooks

1. Expose your local server using ngrok:
   ```bash
   ngrok http 3000
   ```

2. In your Twilio console, configure your phone number's voice webhook:
   - **Voice & Fax** → **A Call Comes In**: `https://your-ngrok-url.ngrok.io/voice/incoming`
   - **Status Callback URL**: `https://your-ngrok-url.ngrok.io/voice/status`

## Usage

### Making a Call

1. Call your Twilio phone number
2. The AI receptionist will greet you and ask how it can help
3. Speak naturally: "I'd like to make a reservation for 4 people"
4. Follow the AI's prompts to provide:
   - Your name
   - Date and time
   - Party size
   - Any special requests

### Example Conversations

**Making a reservation:**
```
AI: Hello! Thank you for calling [Business Name]. I'm your AI receptionist. 
    How can I assist you today?

You: I'd like to make a reservation

AI: Great! I'd be happy to help you make a reservation. 
    Can you tell me your name?

You: John Smith

AI: Thank you, John. What date would you like to reserve?

You: Tomorrow at 7 PM

AI: Perfect! And how many people will be dining with us?

You: Four people

AI: Excellent! I have you down for a reservation for 4 people 
    tomorrow at 7:00 PM under the name John Smith. 
    Is there anything else I can help you with?
```

**Modifying a reservation:**
```
You: I need to change my reservation

AI: I can help you with that. Can you provide your name and 
    the current reservation details?
```

**Canceling a reservation:**
```
You: I need to cancel my reservation

AI: I'm sorry to hear that. Can you provide your name and 
    phone number to locate your reservation?
```

## API Endpoints

The system also provides REST API endpoints for managing reservations:

### Create Reservation
```http
POST /api/reservations
Content-Type: application/json

{
  "name": "John Smith",
  "phoneNumber": "+1234567890",
  "email": "john@example.com",
  "date": "2024-12-25",
  "time": "7:00 PM",
  "partySize": 4,
  "specialRequests": "Window seat preferred"
}
```

### Get Reservation
```http
GET /api/reservations/:id
```

### Get Reservations by Phone
```http
GET /api/reservations/phone/:phoneNumber
```

### Update Reservation
```http
PUT /api/reservations/:id
Content-Type: application/json

{
  "date": "2024-12-26",
  "time": "8:00 PM"
}
```

### Cancel Reservation
```http
DELETE /api/reservations/:id
```

### Check Availability
```http
GET /api/availability?date=2024-12-25&time=7:00 PM&partySize=4
```

## Deployment

### Deploy with Docker

1. Build the image:
   ```bash
   docker build -t voix-ia .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env voix-ia
   ```

Or use docker-compose:
```bash
docker-compose up -d
```

### Deploy to Cloud Platforms

**Heroku:**
```bash
heroku create your-app-name
heroku config:set TWILIO_ACCOUNT_SID=xxx
heroku config:set TWILIO_AUTH_TOKEN=xxx
heroku config:set OPENAI_API_KEY=xxx
git push heroku main
```

**AWS/GCP/Azure:**
- Use the provided Dockerfile
- Set environment variables in your cloud platform's configuration
- Ensure the service is publicly accessible for Twilio webhooks

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment | No | production |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Yes | - |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Yes | - |
| `TWILIO_PHONE_NUMBER` | Twilio Phone Number | Yes | - |
| `OPENAI_API_KEY` | OpenAI API Key | Yes | - |
| `OPENAI_MODEL` | OpenAI Model | No | gpt-4 |
| `BUSINESS_NAME` | Your business name | No | Our Restaurant |
| `BUSINESS_HOURS` | Business hours | No | 9:00 AM - 10:00 PM |
| `MAX_PARTY_SIZE` | Max party size | No | 20 |

## Development

### Project Structure

```
voix-ia/
├── src/
│   ├── controllers/
│   │   ├── VoiceController.ts      # Twilio webhook handlers
│   │   └── ReservationController.ts # REST API handlers
│   ├── services/
│   │   ├── AIService.ts             # OpenAI integration
│   │   ├── TwilioService.ts         # Twilio integration
│   │   └── ReservationService.ts    # Reservation management
│   ├── models/
│   │   └── Reservation.ts           # Data models
│   ├── utils/
│   │   └── helpers.ts               # Helper functions
│   └── index.ts                     # Application entry point
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Customization

### Modifying AI Behavior

Edit `src/services/AIService.ts` and customize the `buildSystemPrompt()` method to change how the AI responds to customers.

### Adding Database Persistence

The current implementation uses in-memory storage. To add database persistence:

1. Install a database driver (e.g., `pg` for PostgreSQL)
2. Update `ReservationService.ts` to use database queries instead of the Map
3. Add database connection configuration to `.env`

### SMS Confirmations

Uncomment and configure SMS confirmation calls in the reservation flow to automatically send SMS confirmations when reservations are made or modified.

## Troubleshooting

### Twilio webhooks not working
- Ensure your server is publicly accessible
- Check that webhook URLs are correctly configured in Twilio console
- Verify ngrok is running (for local development)

### AI not responding correctly
- Check OpenAI API key is valid
- Verify you have sufficient OpenAI API credits
- Review conversation logs in console output

### Reservations not being saved
- Check server logs for errors
- Ensure all required fields are being collected

## Security Considerations

- Never commit `.env` file with real credentials
- Use environment variables for all sensitive data
- Consider adding authentication for REST API endpoints
- Implement rate limiting for production use
- Use HTTPS in production (required by Twilio)

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Credits

Built with:
- [Twilio](https://www.twilio.com/) - Voice and SMS
- [OpenAI](https://openai.com/) - AI Language Model
- [Express](https://expressjs.com/) - Web Framework
- [TypeScript](https://www.typescriptlang.org/) - Language