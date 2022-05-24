import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { CreateMealRequest } from '../../requests/CreateMealRequest'
import { createMeal } from '../../businessLogic/meals'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createMealHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Log API calls
  logger.info('Create a meal for current user', event)

  // DONE: Implement creating a new MEAL item
  const newMeal: CreateMealRequest = JSON.parse(event.body)

  // Get auth token for user
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const newItem = await createMeal(newMeal, jwtToken)

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
