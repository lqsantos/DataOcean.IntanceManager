export interface Location {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CreateLocationDto {
  name: string;
  slug: string;
}

export interface UpdateLocationDto {
  name?: string;
  slug?: string;
}
