import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { UpdateMealRequest } from '../../requests/UpdateMealRequest'
import { updateMeal } from '../../businessLogic/meals'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateMealHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Log API calls
  logger.info('Update a meal for current user', event)

  // DONE: Update a MEAL item with the provided id using values in the "updatedMeal" object
  const mealId = event.pathParameters.mealId
  const updatedMeal: UpdateMealRequest = JSON.parse(event.body)

  // Get auth token for user
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  await updateMeal(mealId, updatedMeal, jwtToken)

  return {
    statusCode: 204,
    body: ''
  }
})

handler.use(
  cors({
    credentials: true
  })
)
