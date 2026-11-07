import { setupServer } from 'msw/node';

/** One MSW server for the whole suite; each test registers its own handlers with `server.use`. */
export const server = setupServer();

export const API_ORIGIN = 'http://localhost';
