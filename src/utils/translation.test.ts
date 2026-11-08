import { describe, expect, it } from 'vitest'
import { sameWords } from './translation'

describe('sameWords', () => {
  it('ignores case, spacing and punctuation', () => {
    expect(sameWords('Fresh coffee, better moments.', 'Fresh Coffee. Better Moments.')).toBe(true)
  })

  it('compares Khmer across a line break in the headline', () => {
    expect(sameWords('កាហ្វេស្រស់ សម្រាប់ពេលវេលាដ៏ល្អរបស់អ្នក', 'កាហ្វេស្រស់សម្រាប់ពេលវេលាដ៏ល្អរបស់អ្នក')).toBe(true)
  })

  /** Khmer vowels are marks: stripping them would call different words equal. */
  it('keeps Khmer vowels significant', () => {
    expect(sameWords('កាហ្វេ', 'កហ្វ')).toBe(false)
  })

  it('tells different sentences apart', () => {
    expect(sameWords('Fresh coffee', 'Fresh tea')).toBe(false)
  })
})
