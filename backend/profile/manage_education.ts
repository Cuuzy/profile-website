import { api } from "encore.dev/api";
import { profileDB } from "./db";

export interface CreateEducationRequest {
  institution: string;
  location: string;
  startYear: number;
  endYear: number;
}

export interface UpdateEducationRequest {
  id: number;
  institution: string;
  location: string;
  startYear: number;
  endYear: number;
}

export interface DeleteEducationRequest {
  id: number;
}

export interface EducationResponse {
  success: boolean;
}

// Creates a new education entry
export const createEducation = api<CreateEducationRequest, EducationResponse>(
  { expose: true, method: "POST", path: "/education" },
  async (req) => {
    await profileDB.exec`
      INSERT INTO education (institution, location, start_year, end_year)
      VALUES (${req.institution}, ${req.location}, ${req.startYear}, ${req.endYear})
    `;

    return { success: true };
  }
);

// Updates an existing education entry
export const updateEducation = api<UpdateEducationRequest, EducationResponse>(
  { expose: true, method: "PUT", path: "/education/:id" },
  async (req) => {
    await profileDB.exec`
      UPDATE education 
      SET institution = ${req.institution}, 
          location = ${req.location}, 
          start_year = ${req.startYear}, 
          end_year = ${req.endYear}
      WHERE id = ${req.id}
    `;

    return { success: true };
  }
);

// Deletes an education entry
export const deleteEducation = api<DeleteEducationRequest, EducationResponse>(
  { expose: true, method: "DELETE", path: "/education/:id" },
  async (req) => {
    await profileDB.exec`
      DELETE FROM education WHERE id = ${req.id}
    `;

    return { success: true };
  }
);
