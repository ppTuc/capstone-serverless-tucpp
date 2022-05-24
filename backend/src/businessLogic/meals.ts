import * as uuid from 'uuid'

import { MealItem } from '../models/MealItem'
import { MealUpdate } from '../models/MealUpdate'

import { MealAccess } from '../dataLayer/mealsAccess'

import { CreateMealRequest } from '../requests/CreateMealRequest'
import { UpdateMealRequest } from '../requests/UpdateMealRequest'

import { parseUserId } from '../auth/utils'

const mealAccess = new MealAccess()

export async function getAllMeals(jwtToken: string): Promise<MealItem[]> {
  const userId = parseUserId(jwtToken) // Use pre-made function
  return mealAccess.getAllMeals(userId)
}

export async function createMeal(createMealRequest: CreateMealRequest, jwtToken: string): Promise<MealItem> {
  const userId = parseUserId(jwtToken) // Use pre-made function
  const itemId = uuid.v4()

  return await mealAccess.createMeal({
    mealId: itemId,
    userId: userId,
    name: createMealRequest.name,
    dayOfWeek: createMealRequest.dayOfWeek,
    createdAt: new Date().toISOString(),
    eaten: false
  })
}

export async function updateMeal(mealId: string, updateMealRequest: UpdateMealRequest, jwtToken: string): Promise<MealUpdate> {
  const userId = parseUserId(jwtToken) // Use pre-made function
  return await mealAccess.updateMeal(mealId, userId, updateMealRequest)
}

export async function deleteMeal(mealId: string, jwtToken: string): Promise<void> {
  const userId = parseUserId(jwtToken) // Use pre-made function
  return await mealAccess.deleteMeal(mealId, userId)
}

export async function setAttachmentUrl(mealId: string, attachmentUrl: string, jwtToken: string): Promise<void> {
  const userId = parseUserId(jwtToken) // Use pre-made function
  return await mealAccess.setAttachmentUrl(mealId, userId, attachmentUrl)
}
