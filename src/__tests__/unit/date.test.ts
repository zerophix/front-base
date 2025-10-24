/**
 * @jest-environment jsdom
 */

import { formatDate, formatDateTime } from '../../utils/date';

describe('date utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25T10:30:45');
      const result = formatDate(date);
      expect(result).toBe('2023-12-25');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2023-01-05T10:30:45');
      const result = formatDate(date);
      expect(result).toBe('2023-01-05');
    });

    it('should handle leap year', () => {
      const date = new Date('2024-02-29T10:30:45');
      const result = formatDate(date);
      expect(result).toBe('2024-02-29');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time correctly', () => {
      const date = new Date('2023-12-25T10:30:45');
      const result = formatDateTime(date);
      expect(result).toBe('2023-12-25 10:30:45');
    });

    it('should handle single digit hours, minutes, and seconds', () => {
      const date = new Date('2023-01-05T01:05:09');
      const result = formatDateTime(date);
      expect(result).toBe('2023-01-05 01:05:09');
    });

    it('should handle midnight', () => {
      const date = new Date('2023-12-25T00:00:00');
      const result = formatDateTime(date);
      expect(result).toBe('2023-12-25 00:00:00');
    });

    it('should handle end of day', () => {
      const date = new Date('2023-12-25T23:59:59');
      const result = formatDateTime(date);
      expect(result).toBe('2023-12-25 23:59:59');
    });
  });
});