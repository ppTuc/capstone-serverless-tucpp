export interface MealItem {
  userId: string
  mealId: string
  createdAt: string
  name: string
  dayOfWeek: string
  eaten: boolean
  attachmentUrl?: string
}
