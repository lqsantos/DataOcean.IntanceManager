export interface Environment {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnvironmentDto {
  name: string;
  slug: string;
  order?: number;
}

export interface UpdateEnvironmentDto {
  name?: string;
  slug?: string;
  order?: number;
}
