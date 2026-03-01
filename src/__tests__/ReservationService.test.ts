import { ReservationService } from '../services/ReservationService';
import { ReservationCreate } from '../models/Reservation';

describe('ReservationService', () => {
  let service: ReservationService;

  beforeEach(() => {
    service = new ReservationService();
  });

  describe('createReservation', () => {
    it('should create a reservation with valid data', () => {
      const reservationData: ReservationCreate = {
        name: 'John Doe',
        phoneNumber: '+12025551234',
        email: 'john@example.com',
        date: '2024-12-25',
        time: '7:00 PM',
        partySize: 4,
      };

      const reservation = service.createReservation(reservationData);

      expect(reservation).toBeDefined();
      expect(reservation.id).toBeDefined();
      expect(reservation.name).toBe('John Doe');
      expect(reservation.phoneNumber).toBe('+12025551234');
      expect(reservation.status).toBe('confirmed');
    });

    it('should create reservation with special requests', () => {
      const reservationData: ReservationCreate = {
        name: 'Jane Smith',
        phoneNumber: '+12025555678',
        date: '2024-12-26',
        time: '8:00 PM',
        partySize: 2,
        specialRequests: 'Window seat please',
      };

      const reservation = service.createReservation(reservationData);

      expect(reservation.specialRequests).toBe('Window seat please');
    });
  });

  describe('getReservation', () => {
    it('should retrieve a reservation by ID', () => {
      const reservationData: ReservationCreate = {
        name: 'Test User',
        phoneNumber: '+12025551111',
        date: '2024-12-27',
        time: '6:00 PM',
        partySize: 3,
      };

      const created = service.createReservation(reservationData);
      const retrieved = service.getReservation(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test User');
    });

    it('should return undefined for non-existent reservation', () => {
      const retrieved = service.getReservation('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('findReservationsByPhone', () => {
    it('should find all reservations for a phone number', () => {
      const phone = '+12025552222';

      service.createReservation({
        name: 'User One',
        phoneNumber: phone,
        date: '2024-12-28',
        time: '7:00 PM',
        partySize: 2,
      });

      service.createReservation({
        name: 'User One',
        phoneNumber: phone,
        date: '2024-12-29',
        time: '8:00 PM',
        partySize: 4,
      });

      const reservations = service.findReservationsByPhone(phone);

      expect(reservations).toHaveLength(2);
      expect(reservations[0].phoneNumber).toBe(phone);
      expect(reservations[1].phoneNumber).toBe(phone);
    });

    it('should not include cancelled reservations', () => {
      const phone = '+12025553333';

      const res1 = service.createReservation({
        name: 'User Two',
        phoneNumber: phone,
        date: '2024-12-30',
        time: '7:00 PM',
        partySize: 2,
      });

      service.cancelReservation(res1.id);

      const reservations = service.findReservationsByPhone(phone);

      expect(reservations).toHaveLength(0);
    });
  });

  describe('updateReservation', () => {
    it('should update reservation fields', () => {
      const reservation = service.createReservation({
        name: 'Update Test',
        phoneNumber: '+12025554444',
        date: '2024-12-25',
        time: '7:00 PM',
        partySize: 4,
      });

      const updated = service.updateReservation(reservation.id, {
        date: '2024-12-26',
        time: '8:00 PM',
        partySize: 6,
      });

      expect(updated).toBeDefined();
      expect(updated?.date).toBe('2024-12-26');
      expect(updated?.time).toBe('8:00 PM');
      expect(updated?.partySize).toBe(6);
      expect(updated?.name).toBe('Update Test'); // Unchanged field
    });

    it('should return null for non-existent reservation', () => {
      const updated = service.updateReservation('non-existent-id', {
        partySize: 5,
      });

      expect(updated).toBeNull();
    });
  });

  describe('cancelReservation', () => {
    it('should cancel a reservation', () => {
      const reservation = service.createReservation({
        name: 'Cancel Test',
        phoneNumber: '+12025555555',
        date: '2024-12-31',
        time: '9:00 PM',
        partySize: 2,
      });

      const cancelled = service.cancelReservation(reservation.id);

      expect(cancelled).toBeDefined();
      expect(cancelled?.status).toBe('cancelled');
    });

    it('should return null for non-existent reservation', () => {
      const cancelled = service.cancelReservation('non-existent-id');
      expect(cancelled).toBeNull();
    });
  });

  describe('checkAvailability', () => {
    beforeEach(() => {
      // Set max party size for testing
      process.env.MAX_PARTY_SIZE = '10';
    });

    it('should return true when availability exists', () => {
      const isAvailable = service.checkAvailability(
        '2025-01-01',
        '7:00 PM',
        4
      );

      expect(isAvailable).toBe(true);
    });

    it('should return false when capacity is exceeded', () => {
      // Create reservations that fill capacity
      const date = '2025-01-02';
      const time = '7:00 PM';

      // Max capacity = 10 * 3 = 30
      service.createReservation({
        name: 'Large Party 1',
        phoneNumber: '+12025556666',
        date,
        time,
        partySize: 15,
      });

      service.createReservation({
        name: 'Large Party 2',
        phoneNumber: '+12025557777',
        date,
        time,
        partySize: 15,
      });

      // Try to add one more - should fail
      const isAvailable = service.checkAvailability(date, time, 2);

      expect(isAvailable).toBe(false);
    });
  });

  describe('getAllReservations', () => {
    it('should return all active reservations', () => {
      service.createReservation({
        name: 'Active 1',
        phoneNumber: '+12025558888',
        date: '2025-01-03',
        time: '6:00 PM',
        partySize: 2,
      });

      const res2 = service.createReservation({
        name: 'To Cancel',
        phoneNumber: '+12025559999',
        date: '2025-01-04',
        time: '7:00 PM',
        partySize: 4,
      });

      service.cancelReservation(res2.id);

      const allReservations = service.getAllReservations();

      expect(allReservations).toHaveLength(1);
      expect(allReservations[0].name).toBe('Active 1');
    });
  });
});
