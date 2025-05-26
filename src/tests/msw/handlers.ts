import { rest } from 'msw';

// Mock data for testing
const mockApplications = [
  { id: '1', name: 'Application 1', slug: 'app-1', description: 'Test application 1' },
  { id: '2', name: 'Application 2', slug: 'app-2', description: 'Test application 2' },
];

const mockEnvironments = [
  { id: '1', name: 'Environment 1', slug: 'env-1', description: 'Test environment 1' },
  { id: '2', name: 'Environment 2', slug: 'env-2', description: 'Test environment 2' },
];

const mockLocations = [
  { id: '1', name: 'Location 1', slug: 'loc-1', description: 'Test location 1' },
  { id: '2', name: 'Location 2', slug: 'loc-2', description: 'Test location 2' },
];

// Define API endpoints
export const handlers = [
  // Application handlers
  rest.get('/api/applications', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockApplications));
  }),

  rest.post('/api/applications', async (req, res, ctx) => {
    const body = await req.json();

    return res(ctx.status(201), ctx.json({ ...body, id: '3' }));
  }),

  rest.put('/api/applications/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();

    return res(ctx.status(200), ctx.json({ ...body, id }));
  }),

  rest.delete('/api/applications/:id', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  // Environment handlers
  rest.get('/api/environments', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockEnvironments));
  }),

  rest.post('/api/environments', async (req, res, ctx) => {
    const body = await req.json();

    return res(ctx.status(201), ctx.json({ ...body, id: '3' }));
  }),

  rest.put('/api/environments/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();

    return res(ctx.status(200), ctx.json({ ...body, id }));
  }),

  rest.delete('/api/environments/:id', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  // Location handlers
  rest.get('/api/locations', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockLocations));
  }),

  rest.post('/api/locations', async (req, res, ctx) => {
    const body = await req.json();

    return res(ctx.status(201), ctx.json({ ...body, id: '3' }));
  }),

  rest.put('/api/locations/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();

    return res(ctx.status(200), ctx.json({ ...body, id }));
  }),

  rest.delete('/api/locations/:id', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),
];
