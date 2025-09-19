import { describe, it, expect } from 'vitest'
import { Time } from '@/lib/Timing.js';
import { Duration } from '@/lib/Duration.js';

describe('Time operations', () => {
  it('adds duration to time', () => {
    expect(Time.parse("10:00").add(Duration.parse("15")).eq(Time.parse("10:15"))).toBe(true)
  })

  it('subtracts duration from time', () => {
    expect(Time.parse("10:15").sub(Duration.parse("15")).eq(Time.parse("10:00"))).toBe(true)
  })

  it('calculates time difference', () => {
    expect(Time.parse("10:15").sub(Time.parse("10:00")).totalMinutes).toBe(15)
    expect(Time.parse("10:00").sub(Time.parse("10:15")).totalMinutes).toBe(-15)
  })
})
