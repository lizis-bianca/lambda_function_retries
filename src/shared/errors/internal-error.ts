export class InternalError extends Error {
  constructor (message: string, cause: any) {
    super(message, { cause })

    Object.setPrototypeOf(this, InternalError.prototype)
  }
}
