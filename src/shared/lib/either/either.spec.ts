import { left, right } from './either'

describe('Either', () => {
  describe('left()', () => {
    it('should be make left call', () => {
      const result = left('string')

      expect(result.isLeft()).toBeTruthy()
      expect(result.isRight()).toBeFalsy()
      expect(result.value).toBe('string')
    })
  })

  describe('right', () => {
    it('should be make right call', () => {
      const result = right('string')

      expect(result.isLeft()).toBeFalsy()
      expect(result.isRight()).toBeTruthy()
      expect(result.value).toBe('string')
    })
  })
})
