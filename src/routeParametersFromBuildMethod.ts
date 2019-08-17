export type RouteParametersFromBuildMethod<
  T extends (params: any) => any
> = T extends (params: infer P) => any ? P : never;
