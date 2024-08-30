import { ProcessService } from '@/application/process/process-service'
import { inject, injectable } from '@/main/dependency-injection/decorator'
import { BaseController } from '@/presentation/interfaces/base-controller'

@injectable()
export class MyProcessController extends BaseController {
  constructor (
    @inject('ProcessService')
    private readonly processService: ProcessService
  ) {
    super()
  }

  protected async handler (): Promise<{ batchItemFailures: object[] }> {
    const records = this.event.Records

    if (records === undefined || records.length <= 0) {
      throw new Error('There are no items in the queue')
    }

    try {
      const result = await this.processService.processQueue(records)
      const identifiers: object[] = []

      if (result.isRight()) {
      result.value.rescheduled.forEach((identifier: any) => {
        identifiers.push({
          itemIdentifier: identifier.messageId
        })
      })
    }
    console.log({ message: 'Queue processed', data: JSON.stringify(result.value) })
    console.log(JSON.stringify({ batchItemFailures: identifiers }))

      return {
        batchItemFailures: identifiers
      }
    } catch (error: any) {
      console.error('::> MyProcessController', error)
      console.log(error.message ?? 'internal server error')
      return error
    }
  }
}
