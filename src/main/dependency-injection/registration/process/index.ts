import containerApp from '@/main/dependency-injection/container'
import { type InterfaceSQSQueue } from '@/domain/contracts/aws/sqs/aws-sqs'
import { SQSQueue } from '@/infrastructure/aws/sqs/aws-sqs'
import { ProcessService } from '@/application/process/process-service'

export default function processDependenciesRegistry (): void {
    containerApp.register('ProcessService', ProcessService)
    containerApp.register<InterfaceSQSQueue>('SQSRepository', SQSQueue)
  }