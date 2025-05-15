import { CreateEnvironmentDto, Environment, UpdateEnvironmentDto } from '@/types/environment';
import { fetchApi } from './api';

export async function getEnvironments(): Promise<Environment[]> {
  return fetchApi<Environment[]>('/environments');
}

export async function getEnvironment(id: string): Promise<Environment> {
  return fetchApi<Environment>(`/environments/${id}`);
}

export async function createEnvironment(data: CreateEnvironmentDto): Promise<Environment> {
  return fetchApi<Environment>('/environments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEnvironment(
  id: string,
  data: UpdateEnvironmentDto
): Promise<Environment> {
  return fetchApi<Environment>(`/environments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEnvironment(id: string): Promise<Environment> {
  return fetchApi<Environment>(`/environments/${id}`, {
    method: 'DELETE',
  });
}
