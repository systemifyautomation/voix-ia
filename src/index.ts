import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { ReservationService } from './services/ReservationService';
import { AIService } from './services/AIService';
import { TwilioService } from './services/TwilioService';
import { VoiceController } from './controllers/VoiceController';
import { ReservationController } from './controllers/ReservationController';

// Load environment variables
dotenv.config();

class App {
  public app: Express;
  private reservationService: ReservationService;
  private aiService: AIService;
  private twilioService: TwilioService;
  private voiceController: VoiceController;
  private reservationController: ReservationController;

  constructor() {
    this.app = express();
    this.initializeServices();
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeServices(): void {
    this.reservationService = new ReservationService();
    this.aiService = new AIService(this.reservationService);
    this.twilioService = new TwilioService(this.aiService);
    this.voiceController = new VoiceController(this.twilioService);
    this.reservationController = new ReservationController(this.reservationService);
  }

  private initializeMiddlewares(): void {
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());

    // CORS middleware for development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'healthy', 
        service: 'voix-ia',
        timestamp: new Date().toISOString() 
      });
    });

    // Twilio voice webhooks
    this.app.post('/voice/incoming', (req, res) => 
      this.voiceController.handleIncomingCall(req, res)
    );

    this.app.post('/voice/process', (req, res) => 
      this.voiceController.processSpeech(req, res)
    );

    this.app.post('/voice/status', (req, res) => 
      this.voiceController.handleCallStatus(req, res)
    );

    // REST API endpoints for reservations
    this.app.post('/api/reservations', (req, res) => 
      this.reservationController.createReservation(req, res)
    );

    this.app.get('/api/reservations/:id', (req, res) => 
      this.reservationController.getReservation(req, res)
    );

    this.app.get('/api/reservations/phone/:phoneNumber', (req, res) => 
      this.reservationController.getReservationsByPhone(req, res)
    );

    this.app.get('/api/reservations', (req, res) => 
      this.reservationController.getAllReservations(req, res)
    );

    this.app.put('/api/reservations/:id', (req, res) => 
      this.reservationController.updateReservation(req, res)
    );

    this.app.delete('/api/reservations/:id', (req, res) => 
      this.reservationController.cancelReservation(req, res)
    );

    this.app.get('/api/availability', (req, res) => 
      this.reservationController.checkAvailability(req, res)
    );

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  public listen(): void {
    const port = process.env.PORT || 3000;
    this.app.listen(port, () => {
      console.log(`🎙️  Voix-IA Server running on port ${port}`);
      console.log(`📞 Twilio webhooks ready at /voice/*`);
      console.log(`🔌 API endpoints ready at /api/*`);
      console.log(`✅ Health check available at /health`);
    });
  }
}

// Start the server
const app = new App();
app.listen();

export default app;
