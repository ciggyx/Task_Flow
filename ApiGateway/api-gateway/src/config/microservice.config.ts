import { ClientProviderOptions, Transport } from '@nestjs/microservices';

export const USERS_SERVICE: ClientProviderOptions = {
  name: 'USERS_SERVICE',
  transport: Transport.TCP,
  options: { host: 'localhost', port: 3001 },
};

export const DASHBOARD_SERVICE: ClientProviderOptions = {
  name: 'DASHBOARD_SERVICE',
  transport: Transport.TCP,
  options: { host: 'localhost', port: 3000 },
};
