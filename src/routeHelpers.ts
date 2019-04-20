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
  template: string;
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
  const template = route((null as unknown) as T);
  return {
    template,
    build: params =>
      params && isParams(params)
        ? Object.keys(params).reduce(
            (acc, key) => acc.replace(`:${key}`, params[key]),
            template
          )
        : template,
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
