import { http, HttpResponse } from 'msw';

// Sample data
const locations = [
  { id: '1', name: 'São Paulo', slug: 'sao-paulo', order: 1 },
  { id: '2', name: 'Rio de Janeiro', slug: 'rio-de-janeiro', order: 2 },
  { id: '3', name: 'Belo Horizonte', slug: 'belo-horizonte', order: 3 },
];

export const locationsHandlers = [
  // GET /api/locations
  http.get('/api/locations', () => {
    return HttpResponse.json(locations);
  }),

  // GET /api/locations/:id
  http.get('/api/locations/:id', ({ params }) => {
    const { id } = params;
    const location = locations.find((l) => l.id === id);

    if (!location) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(location);
  }),

  // POST /api/locations
  http.post('/api/locations', async ({ request }) => {
    const newLocation = await request.json();
    const id = String(locations.length + 1);
    const createdLocation = { id, ...newLocation };

    locations.push(createdLocation);
    return HttpResponse.json(createdLocation, { status: 201 });
  }),

  // PUT /api/locations/:id
  http.put('/api/locations/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedData = await request.json();
    const index = locations.findIndex((l) => l.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    locations[index] = { ...locations[index], ...updatedData };
    return HttpResponse.json(locations[index]);
  }),

  // DELETE /api/locations/:id
  http.delete('/api/locations/:id', ({ params }) => {
    const { id } = params;
    const index = locations.findIndex((l) => l.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const deleted = locations.splice(index, 1)[0];
    return HttpResponse.json(deleted);
  }),
];
