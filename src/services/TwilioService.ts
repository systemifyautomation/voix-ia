import twilio from 'twilio';
import { AIService } from './AIService';

const VoiceResponse = twilio.twiml.VoiceResponse;

export class TwilioService {
  private aiService: AIService;
  private client: twilio.Twilio;

  constructor(aiService: AIService) {
    this.aiService = aiService;
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    this.client = twilio(accountSid, authToken);
  }

  /**
   * Handle incoming voice call
   */
  async handleIncomingCall(from: string, callSid: string): Promise<string> {
    const twiml = new VoiceResponse();

    const greeting = `Hello! Thank you for calling ${process.env.BUSINESS_NAME || 'our restaurant'}. 
I'm your AI receptionist. I can help you make, modify, or cancel a reservation. 
How can I assist you today?`;

    twiml.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US',
      },
      greeting
    );

    // Gather user input
    const gather = twiml.gather({
      input: ['speech'],
      action: '/voice/process',
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-US',
    });

    gather.say(
      {
        voice: 'Polly.Joanna',
      },
      'Please tell me what you would like to do.'
    );

    // If no input, repeat
    twiml.say(
      {
        voice: 'Polly.Joanna',
      },
      "I didn't receive any input. Please call back when you're ready."
    );

    return twiml.toString();
  }

  /**
   * Process speech input from user
   */
  async processSpeechInput(
    speechResult: string,
    from: string,
    callSid: string
  ): Promise<string> {
    const twiml = new VoiceResponse();

    try {
      // Process the speech with AI
      const response = await this.aiService.processUserInput(
        callSid,
        from,
        speechResult
      );

      // Say the AI response
      twiml.say(
        {
          voice: 'Polly.Joanna',
          language: 'en-US',
        },
        response
      );

      // Check if conversation should continue
      if (this.shouldContinueConversation(response)) {
        const gather = twiml.gather({
          input: ['speech'],
          action: '/voice/process',
          method: 'POST',
          speechTimeout: 'auto',
          language: 'en-US',
        });

        gather.say(
          {
            voice: 'Polly.Joanna',
          },
          'What else would you like to do?'
        );
      } else {
        twiml.say(
          {
            voice: 'Polly.Joanna',
          },
          'Thank you for calling. Have a great day!'
        );
        twiml.hangup();
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      twiml.say(
        {
          voice: 'Polly.Joanna',
        },
        "I apologize, but I'm having trouble processing your request. Please try calling back."
      );
      twiml.hangup();
    }

    return twiml.toString();
  }

  /**
   * Determine if conversation should continue based on AI response
   */
  private shouldContinueConversation(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    const endPhrases = [
      'have a great day',
      'goodbye',
      'thank you for calling',
      'reservation is confirmed',
      'cancelled your reservation',
    ];

    return !endPhrases.some((phrase) => lowerResponse.includes(phrase));
  }

  /**
   * Send SMS confirmation
   */
  async sendSMSConfirmation(
    to: string,
    reservationDetails: string
  ): Promise<void> {
    try {
      await this.client.messages.create({
        body: reservationDetails,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });
      console.log(`SMS confirmation sent to ${to}`);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }

  /**
   * Handle call status callback
   */
  handleCallStatus(callSid: string, callStatus: string): void {
    console.log(`Call ${callSid} status: ${callStatus}`);
    
    if (callStatus === 'completed') {
      // Clean up conversation context when call ends
      this.aiService.clearConversation(callSid);
    }
  }
}
