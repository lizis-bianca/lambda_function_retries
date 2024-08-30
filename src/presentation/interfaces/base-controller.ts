import { type Record } from '@/application/invoice'

export abstract class BaseController {
  declare event: { Records: Record[] }

  protected abstract handler (): Promise<any>

  constructor () {
    this.execute = this.execute.bind(this)
  }

  async execute (event: any): Promise<any> {
    this.event = event

    return await this.handler()
  }
}
