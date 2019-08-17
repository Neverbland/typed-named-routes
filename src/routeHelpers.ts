// Obtain the first parameter of a function type in a tuple
type Parameter<T extends (params: any) => any> = T extends (
  params: infer P
) => any
  ? P
  : never;

// Raw Route types.
type RawRoute<T> = {} extends Required<T>
  ? () => string
  : (params: T) => string;
interface RawRoutesBase {
  [key: string]: (params: any) => string;
}

// Route output type.
interface Route<T> {
  template: string;
  build: RawRoute<T>;
}

interface Params {
  [key: string]: string | boolean;
}

function isParams(params: any): params is Params {
  return Boolean(Object.keys(params).length);
}

const removeOptionalParamsRegex = /\/[^\/\s]*\?/g;
const removeTrailingSlashRegex = /\/$/;
export function __sanitiseBuiltOutput(input: string) {
  const replaced = input
    .replace(removeOptionalParamsRegex, '')
    .replace(removeTrailingSlashRegex, '');
  return replaced === '' ? '/' : replaced;
}

// Convert a single route.
export function buildRouteApi<T>(route: RawRoute<T>) {
  const template = route((null as unknown) as T);
  return {
    template,
    build: params => {
      // Return early if we have no params.
      if (!params || !isParams(params)) {
        return __sanitiseBuiltOutput(template);
      }

      const output = Object.keys(params).reduce((acc, key) => {
        return (
          acc
            // Replace optional segments.
            .replace(`/${key}?`, params[key] === true ? `/${key}` : '')

            // Replace optional params.
            .replace(
              `/:${key}?`,
              typeof params[key] === 'string' ? `/${params[key]}` : ''
            )

            // Replace mandatory params.
            .replace(
              `/:${key}`,
              typeof params[key] === 'string' ? `/${params[key]}` : ''
            )
        );
      }, template);

      return __sanitiseBuiltOutput(output);
    },
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
