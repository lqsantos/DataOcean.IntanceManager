// types/cluster.ts
export interface Cluster {
  id: string;
  name: string;
  slug: string;
  locationIds: string[];
  inUse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClusterDto {
  name: string;
  slug: string;
  locationIds: string[];
}

export interface UpdateClusterDto {
  name?: string;
  slug?: string;
  locationIds?: string[];
}
