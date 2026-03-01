import { Reservation, ReservationCreate, ReservationUpdate } from '../models/Reservation';
import { v4 as uuidv4 } from 'uuid';

export class ReservationService {
  private reservations: Map<string, Reservation> = new Map();

  /**
   * Create a new reservation
   */
  createReservation(data: ReservationCreate): Reservation {
    const reservation: Reservation = {
      id: uuidv4(),
      ...data,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reservations.set(reservation.id, reservation);
    return reservation;
  }

  /**
   * Get reservation by ID
   */
  getReservation(id: string): Reservation | undefined {
    return this.reservations.get(id);
  }

  /**
   * Find reservations by phone number
   */
  findReservationsByPhone(phoneNumber: string): Reservation[] {
    return Array.from(this.reservations.values()).filter(
      (r) => r.phoneNumber === phoneNumber && r.status !== 'cancelled'
    );
  }

  /**
   * Find reservations by name (case-insensitive)
   */
  findReservationsByName(name: string): Reservation[] {
    const searchName = name.toLowerCase();
    return Array.from(this.reservations.values()).filter(
      (r) => r.name.toLowerCase().includes(searchName) && r.status !== 'cancelled'
    );
  }

  /**
   * Update a reservation
   */
  updateReservation(id: string, updates: ReservationUpdate): Reservation | null {
    const reservation = this.reservations.get(id);
    if (!reservation) {
      return null;
    }

    const updatedReservation: Reservation = {
      ...reservation,
      ...updates,
      updatedAt: new Date(),
    };

    this.reservations.set(id, updatedReservation);
    return updatedReservation;
  }

  /**
   * Cancel a reservation
   */
  cancelReservation(id: string): Reservation | null {
    const reservation = this.reservations.get(id);
    if (!reservation) {
      return null;
    }

    reservation.status = 'cancelled';
    reservation.updatedAt = new Date();
    this.reservations.set(id, reservation);
    return reservation;
  }

  /**
   * Get all reservations for a specific date
   */
  getReservationsByDate(date: string): Reservation[] {
    return Array.from(this.reservations.values()).filter(
      (r) => r.date === date && r.status !== 'cancelled'
    );
  }

  /**
   * Check availability for a specific date and time
   */
  checkAvailability(date: string, time: string, partySize: number): boolean {
    const reservationsAtTime = this.getReservationsByDate(date).filter(
      (r) => r.time === time
    );
    
    const totalPartySize = reservationsAtTime.reduce(
      (sum, r) => sum + r.partySize,
      0
    );
    
    // Simple availability check - can be customized based on restaurant capacity
    const maxCapacity = parseInt(process.env.MAX_PARTY_SIZE || '20', 10) * 3;
    return totalPartySize + partySize <= maxCapacity;
  }

  /**
   * Get all active reservations
   */
  getAllReservations(): Reservation[] {
    return Array.from(this.reservations.values()).filter(
      (r) => r.status !== 'cancelled'
    );
  }
}
