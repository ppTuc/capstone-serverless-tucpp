import { apiEndpoint } from '../config'
import { Meal } from '../types/Meal';
import { CreateMealRequest } from '../types/CreateMealRequest';
import Axios from 'axios'
import { UpdateMealRequest } from '../types/UpdateMealRequest';

export async function getMeals(idToken: string): Promise<Meal[]> {
  console.log('Fetching meals')

  const response = await Axios.get(`${apiEndpoint}/meals`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Meals:', response.data)
  return response.data.items
}

export async function createMeal(
  idToken: string,
  newMeal: CreateMealRequest
): Promise<Meal> {
  const response = await Axios.post(`${apiEndpoint}/meals`,  JSON.stringify(newMeal), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchMeal(
  idToken: string,
  mealId: string,
  updatedMeal: UpdateMealRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/meals/${mealId}`, JSON.stringify(updatedMeal), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteMeal(
  idToken: string,
  mealId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/meals/${mealId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  mealId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/meals/${mealId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
