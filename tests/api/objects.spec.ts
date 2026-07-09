import { test, expect } from '@playwright/test';

// Single source of truth for the API base URL. Hoisted so the target lives in
// one place — easier to maintain, and trivial to point at a different
// environment (e.g. staging) by changing one line.
const BASE_URL = 'https://api.restful-api.dev';

test.describe('Objects API - CRUD', () => {
  test('GET /objects returns a list of objects', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/objects`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('POST /objects creates a new object', async ({ request }) => {
    const newObject = {
      name: 'Test Laptop',
      data: {
        year: 2024,
        price: 1499.99,
        cpuModel: 'Intel Core i7',
      },
    };

    const response = await request.post(`${BASE_URL}/objects`, {
      data: newObject,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(newObject.name);
    expect(body.data).toEqual(newObject.data);
    expect(body.id).toBeTruthy();
  });

  test.describe('operations on a single object', () => {
    let createdId: string;

    test.beforeEach(async ({ request }) => {
      const response = await request.post(`${BASE_URL}/objects`, {
        data: {
          name: 'Object Under Test',
          data: { year: 2024, price: 999.99 },
        },
      });
      const body = await response.json();
      createdId = body.id;
    });

    test('GET /objects/:id returns the created object', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/objects/${createdId}`);

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.id).toBe(createdId);
      expect(body.name).toBe('Object Under Test');
    });

    test('PUT /objects/:id updates the object', async ({ request }) => {
      const updatedData = {
        name: 'Updated Object',
        data: { year: 2025, price: 1299.99 },
      };

      const response = await request.put(`${BASE_URL}/objects/${createdId}`, {
        data: updatedData,
      });

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.id).toBe(createdId);
      expect(body.name).toBe('Updated Object');
      expect(body.data).toEqual(updatedData.data);
    });

    test('DELETE /objects/:id removes the object', async ({ request }) => {
      const deleteResponse = await request.delete(`${BASE_URL}/objects/${createdId}`);

      expect(deleteResponse.status()).toBe(200);

      // Verify the object is actually gone: a follow-up GET should now fail.
      const getResponse = await request.get(`${BASE_URL}/objects/${createdId}`);
      expect(getResponse.status()).toBe(404);
    });
  });
});

test.describe('Objects API - negative cases', () => {
  test('GET /objects/:id with a nonexistent ID returns 404', async ({ request }) => {
    // Use an ID guaranteed not to exist rather than a random one that might collide.
    const nonexistentId = 'this-id-does-not-exist-999999';

    const response = await request.get(`${BASE_URL}/objects/${nonexistentId}`);

    expect(response.status()).toBe(404);
  });

  test('GET /collections without an API key is rejected', async ({ request }) => {
    // The authenticated tier requires an 'x-api-key' header.
    // Sending no key should be refused — verifying auth is enforced,
    // and reproducible without committing any real credentials.
    const response = await request.get(`${BASE_URL}/collections`);

    expect(response.status()).toBe(403);
  });
});