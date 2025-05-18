// types/application.ts
export interface Application {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationDto {
  name: string;
  slug: string;
  description: string;
}

export interface UpdateApplicationDto {
  name?: string;
  slug?: string;
  description?: string;
}
