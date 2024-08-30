import { type batch } from '@/infrastructure/aws/sqs/aws-sqs'
import { type InternalError } from '@/shared/errors'
import { type Either } from '@/shared/lib/either'
import { type ChangeMessageVisibilityCommandOutput, type SendMessageBatchCommandOutput } from '@aws-sdk/client-sqs'
export interface InterfaceSQSQueue {
  changeMessageVisibility: (receiptHandle: string, queueUrl: string, delaySeconds?: number) => Promise<Either<InternalError, ChangeMessageVisibilityCommandOutput>>
  sendMessage: (batchMessage: batch[], queueUrl: string) => Promise<Either<InternalError, SendMessageBatchCommandOutput>>
}
