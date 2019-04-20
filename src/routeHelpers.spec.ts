import * as routeHelpers from './routeHelpers';

describe('buildRouteApi', () => {
  test('it should convert a single route into an object with `template` and `build` properties', () => {
    const routeApi = routeHelpers.buildRouteApi(() => '/about');
    expect(routeApi).toHaveProperty('template');
    expect(routeApi).toHaveProperty('build');
  });

  test('the `template` property should return the provided template', () => {
    const TEMPLATE = '/profile/:id';
    const routeApi = routeHelpers.buildRouteApi(
      (params: { id: string }) => TEMPLATE
    );
    expect(routeApi.template).toEqual(TEMPLATE);
  });

  test('the `build` property should require the necessary parameters', () => {
    const TEMPLATE = '/profile/:id';
    const ID = '123';
    const routeApi = routeHelpers.buildRouteApi(
      (params: { id: string }) => TEMPLATE
    );
    expect(routeApi.build({ id: ID })).toEqual(TEMPLATE.replace(':id', ID));
  });
});

describe('buildRoutesApi', () => {
  test('it should take a dictionary of route configurations and return an API', () => {
    const routesAPI = routeHelpers.buildRoutesApi({
      HOME: () => `/`,
      ABOUT: () => `/about`,
    });
    expect(routesAPI).toHaveProperty('HOME');
    expect(routesAPI).toHaveProperty('ABOUT');
  });

  test('each item on the API should have build and template properties', () => {
    const routesAPI = routeHelpers.buildRoutesApi({
      HOME: () => `/`,
      ABOUT: () => `/about`,
    });
    expect(routesAPI.HOME).toHaveProperty('template');
    expect(routesAPI.HOME).toHaveProperty('build');
    expect(routesAPI.ABOUT).toHaveProperty('template');
    expect(routesAPI.ABOUT).toHaveProperty('build');
  });

  test('the build property on each of the items should have the same signature as the route definition', () => {
    const routesAPI = routeHelpers.buildRoutesApi({
      HOME: () => `/`,
      ABOUT: () => `/about`,
      PROFILE: (params: { id: string }) => `/profile/:id`,
      CARD: (params: { projectId: string; cardId: string }) =>
        `/projects/:projectId/cards/:cardId`,
    });

    expect(routesAPI.HOME.build()).toEqual('/');
    expect(routesAPI.ABOUT.build()).toEqual('/about');
    expect(routesAPI.PROFILE.build({ id: '123' })).toEqual('/profile/123');
    expect(routesAPI.CARD.build({ projectId: 'abc', cardId: '123' })).toEqual(
      '/projects/abc/cards/123'
    );
  });
});
