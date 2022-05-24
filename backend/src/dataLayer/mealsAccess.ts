import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { MealItem } from '../models/MealItem'
import { MealUpdate } from '../models/MealUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET

export class MealAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly mealsTable = process.env.MEALS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX
  ) { }

  async getAllMeals(userId: string): Promise<MealItem[]> {
    console.log('Getting all meals')

    const result = await this.docClient.query({
      TableName: this.mealsTable,
      IndexName: this.userIdIndex, // For faster query retrival
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false // To retrive latest meals at the top
    }).promise()

    const items = result.Items
    return items as MealItem[]
  }

  async createMeal(mealItem: MealItem): Promise<MealItem> {
    await this.docClient.put({
      TableName: this.mealsTable,
      Item: mealItem
    }).promise()

    return mealItem
  }

  async updateMeal(mealId: string, userId: string, mealUpdate: MealUpdate): Promise<MealUpdate> {
    await this.docClient.update({
      TableName: this.mealsTable,
      Key: {
        mealId,
        userId
      },
      UpdateExpression: 'set #n = :name, eaten = :eaten, dayOfWeek = :dayOfWeek',
      ExpressionAttributeValues: {
        ':name': mealUpdate.name,
        ':eaten': mealUpdate.eaten,
        ':dayOfWeek': mealUpdate.dayOfWeek
      },
      ExpressionAttributeNames: { '#n': 'name' },
      ReturnValues: 'UPDATED_NEW',
    }).promise()

    return mealUpdate
  }

  async deleteMeal(mealId: string, userId: string): Promise<void> {
    // DONE: If item has image, delete attached image from s3
    // Get MEAL item of interest
    const result = await this.docClient.get({
      TableName: this.mealsTable,
      Key: {
        mealId,
        userId
      }
    }).promise()

    if (result) {
      if (result.Item.attachmentUrl) {
        // Get ending of URL
        const imageUrl = result.Item.attachmentUrl
        const imageKey = imageUrl.substring(imageUrl.lastIndexOf('/') + 1)

        console.log('Deleting attached image from s3: ', imageKey)

        // Use function to delete image from s3
        deleteS3AttachedImage(bucketName, imageKey)
      }
    }

    await this.docClient.delete({
      TableName: this.mealsTable,
      Key: {
        mealId,
        userId
      }
    }).promise()
  }

  async setAttachmentUrl(mealId: string, userId: string, attachmentUrl: string): Promise<void> {
    // DONE: If pre-existing image, delete attached image from s3
    // Get MEAL item of interest
    const result = await this.docClient.get({
      TableName: this.mealsTable,
      Key: {
        mealId,
        userId
      }
    }).promise()

    if (result) {
      if (result.Item.attachmentUrl) {
        // Get ending of URL
        const imageUrl = result.Item.attachmentUrl
        const imageKey = imageUrl.substring(imageUrl.lastIndexOf('/') + 1)

        console.log('Deleting attached image from s3: ', imageKey)

        // Use function to delete image from s3
        deleteS3AttachedImage(bucketName, imageKey)
      }
    }

    await this.docClient.update({
      TableName: this.mealsTable,
      Key: {
        mealId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

// Function deletes an object from an s3 bucket
function deleteS3AttachedImage(bucket: string, key: string) {
  s3.deleteObject({ Bucket: bucket, Key: key }, function (err, data) {
    if (err) console.log(err, err.stack) // an error occurred
    else console.log(data) // successful response
  })
}
