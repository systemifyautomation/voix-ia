import { Request, Response } from 'express';
import { ReservationService } from '../services/ReservationService';
import { ReservationCreate, ReservationUpdate } from '../models/Reservation';

export class ReservationController {
  private reservationService: ReservationService;

  constructor(reservationService: ReservationService) {
    this.reservationService = reservationService;
  }

  /**
   * Create a new reservation
   */
  createReservation(req: Request, res: Response): void {
    try {
      const reservationData: ReservationCreate = req.body;

      // Validate required fields
      if (!reservationData.name || !reservationData.phoneNumber || 
          !reservationData.date || !reservationData.time || !reservationData.partySize) {
        res.status(400).json({ 
          error: 'Missing required fields: name, phoneNumber, date, time, partySize' 
        });
        return;
      }

      // Check availability
      const isAvailable = this.reservationService.checkAvailability(
        reservationData.date,
        reservationData.time,
        reservationData.partySize
      );

      if (!isAvailable) {
        res.status(409).json({ 
          error: 'No availability for the requested date and time' 
        });
        return;
      }

      const reservation = this.reservationService.createReservation(reservationData);

      res.status(201).json(reservation);
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get reservation by ID
   */
  getReservation(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const reservation = this.reservationService.getReservation(id);

      if (!reservation) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
      }

      res.json(reservation);
    } catch (error) {
      console.error('Error getting reservation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get reservations by phone number
   */
  getReservationsByPhone(req: Request, res: Response): void {
    try {
      const { phoneNumber } = req.params;
      const reservations = this.reservationService.findReservationsByPhone(phoneNumber);

      res.json(reservations);
    } catch (error) {
      console.error('Error getting reservations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update a reservation
   */
  updateReservation(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const updates: ReservationUpdate = req.body;

      const reservation = this.reservationService.updateReservation(id, updates);

      if (!reservation) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
      }

      res.json(reservation);
    } catch (error) {
      console.error('Error updating reservation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Cancel a reservation
   */
  cancelReservation(req: Request, res: Response): void {
    try {
      const { id } = req.params;

      const reservation = this.reservationService.cancelReservation(id);

      if (!reservation) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
      }

      res.json(reservation);
    } catch (error) {
      console.error('Error canceling reservation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all reservations
   */
  getAllReservations(req: Request, res: Response): void {
    try {
      const reservations = this.reservationService.getAllReservations();
      res.json(reservations);
    } catch (error) {
      console.error('Error getting all reservations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Check availability
   */
  checkAvailability(req: Request, res: Response): void {
    try {
      const { date, time, partySize } = req.query;

      if (!date || !time || !partySize) {
        res.status(400).json({ 
          error: 'Missing required parameters: date, time, partySize' 
        });
        return;
      }

      const isAvailable = this.reservationService.checkAvailability(
        date as string,
        time as string,
        parseInt(partySize as string, 10)
      );

      res.json({ available: isAvailable });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
