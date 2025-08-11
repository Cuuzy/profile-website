import { api } from "encore.dev/api";
import { profileDB } from "./db";

export interface CreateProjectRequest {
  title: string;
  description: string;
  technologies?: string;
  demoUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  featured: boolean;
}

export interface UpdateProjectRequest {
  id: number;
  title: string;
  description: string;
  technologies?: string;
  demoUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  featured: boolean;
}

export interface DeleteProjectRequest {
  id: number;
}

export interface ProjectResponse {
  success: boolean;
}

// Creates a new project
export const createProject = api<CreateProjectRequest, ProjectResponse>(
  { expose: true, method: "POST", path: "/projects" },
  async (req) => {
    await profileDB.exec`
      INSERT INTO projects (title, description, technologies, demo_url, github_url, image_url, featured)
      VALUES (${req.title}, ${req.description}, ${req.technologies ?? null}, ${req.demoUrl ?? null}, ${req.githubUrl ?? null}, ${req.imageUrl ?? null}, ${req.featured})
    `;
    return { success: true };
  }
);

// Updates an existing project
export const updateProject = api<UpdateProjectRequest, ProjectResponse>(
  { expose: true, method: "PUT", path: "/projects/:id" },
  async (req) => {
    await profileDB.exec`
      UPDATE projects
      SET title = ${req.title},
          description = ${req.description},
          technologies = ${req.technologies ?? null},
          demo_url = ${req.demoUrl ?? null},
          github_url = ${req.githubUrl ?? null},
          image_url = ${req.imageUrl ?? null},
          featured = ${req.featured},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
    `;
    return { success: true };
  }
);

// Deletes a project
export const deleteProject = api<DeleteProjectRequest, ProjectResponse>(
  { expose: true, method: "DELETE", path: "/projects/:id" },
  async (req) => {
    await profileDB.exec`
      DELETE FROM projects WHERE id = ${req.id}
    `;
    return { success: true };
  }
);
