import { injectable } from '@/main/dependency-injection/decorator'
import { ChangeMessageVisibilityCommand, type ChangeMessageVisibilityCommandOutput, SQSClient, type SendMessageBatchCommandOutput, SendMessageBatchCommand } from '@aws-sdk/client-sqs'
import { type InterfaceSQSQueue } from '@/domain/contracts/aws/sqs/aws-sqs'
import { InternalError } from '@/shared/errors'
import { right, type Either, left } from '@/shared/lib/either'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const splitArray = require('split-array')

export interface batch {
  error: object[]
  body: string
  messageId: string
  receiptHandle: string
  attributes: {
    ApproximateReceiveCount: string
    SentTimestamp: string
  }
}

@injectable()
export class SQSQueue implements InterfaceSQSQueue {
 async changeMessageVisibility (receiptHandle: string, queueUrl: string, delaySeconds?: number): Promise<Either<InternalError, ChangeMessageVisibilityCommandOutput>> {
  try {
    const client = new SQSClient({})

    const input = new ChangeMessageVisibilityCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
      VisibilityTimeout: delaySeconds
    })

      const result = await client.send(input)

      return right(result)
    } catch (exp) {
      console.error(exp)
      return left(new InternalError(
        'Unable to re-send attempt to queue, internal error',
        exp
      ))
    }
}

async sendMessage (batchMessage: batch[], queueUrl: string): Promise<Either<InternalError, SendMessageBatchCommandOutput>> {
  try {
    const spilttedArray = splitArray(batchMessage, 10) as batch[][]
    const params: { QueueUrl: string, Entries: any[] } = {
      QueueUrl: queueUrl,
      Entries: []
    }

    for (const arr of spilttedArray) {
      for (const message of arr) {
            params.Entries.push({
              Id: message.messageId,
              MessageBody: JSON.stringify({ body: message.body, error: message.error })
            })
      }
    }

    console.log('params::> ', params)

    const client = new SQSClient({})

    const sqsPayload = new SendMessageBatchCommand(params)
    const result = await client.send(sqsPayload)
    console.log('sendMessage:result:> ', result)
    return right(result)
    } catch (exp) {
      console.error(exp)
      return left(new InternalError(
        'Unable to send query to dead queue, internal error',
        exp
      ))
    }
}
}
