import { Request, Response } from 'express';
import { TwilioService } from '../services/TwilioService';

export class VoiceController {
  private twilioService: TwilioService;

  constructor(twilioService: TwilioService) {
    this.twilioService = twilioService;
  }

  /**
   * Handle incoming voice calls
   */
  async handleIncomingCall(req: Request, res: Response): Promise<void> {
    try {
      const { From: from, CallSid: callSid } = req.body;

      console.log(`Incoming call from ${from}, CallSid: ${callSid}`);

      const twiml = await this.twilioService.handleIncomingCall(from, callSid);

      res.type('text/xml');
      res.send(twiml);
    } catch (error) {
      console.error('Error handling incoming call:', error);
      res.status(500).send('Internal server error');
    }
  }

  /**
   * Process speech input from user
   */
  async processSpeech(req: Request, res: Response): Promise<void> {
    try {
      const { 
        SpeechResult: speechResult, 
        From: from, 
        CallSid: callSid 
      } = req.body;

      console.log(`Processing speech from ${from}: "${speechResult}"`);

      const twiml = await this.twilioService.processSpeechInput(
        speechResult,
        from,
        callSid
      );

      res.type('text/xml');
      res.send(twiml);
    } catch (error) {
      console.error('Error processing speech:', error);
      res.status(500).send('Internal server error');
    }
  }

  /**
   * Handle call status callbacks
   */
  handleCallStatus(req: Request, res: Response): void {
    try {
      const { CallSid: callSid, CallStatus: callStatus } = req.body;

      this.twilioService.handleCallStatus(callSid, callStatus);

      res.status(200).send('OK');
    } catch (error) {
      console.error('Error handling call status:', error);
      res.status(500).send('Internal server error');
    }
  }
}
