import { apiClient } from "./axios"

export type CloudinaryUploadResponse = {
  url: string
}

export const cloudinaryApi = {
  upload: async (file: File): Promise<CloudinaryUploadResponse> => {
    const formData = new FormData()
    formData.append("image", file)

    const response = await apiClient.post<CloudinaryUploadResponse>("/cloudinary/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },
}
