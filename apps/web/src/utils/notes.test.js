import { describe, it, expect } from 'vitest';
import { formatDate, sortNotes, preview } from './notes.js';

describe('Notes utilities', () => {
  it('should format date correctly', () => {
    const timestamp = 1640995200000; // 2022-01-01
    const date = formatDate(timestamp);
    expect(date).toBeTruthy();
    expect(typeof date).toBe('string');
  });

  it('should sort notes by pinned status', () => {
    const notes = [
      { id: '1', pinned: false, updatedAt: 1000 },
      { id: '2', pinned: true, updatedAt: 2000 },
      { id: '3', pinned: false, updatedAt: 3000 }
    ];
    
    const sorted = sortNotes(notes);
    
    expect(sorted[0].pinned).toBe(true);
    expect(sorted[0].id).toBe('2');
  });

  it('should preview text correctly', () => {
    const longText = 'a'.repeat(100);
    const result = preview(longText);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result.endsWith('…')).toBe(true);
  });

  it('should not truncate short text', () => {
    const shortText = 'Hello World';
    const result = preview(shortText);
    expect(result).toBe(shortText);
  });
});

