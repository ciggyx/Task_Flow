const request = require('supertest');

const URL_USER = 'http://localhost:3001';
const URL_TASK = 'http://localhost:3000';

jest.setTimeout(30_000);

describe('Flujo E2E - Usuario crea proyecto y tarea (API-driven)', () => {
  let accessToken: string | null = null;
  let dashboardId: number | null = null;
  let taskId: number | null = null;

  // genero datos únicos para poder re-ejecutar sin conflictos
  const uniqueSuffix = Date.now();
  const userPayload = {
    name: `johndoe_${uniqueSuffix}`,
    email: `johndoe_${uniqueSuffix}@example.com`,
    password: 'johndoe123',
  };

  // 1. Crear usuario
  it('1) Debería registrar un usuario correctamente', async () => {
    const res = await request(URL_USER)
      .post('/auth/register')
      .send(userPayload)
      .set('Accept', 'application/json');

    expect(201).toBe(res.status);
    if (res.body) {
      if (res.body.message) {
        expect(res.body.message).toMatch(/created/i);
      }
    }
  });

  // helper: intenta loguear con distintas formas y obtiene accessToken
  async function obtenerTokenConFallback(): Promise<string> {
    const attempts = [{ identifierName: userPayload.name, password: userPayload.password }];

    for (const body of attempts) {
      try {
        const r = await request(URL_USER)
          .post('/auth/login')
          .send(body)
          .set('Accept', 'application/json');
        if (r.status === 201 && r.body) {
          const token = r.body.accessToken;
          if (token && typeof token === 'string') return token;
        }
      } catch (e) {}
    }

    throw new Error(
      'No se pudo obtener accessToken. Revisá el endpoint /auth/login y los campos esperados.',
    );
  }

  // 2. Login del usuario y obtener token
  it('2) Debería loguear al usuario y devolver accessToken', async () => {
    accessToken = await obtenerTokenConFallback();
    expect(accessToken).toBeTruthy();
  });

  // 3. Crear dashboard
  it('3) Debería crear un dashboard correctamente', async () => {
    if (!accessToken) throw new Error('accessToken no disponible');

    const res = await request(URL_TASK)
      .post('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Panel de control del equipo de desarrollo',
        description: 'Este dashboard contiene las métricas principales del sprint',
      })
      .set('Accept', 'application/json');

    expect(201).toBe(res.status);
    expect(res.body).toHaveProperty('id');
    dashboardId = Number(res.body.id);
    expect(Number.isFinite(dashboardId)).toBe(true);
  });

  // 4. Crear tarea
  it('4) Debería crear una tarea asociable a un dashboard', async () => {
    if (!accessToken) throw new Error('accessToken no disponible');

    const res = await request(URL_TASK)
      .post('/task')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Configurar entorno de desarrollo',
        description: 'Instalar dependencias y configurar variables de entorno',
        endDate: '2025-08-30T18:00:00.000Z',
        statusId: 1,
        priorityId: 2,
      })
      .set('Accept', 'application/json');

    expect(201).toBe(res.status);
    expect(res.body).toHaveProperty('id');
    taskId = Number(res.body.id);
    expect(Number.isFinite(taskId)).toBe(true);
  });

  // 5. Asignar tarea al dashboard
  it('5) Debería asignar la tarea al dashboard correctamente', async () => {
    if (!accessToken) throw new Error('accessToken no disponible');
    if (!dashboardId) throw new Error('dashboardId no disponible');
    if (!taskId) throw new Error('taskId no disponible');

    const res = await request(URL_TASK)
      .post('/dashboard/assign-task')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        dashboardId,
        taskId,
      })
      .set('Accept', 'application/json');

    expect(201).toBe(res.status);

    if (res.body) {
      if (res.body.id) {
        expect(Number(res.body.id)).toBe(taskId);
      }
    }
  });
});
