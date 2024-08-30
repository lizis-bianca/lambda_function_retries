import 'module-alias/register'
import 'reflect-metadata'
import { type SQSHandler, type SQSEvent } from 'aws-lambda'
import env from '@/main/config/env'
import { InstanceFactory } from '@/main/dependency-injection/instanceFactory'
import dependenciesRegistry from './dependency-injection/registration'
import {
    MyProcessController
} from '@/presentation/controllers/process/process-controller'

function configureEnvironment (context: any): void {
  const functionName: string = context.functionName

  if (functionName?.startsWith((process.env.STACK_PROD ?? ''))) {
    process.env.ENVIRONMENT = 'production'
  } else if (functionName?.startsWith(process.env.STACK_TEST ?? '')) {
    process.env.ENVIRONMENT = 'test'
  } else {
    process.env.ENVIRONMENT = 'development'
  }

  env.environment = process.env.ENVIRONMENT
  console.info(`::> environment: ${env.environment} `)
  console.info(`::> functionName: ${functionName} `)
}

async function executeQueue (event: any): Promise<SQSHandler> {
  return await InstanceFactory(MyProcessController).execute(event)
}

export const handler = async (event: SQSEvent, context: any): Promise<SQSHandler | string> => {
  try {
    configureEnvironment(context)
    dependenciesRegistry()

    const response = await executeQueue(event)
    return response
  } catch (error) {
    let errorMessage = 'Error processing queue messages'
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`
    }
    return errorMessage
  }
}
