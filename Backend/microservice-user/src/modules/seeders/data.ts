import { GuardType } from 'src/modules/permissions/entities/guard-type.enum';

export const ROLE_LIST = [
  {
    name: 'admin',
    guard: GuardType.ADMIN,
    code: 'admin',
    permissions: [1, 2],
  },
  {
    name: 'user',
    guard: GuardType.USER,
    code: 'user',
    permissions: [2],
  },
  {
    name: 'test',
    guard: GuardType.TEST,
    code: 'test',
    permissions: [2],
  },
];
