import { InterfaceSQSQueue } from '@/domain/contracts/aws/sqs/aws-sqs'
import { inject, injectable } from '@/main/dependency-injection/decorator'
import { ValidationError, InternalError } from '@/shared/errors'
import { left, right, type Either } from '@/shared/lib/either'
import env from '@/main/config/env'

@injectable()
export class ProcessService {
  constructor (
    @inject('SQSRepository') private readonly sqsService: InterfaceSQSQueue
  ) {}

  #retry: boolean = false

  get retry (): boolean {
    return this.#retry
  }

  set retry (value: boolean) {
    this.#retry = value
  }

  async processQueue (records: any[]): Promise<
    Either<
      any,
      {
        processed: object[]
        notProcessed: object[]
        rescheduled: object[]
      }
    >
  > {
    const processed: object[] = []
    const notProcessed: object[] = []
    const rescheduled: object[] = []

    for (const record of records) {
      this.retry = false
      const recordParsed: any = JSON.parse(record.body)
      const processReturn = await this.process(recordParsed)
      if (this.retry) {
        const scheduleReAttempt = await this.scheduleAttempt(record)
        if (scheduleReAttempt.isRight()) {
          const $metadata = JSON.parse(JSON.stringify(scheduleReAttempt.value))
            .value.$metadata

          rescheduled.push({
            messageId: record.messageId,
            success: processReturn.value.success,
            xml_enviado: processReturn.value.xml_enviado,
            status: processReturn.value.status,
            data: processReturn.value.data,
            attempts: $metadata.attempts
          })
          continue
        }
      }

      if (processReturn.isLeft()) {
        let errorMessage = ''

        if (processReturn.value instanceof ValidationError) {
          const cause = JSON.stringify(processReturn.value.errors)
          errorMessage = `${processReturn.value.message}: ${cause}`
          console.log('ERROR:>> ', errorMessage)
          notProcessed.push({ ...record, error: errorMessage })
        } else if (processReturn.value instanceof InternalError) {
          const cause = processReturn.value.cause as string
          errorMessage = `${processReturn.value.message}: ${cause}`
          console.log('ERROR:>> ', JSON.stringify(errorMessage))
          notProcessed.push({ ...record, error: errorMessage })
        }
        console.log(`--> error processing message: ${errorMessage}`)
      }

      if (processReturn.isRight() && !this.retry) {
        processed.push(processReturn.value)
        console.log(`--> processed message: ${JSON.stringify(processReturn.value)}`)
      }
    }

    return right({ processed, notProcessed, rescheduled })
  }

  async process (
    record: any
  ): Promise<Either<ValidationError | InternalError, any>> {
    try {
      const result = await this.foo(record)
      if (result.isLeft()) return left(result.value)

      if (result.isRight()) {
        if (!result.value.success) {
            this.retry = true
            return right(result.value)
        }
      }

      return right(result.value)
    } catch (err) {
      return left(
        new InternalError(`Internal error ${JSON.stringify(err)}`, err)
      )
    }
  }

  async foo(record: any): Promise<Either<ValidationError | InternalError, { success: boolean }>> {
    try {
      // Simulation of an asynchronous operation
      const simulatedAsyncOperation = new Promise<{ success: boolean }>((resolve, reject) => {
        // Success or error simulation based on a condition
        if (record.shouldSucceed) {
          resolve({ success: true });
        } else if (!record.shouldSucceed){
          resolve({ success: false })
        }
        else {
          reject(new ValidationError('Validation failed', []));
        }
      });
  
      // Wait for the result of the asynchronous operation
      const result = await simulatedAsyncOperation;
      return right(result)
  
    } catch (error) {
      if (error instanceof ValidationError) {
        return left(error);
      } else {
        return left(new InternalError('Internal error', error));
      }
    }
  }
  

  private async scheduleAttempt (
    record: any
  ): Promise<Either<InternalError, any>> {
    /* RETRY */
   // captures the ApproximateReceiveCount field and stores information if it =< 1
    const sqsApproximateReceiveCount = Number(
      record.attributes.ApproximateReceiveCount
    )
    console.log('sqsApproximateReceiveCount:>>', sqsApproximateReceiveCount)
    // calculate trial exponential with jitter, modify visibility and return the queue
    const result = await this.returnMessageWithBackoff(
      Number(record.attributes.SentTimestamp),
      sqsApproximateReceiveCount,
      record.receiptHandle
    )
    console.log('result:>>>', result.value)
    if (result.isLeft()) return left(result.value)
    return right(result.value)
  }

  private async returnMessageWithBackoff (
    sentTimestamp: number,
    retryCount: number,
    receiptHandle: string
  ): Promise<Either<InternalError, object>> {
    // MAX_VISIBILITY_TIMEOUT = 42900 (43200 - 300)
    try {
      const visibilityTimeout = Number(env.eventBaseBackoff) * 2 ** (retryCount - 1)
      const initialSentSQSTimestamp = sentTimestamp / 1000
      const maxVisibilityTime = initialSentSQSTimestamp + Number(env.maxVisibilityTimeout)
      const secondsUntilTimeout = maxVisibilityTime - new Date().getTime() / 1000
      const timeoutCapped = Math.round(
        Math.min(secondsUntilTimeout, visibilityTimeout)
      )
      console.log('timeoutCapped:>>', timeoutCapped)

      const result = await this.sqsService.changeMessageVisibility(
        receiptHandle,
        'inProcessQueue',
        timeoutCapped
      )
      console.log('result:changeMessageVisibility>>', JSON.stringify(result))
      return right(result)
    } catch (err) {
      return left(
        new InternalError('Unable to schedule re-attempt', err)
      )
    }
  }
}
