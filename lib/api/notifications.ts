import { apiClient } from "./axios"


export const notificationsApi = {
  updateSettings: async (data: NotificationSettingsPayload): Promise<unknown> => {
    const response = await apiClient.patch<unknown>("/notifications/settings", data)
    return response.data
  },
}
