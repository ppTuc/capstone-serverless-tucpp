/**
 * Fields in a request to update a single MEAL item.
 */
export interface UpdateMealRequest {
  name: string
  dayOfWeek: string
  eaten: boolean
}
