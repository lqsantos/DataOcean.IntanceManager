import { http, HttpResponse } from 'msw';

import type { Location } from '@/types/location';

// Estado inicial
let locations: Location[] = [
  {
    id: '1',
    name: 'Brasil',
    slug: 'brasil',
    createdAt: '2023-01-01T12:00:00Z',
  },
  {
    id: '2',
    name: 'Estados Unidos',
    slug: 'estados-unidos',
    createdAt: '2023-01-02T14:30:00Z',
  },
  {
    id: '3',
    name: 'Europa',
    slug: 'europa',
    createdAt: '2023-01-03T09:15:00Z',
  },
];

export const locationHandlers = [
  // GET /api/locations
  http.get('/api/locations', () => {
    // This should trigger a warning since 'no-console' rule is set to 'warn'
    console.log('🔄 Handler interceptou GET /api/locations'); // Also removed semicolon to test if semicolon rule works

    return HttpResponse.json(locations);
  }),

  // POST /api/locations
  http.post('/api/locations', async ({ request }) => {
    const data = await request.json();

    // Validações
    if (!data.name || !data.slug) {
      return new HttpResponse(JSON.stringify({ message: 'Nome e slug são obrigatórios' }), {
        status: 400,
      });
    }

    // Verificar se o slug já existe
    if (locations.some((loc) => loc.slug === data.slug)) {
      return new HttpResponse(
        JSON.stringify({ message: `Já existe uma localidade com o slug "${data.slug}"` }),
        { status: 409 }
      );
    }

    const newLocation = {
      id: Date.now().toString(),
      name: data.name,
      slug: data.slug,
      createdAt: new Date().toISOString(),
    };

    locations = [...locations, newLocation];

    return HttpResponse.json(newLocation, { status: 201 });
  }),

  // PATCH /api/locations/:id
  http.patch('/api/locations/:id', async ({ params, request }) => {
    const { id } = params;
    const data = await request.json();

    // Verificar se a localidade existe
    const locationIndex = locations.findIndex((loc) => loc.id === id);

    if (locationIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: 'Localidade não encontrada' }), {
        status: 404,
      });
    }

    // Verificar se o slug já existe (e não é a mesma localidade)
    if (
      data.slug &&
      data.slug !== locations[locationIndex].slug &&
      locations.some((loc) => loc.slug === data.slug)
    ) {
      return new HttpResponse(
        JSON.stringify({ message: `Já existe uma localidade com o slug "${data.slug}"` }),
        { status: 409 }
      );
    }

    const updatedLocation = {
      ...locations[locationIndex],
      ...data,
    };

    locations = [
      ...locations.slice(0, locationIndex),
      updatedLocation,
      ...locations.slice(locationIndex + 1),
    ];

    return HttpResponse.json(updatedLocation);
  }),

  // DELETE /api/locations/:id
  http.delete('/api/locations/:id', ({ params }) => {
    const { id } = params;

    // Verificar se a localidade existe
    const locationIndex = locations.findIndex((loc) => loc.id === id);

    if (locationIndex === -1) {
      return new HttpResponse(JSON.stringify({ message: 'Localidade não encontrada' }), {
        status: 404,
      });
    }

    locations = [...locations.slice(0, locationIndex), ...locations.slice(locationIndex + 1)];

    return new HttpResponse(null, { status: 204 });
  }),
];
