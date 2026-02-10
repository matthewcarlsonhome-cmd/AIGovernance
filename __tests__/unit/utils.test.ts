import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active')).toBe('base active');
    expect(cn('base', false && 'active')).toBe('base');
  });

  it('should merge Tailwind classes correctly', () => {
    // tailwind-merge should keep the last conflicting class
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar');
  });

  it('should handle empty string', () => {
    expect(cn('')).toBe('');
  });

  it('should handle object syntax', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should handle array syntax', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });
});
