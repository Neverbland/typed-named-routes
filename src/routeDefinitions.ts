/**
 * Helpers
 */

// Obtain the first parameter of a function type in a tuple
type Parameter<T extends (params: any) => any> = T extends (
  params: infer P
) => any
  ? P
  : never;

// Raw Route types.
type RawRoute<T> = {} extends T ? () => string : (params: T) => string;
interface RawRoutesBase {
  [key: string]: (params: any) => string;
}

// Route output type.
interface Route<T> {
  path: string;
  build: RawRoute<T>;
}

type Params = {
  [key: string]: string;
};

function isParams(params: any): params is Params {
  return Boolean(Object.keys(params).length);
}

// Convert a single route.
export function buildRouteApi<T>(route: RawRoute<T>) {
  const path = route((null as unknown) as T);
  return {
    path,
    build: params =>
      params && isParams(params)
        ? Object.keys(params).reduce(
            (acc, key) => acc.replace(`:${key}`, params[key]),
            path
          )
        : path,
  } as Route<T>;
}

// Convert a dictionary of routes.
export function buildRoutesApi<T extends RawRoutesBase>(routes: T) {
  const routeKeys = Object.keys(routes) as [keyof T];
  return routeKeys.reduce(
    (acc, key) => ({ ...acc, [key]: buildRouteApi(routes[key] as any) }),
    {}
  ) as { [P in keyof T]: Route<Parameter<T[P]>> };
}

/**
 * Usage
 */

// Route definitions - this just outlines the signature for each route along
// with the path template.
const RAW_ROUTES = {
  HOME: () => '/',
  ABOUT: () => '/about',
  PROFILE: (params: { id: string }) => `/profile/:id`,
  CARD: (params: { projectId: string; cardId: string }) =>
    `/projects/:projectId/cards/:cardId`,
};

// Convert our routes to a usable API.
const ROUTES = buildRoutesApi(RAW_ROUTES);

/**
 * Demo
 */

// We can build a route that doesn't need args like this:
ROUTES.ABOUT.build();

// And we can fetch its route template like this:
ROUTES.ABOUT.path;

// For routes that take args we can specify like this:
ROUTES.PROFILE.build({ id: '123' });
ROUTES.CARD.build({ cardId: 'abc', projectId: '123' });
