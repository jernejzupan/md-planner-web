import { describe, it, expect } from 'vitest'
import { Duration } from '@/lib/Duration.js'

describe('Duration.isValid', () => {
  it('validates correct formats', () => {
    expect(Duration.isValid("0")).toBe(true)
    expect(Duration.isValid("5h59")).toBe(true)
    expect(Duration.isValid("text")).toBe(false)
  })
})

describe('Duration.parse', () => {
  it('parses simple durations', () => {
    expect(Duration.parse("0").eq(new Duration(0))).toBe(true)
    expect(Duration.parse("1").eq(new Duration(1))).toBe(true)
    expect(Duration.parse("59").eq(new Duration(59))).toBe(true)
    expect(Duration.parse("1h").eq(new Duration(60))).toBe(true)
    expect(Duration.parse("1h1").eq(new Duration(61))).toBe(true)
    expect(Duration.parse("1h40").eq(new Duration(100))).toBe(true)
    expect(Duration.parse("5h59").eq(new Duration(359))).toBe(true)
    expect(Duration.parse("1D").eq(new Duration(360))).toBe(true)
    expect(Duration.parse("1D1h").eq(new Duration(420))).toBe(true)
    expect(Duration.parse("1W").eq(new Duration(1800))).toBe(true)
    expect(Duration.parse("1M").eq(new Duration(7200))).toBe(true)
    expect(Duration.parse("1Y").eq(new Duration(86400))).toBe(true)
  })
})

describe('Duration.format', () => {
  it('formats durations correctly', () => {
    expect(new Duration(0).fmt()).toBe("0")
    expect(new Duration(1).fmt()).toBe("1")
    expect(new Duration(59).fmt()).toBe("59")
    expect(new Duration(-59).fmt()).toBe("-59")
    expect(new Duration(60).fmt()).toBe("1h")
    expect(new Duration(61).fmt()).toBe("1h1")
    expect(new Duration(100).fmt()).toBe("1h40")
    expect(new Duration(359).fmt()).toBe("5h59")
    expect(new Duration(360).fmt()).toBe("1D")
    expect(new Duration(361).fmt()).toBe("1D")
    expect(new Duration(389).fmt()).toBe("1D")
    expect(new Duration(390).fmt()).toBe("1D1h")
  })
})

describe('Duration arithmetic', () => {
  it('adds and subtracts durations', () => {
    expect(new Duration(1).add(new Duration(1)).eq(new Duration(2))).toBe(true)
    expect(new Duration(2).sub(new Duration(1)).eq(new Duration(1))).toBe(true)
    expect(new Duration(2).add(new Duration(-1)).eq(new Duration(1))).toBe(true)
    expect(new Duration(1).neg().eq(new Duration(-1))).toBe(true)
  })
})

describe('Duration sum', () => {
  it('sums a list of durations', () => {
    const durations = [new Duration(25), new Duration(10)]
    const total = durations.reduce((acc, d) => acc.add(d), new Duration(0))
    expect(total.eq(new Duration(35))).toBe(true)
  })
})
