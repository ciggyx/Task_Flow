// dashboard-assign.e2e.spec.ts
import request from 'supertest';

jest.setTimeout(30000);

const URL_USER = 'http://localhost:3001';
const URL_TASK = 'http://localhost:3000';

describe('E2E: Crear 2 dashboards, crear tarea en A y moverla a B (unique prefix)', () => {
  let accessToken: string | null = null;
  let dashboardAId: number;
  let dashboardBId: number;
  let taskId: number;

  // genero datos únicos para poder re-ejecutar sin conflictos
  const uniqueSuffix = Date.now();
  const userPayload = {
    name: `johndoe_${uniqueSuffix}`,
    email: `johndoe_${uniqueSuffix}@example.com`,
    password: 'johndoe123',
  };

  // payloads con sufijo único para dashboards y tarea
  const dashboardAPayload = {
    name: `Dashboard A ${uniqueSuffix}`,
    description: 'Este es el dashboard A',
  };

  const dashboardBPayload = {
    name: `Dashboard B ${uniqueSuffix}`,
    description: 'Este es el dashboard B',
  };

  const newTaskPayload = {
    name: `Mi primer tarea ${uniqueSuffix}`,
    description: 'Esta es la descripción de mi primer tarea',
    endDate: '2025-08-30T18:00:00.000Z',
    statusId: 1,
    priorityId: 2,
  };

  // 1. Crear usuario
  it('Debería registrar un usuario correctamente', async () => {
    const res = await request(URL_USER)
      .post('/auth/register')
      .send(userPayload)
      .set('Accept', 'application/json');

    expect([200, 201]).toContain(res.status);
    // mensaje opcional de confirmación
    if (res.body && res.body.message) {
      expect(String(res.body.message).toLowerCase()).toMatch(/created|registered|success/i);
    }
  });

  // helper: intenta loguear con distintas formas y obtiene accessToken
  async function obtenerTokenConFallback(): Promise<string> {
    const attempts = [
      { identifierName: userPayload.name, password: userPayload.password },
      { identifierName: userPayload.email, password: userPayload.password },
      { email: userPayload.email, password: userPayload.password },
      { name: userPayload.name, password: userPayload.password },
    ];

    for (const body of attempts) {
      try {
        const r = await request(URL_USER)
          .post('/auth/login')
          .send(body)
          .set('Accept', 'application/json');

        if ([200, 201].includes(r.status) && r.body) {
          // intenta varios caminos donde el token podría venir
          const token = r.body.accessToken;
          if (token && typeof token === 'string') return token;
        }
      } catch (e) {
        // no hacemos ruido en consola para mantener tests limpios
      }
    }

    throw new Error(
      'No se pudo obtener accessToken. Revisá el endpoint /auth/login y los campos esperados.',
    );
  }

  it('Debería loguear al usuario y devolver accessToken', async () => {
    accessToken = await obtenerTokenConFallback();
    expect(accessToken).toBeTruthy();
  });

  it('Debería crear Dashboard A (con unique suffix)', async () => {
    const res = await request(URL_TASK)
      .post('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(dashboardAPayload);

    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
    // si la respuesta viene envuelta (p.e. res.body.data) intentamos soportarlo
    const body = res.body.data ?? res.body;
    expect(body.id).toBeDefined();

    dashboardAId = Number(body.id);
  });

  it('Debería crear Dashboard B (con unique suffix)', async () => {
    const res = await request(URL_TASK)
      .post('/dashboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(dashboardBPayload);

    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
    const body = res.body.data ?? res.body;
    expect(body.id).toBeDefined();

    dashboardBId = Number(body.id);
  });

  it('Debería crear una tarea en Dashboard A (nombre único)', async () => {
    const res = await request(URL_TASK)
      .post(`/dashboard/${dashboardAId}/new-task`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(newTaskPayload);

    expect([200, 201]).toContain(res.status);
    expect(res.body).toBeDefined();
    const body = res.body.data ?? res.body;
    expect(body.id).toBeDefined();

    taskId = Number(body.id);
  });

  it('Debería encontrar la tarea dentro del Dashboard A', async () => {
    const res = await request(URL_TASK)
      .get(`/dashboard/${dashboardAId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();

    // soporta tanto res.body.task como res.body.data.task
    const dashboardBody = res.body.data ?? res.body;
    const tasks = Array.isArray(dashboardBody.task) ? dashboardBody.task : [];
    expect(Array.isArray(tasks)).toBe(true);

    const found = tasks.find((t: any) => Number(t.id) === taskId || t.name === newTaskPayload.name);
    expect(found).toBeDefined();
  });

  it('Debería mover la tarea del Dashboard A al Dashboard B (assign-task)', async () => {
    const res = await request(URL_TASK)
      .post('/dashboard/assign-task')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send({
        dashboardId: dashboardBId,
        taskId: taskId,
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toBeDefined();
    const body = res.body.data ?? res.body;
    expect(Number(body.id)).toBe(taskId);
    expect(Number(body.dashboardId)).toBe(dashboardBId);
  });

  it('Dashboard A ya no debe contener la tarea', async () => {
    const res = await request(URL_TASK)
      .get(`/dashboard/${dashboardAId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    const dashboardBody = res.body.data ?? res.body;
    const tasks = Array.isArray(dashboardBody.task) ? dashboardBody.task : [];

    const found = tasks.find((t: any) => Number(t.id) === taskId || t.name === newTaskPayload.name);
    expect(found).toBeUndefined(); // no debe estar en A
  });

  it('Dashboard B debe contener la tarea movida', async () => {
    const res = await request(URL_TASK)
      .get(`/dashboard/${dashboardBId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    const dashboardBody = res.body.data ?? res.body;
    const tasks = Array.isArray(dashboardBody.task) ? dashboardBody.task : [];

    const found = tasks.find((t: any) => Number(t.id) === taskId || t.name === newTaskPayload.name);
    expect(found).toBeDefined();
    expect(Number(found.dashboardId)).toBe(dashboardBId);
  });
});
