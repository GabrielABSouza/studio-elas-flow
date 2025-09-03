import { describe, it, expect } from 'vitest';
import {
  formatLocalDate,
  parseISODate,
  shiftDays,
  hhmmRange,
  indexAppointments,
  detectOverlaps,
  getWeekStart,
  getMonthStart,
  isValidDate,
  isValidTime,
} from '../utils';
import { Appointment } from '../types';

describe('Agenda Utils', () => {
  describe('formatLocalDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      expect(formatLocalDate(date)).toBe('2025-01-15');
    });

    it('should handle single digit months and days', () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      expect(formatLocalDate(date)).toBe('2025-01-05');
    });
  });

  describe('parseISODate', () => {
    it('should parse ISO date correctly', () => {
      const result = parseISODate('2025-01-15');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January = 0
      expect(result.getDate()).toBe(15);
    });
  });

  describe('shiftDays', () => {
    it('should shift days forward', () => {
      expect(shiftDays('2025-01-15', 5)).toBe('2025-01-20');
    });

    it('should shift days backward', () => {
      expect(shiftDays('2025-01-15', -5)).toBe('2025-01-10');
    });

    it('should handle month boundaries', () => {
      expect(shiftDays('2025-01-30', 5)).toBe('2025-02-04');
    });
  });

  describe('hhmmRange', () => {
    it('should generate time slots with default params', () => {
      const slots = hhmmRange(9, 11, 30);
      expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30']);
    });

    it('should generate time slots with custom step', () => {
      const slots = hhmmRange(9, 10, 15);
      expect(slots).toEqual(['09:00', '09:15', '09:30', '09:45']);
    });

    it('should handle single hour range', () => {
      const slots = hhmmRange(9, 10, 30);
      expect(slots).toEqual(['09:00', '09:30']);
    });
  });

  describe('indexAppointments', () => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        customer: { id: '1', name: 'Test Client' },
        professionalId: 'prof1',
        startsAt: '2025-01-15T09:00:00-03:00',
        endsAt: '2025-01-15T10:00:00-03:00',
        status: 'scheduled',
        procedures: [],
      },
      {
        id: '2',
        customer: { id: '2', name: 'Test Client 2' },
        professionalId: 'prof1',
        startsAt: '2025-01-15T09:00:00-03:00',
        endsAt: '2025-01-15T10:00:00-03:00',
        status: 'scheduled',
        procedures: [],
      },
      {
        id: '3',
        customer: { id: '3', name: 'Test Client 3' },
        professionalId: 'prof2',
        startsAt: '2025-01-15T10:30:00-03:00',
        endsAt: '2025-01-15T11:30:00-03:00',
        status: 'scheduled',
        procedures: [],
      },
    ];

    it('should index appointments by professional and time slot', () => {
      const index = indexAppointments(mockAppointments, '2025-01-15');
      
      // Should have 2 professionals
      expect(index.size).toBe(2);
      
      // Prof1 should have appointments at 09:00
      const prof1Slots = index.get('prof1');
      expect(prof1Slots?.get('09:00')).toHaveLength(2);
      
      // Prof2 should have appointment at 10:30
      const prof2Slots = index.get('prof2');
      expect(prof2Slots?.get('10:30')).toHaveLength(1);
    });

    it('should filter by date correctly', () => {
      const index = indexAppointments(mockAppointments, '2025-01-16');
      expect(index.size).toBe(0);
    });
  });

  describe('detectOverlaps', () => {
    it('should detect overlapping appointments for same professional', () => {
      const appointments: Appointment[] = [
        {
          id: '1',
          customer: { id: '1', name: 'Client 1' },
          professionalId: 'prof1',
          startsAt: '2025-01-15T09:00:00-03:00',
          endsAt: '2025-01-15T10:00:00-03:00',
          status: 'scheduled',
          procedures: [],
        },
        {
          id: '2',
          customer: { id: '2', name: 'Client 2' },
          professionalId: 'prof1',
          startsAt: '2025-01-15T09:30:00-03:00',
          endsAt: '2025-01-15T10:30:00-03:00',
          status: 'scheduled',
          procedures: [],
        },
      ];

      const overlaps = detectOverlaps(appointments);
      expect(overlaps.has('1')).toBe(true);
      expect(overlaps.has('2')).toBe(true);
    });

    it('should not detect overlaps for different professionals', () => {
      const appointments: Appointment[] = [
        {
          id: '1',
          customer: { id: '1', name: 'Client 1' },
          professionalId: 'prof1',
          startsAt: '2025-01-15T09:00:00-03:00',
          endsAt: '2025-01-15T10:00:00-03:00',
          status: 'scheduled',
          procedures: [],
        },
        {
          id: '2',
          customer: { id: '2', name: 'Client 2' },
          professionalId: 'prof2',
          startsAt: '2025-01-15T09:00:00-03:00',
          endsAt: '2025-01-15T10:00:00-03:00',
          status: 'scheduled',
          procedures: [],
        },
      ];

      const overlaps = detectOverlaps(appointments);
      expect(overlaps.size).toBe(0);
    });
  });

  describe('getWeekStart', () => {
    it('should return monday for any day of the week', () => {
      expect(getWeekStart('2025-01-15')).toBe('2025-01-13'); // Wed -> Mon
      expect(getWeekStart('2025-01-13')).toBe('2025-01-13'); // Mon -> Mon
      expect(getWeekStart('2025-01-19')).toBe('2025-01-13'); // Sun -> Mon
    });
  });

  describe('getMonthStart', () => {
    it('should return first day of month', () => {
      expect(getMonthStart('2025-01-15')).toBe('2025-01-01');
      expect(getMonthStart('2025-02-28')).toBe('2025-02-01');
    });
  });

  describe('validation functions', () => {
    describe('isValidDate', () => {
      it('should validate correct date format', () => {
        expect(isValidDate('2025-01-15')).toBe(true);
        expect(isValidDate('2025-12-31')).toBe(true);
      });

      it('should reject invalid formats', () => {
        expect(isValidDate('2025/01/15')).toBe(false);
        expect(isValidDate('01-15-2025')).toBe(false);
        expect(isValidDate('invalid')).toBe(false);
      });
    });

    describe('isValidTime', () => {
      it('should validate correct time format', () => {
        expect(isValidTime('09:30')).toBe(true);
        expect(isValidTime('23:59')).toBe(true);
      });

      it('should reject invalid formats', () => {
        expect(isValidTime('9:30')).toBe(false);
        expect(isValidTime('25:00')).toBe(false);
        expect(isValidTime('invalid')).toBe(false);
      });
    });
  });
});