export class ValidationError extends Error {
  errors: string[]

  constructor (message: string, errors: string[]) {
    super(message)
    this.errors = errors

    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}
