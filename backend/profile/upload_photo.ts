import { api } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";
import { profileDB } from "./db";

const profilePhotos = new Bucket("profile-photos", {
  public: true,
});

export interface UploadPhotoRequest {
  photoData: string; // base64 encoded image data
  fileName: string;
}

export interface UploadPhotoResponse {
  success: boolean;
  photoUrl: string;
}

// Uploads a new profile photo
export const uploadPhoto = api<UploadPhotoRequest, UploadPhotoResponse>(
  { expose: true, method: "POST", path: "/profile/photo" },
  async (req) => {
    // Convert base64 to buffer
    const base64Data = req.photoData.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = req.fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `profile-${timestamp}.${extension}`;
    
    // Upload to bucket
    await profilePhotos.upload(uniqueFileName, buffer, {
      contentType: `image/${extension}`,
    });
    
    // Get public URL
    const photoUrl = profilePhotos.publicUrl(uniqueFileName);
    
    // Update profile in database
    await profileDB.exec`
      UPDATE profiles 
      SET photo_url = ${photoUrl},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM profiles ORDER BY id DESC LIMIT 1)
    `;
    
    return {
      success: true,
      photoUrl,
    };
  }
);
