import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { setAttachmentUrl } from '../../businessLogic/meals'
import { createLogger } from '../../utils/logger'

import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('generateUploadUrlHandler')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Generate upload url', event)

  // DONE: Return a presigned URL to upload a file for a MEAL item with the provided id
  const mealId = event.pathParameters.mealId

  // Get auth token for user
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  // Create an image start
  const imageId = uuid.v4()

  setAttachmentUrl(
    mealId,
    `https://${bucketName}.s3.amazonaws.com/${imageId}`,
    jwtToken
  )

  const uploadUrl = getUploadUrl(imageId)

  // Create an image end

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: Number(urlExpiration) // convert string to int
  })
}
