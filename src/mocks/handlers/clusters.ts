// mocks/handlers/clusters.ts
import { http, HttpResponse } from 'msw';
import { v4 as uuid } from 'uuid';

import type { Cluster, CreateClusterDto, UpdateClusterDto } from '@/types/cluster';

// Initial mock data
const clusters: Cluster[] = [
  {
    id: '1',
    name: 'Cluster Produção',
    slug: 'prod-cluster',
    locationIds: ['1', '2'],
    inUse: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
  },
  {
    id: '2',
    name: 'Cluster Desenvolvimento',
    slug: 'dev-cluster',
    locationIds: ['1'],
    inUse: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
  },
  {
    id: '3',
    name: 'Cluster Homologação',
    slug: 'hom-cluster',
    locationIds: ['2', '3'],
    inUse: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
  },
];

export const clusterHandlers = [
  // GET /api/clusters - Listar todos os clusters
  http.get('/api/clusters', () => {
    return HttpResponse.json(clusters);
  }),

  // POST /api/clusters - Criar um novo cluster
  http.post('/api/clusters', async ({ request }) => {
    const data = (await request.json()) as CreateClusterDto;

    // Validar dados
    if (!data.name || !data.slug || !data.locationIds || data.locationIds.length === 0) {
      return new HttpResponse('Dados inválidos', { status: 400 });
    }

    // Verificar se já existe um cluster com o mesmo slug
    const existingCluster = clusters.find((c) => c.slug === data.slug);

    if (existingCluster) {
      return new HttpResponse('Já existe um cluster com este slug', { status: 409 });
    }

    // Criar novo cluster
    const newCluster: Cluster = {
      id: uuid(),
      name: data.name,
      slug: data.slug,
      locationIds: data.locationIds,
      inUse: false, // Novos clusters começam como não utilizados
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Adicionar à lista
    clusters.push(newCluster);

    return HttpResponse.json(newCluster);
  }),

  // GET /api/clusters/:id - Obter um cluster específico
  http.get('/api/clusters/:id', ({ params }) => {
    const { id } = params;
    const cluster = clusters.find((c) => c.id === id);

    if (!cluster) {
      return new HttpResponse('Cluster não encontrado', { status: 404 });
    }

    return HttpResponse.json(cluster);
  }),

  // PUT /api/clusters/:id - Atualizar um cluster
  http.put('/api/clusters/:id', async ({ request, params }) => {
    const { id } = params;
    const data = (await request.json()) as UpdateClusterDto;
    const index = clusters.findIndex((c) => c.id === id);

    if (index === -1) {
      return new HttpResponse('Cluster não encontrado', { status: 404 });
    }

    // Verificar se o slug já existe em outro cluster
    if (data.slug) {
      const slugExists = clusters.some((c) => c.slug === data.slug && c.id !== id);

      if (slugExists) {
        return new HttpResponse('Já existe um cluster com este slug', { status: 409 });
      }
    }

    // Atualizar o cluster
    const updatedCluster: Cluster = {
      ...clusters[index],
      name: data.name ?? clusters[index].name,
      slug: data.slug ?? clusters[index].slug,
      locationIds: data.locationIds ?? clusters[index].locationIds,
      updatedAt: new Date().toISOString(),
    };

    clusters[index] = updatedCluster;

    return HttpResponse.json(updatedCluster);
  }),

  // DELETE /api/clusters/:id - Excluir um cluster
  http.delete('/api/clusters/:id', ({ params }) => {
    const { id } = params;
    const index = clusters.findIndex((c) => c.id === id);

    if (index === -1) {
      return new HttpResponse('Cluster não encontrado', { status: 404 });
    }

    // Verificar se o cluster está em uso
    if (clusters[index].inUse) {
      return new HttpResponse('Não é possível excluir um cluster em uso', { status: 400 });
    }

    // Remover o cluster
    clusters.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
