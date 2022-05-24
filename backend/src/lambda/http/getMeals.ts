import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getAllMeals } from '../../businessLogic/meals'
import { createLogger } from '../../utils/logger'


const logger = createLogger('getMealsHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Log API calls
  logger.info('Get meals for current user', event)

  // DONE: Get all MEAL items

  // Get auth token for user
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const meals = await getAllMeals(jwtToken)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: meals
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
