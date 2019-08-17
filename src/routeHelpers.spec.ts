import * as routeHelpers from './routeHelpers';

describe('sanitiseBuiltOutput', () => {
  test('it should not affect a root route', () => {
    expect(routeHelpers.__sanitiseBuiltOutput('/')).toEqual('/');
  });
  test('it should not affect non-optional routes', () => {
    expect(routeHelpers.__sanitiseBuiltOutput('/about')).toEqual('/about');
  });
  test('it should remove optional path segments', () => {
    expect(routeHelpers.__sanitiseBuiltOutput('/about?')).toEqual('/');
  });
  test('it should remove optional path parameters', () => {
    expect(routeHelpers.__sanitiseBuiltOutput('/:about?')).toEqual('/');
  });
  test('it should remove optional path route segments following non-optional route segments', () => {
    expect(routeHelpers.__sanitiseBuiltOutput('/about/profile?')).toEqual(
      '/about'
    );
  });
  test('it should remove optional route params following non-optional route segments', () => {
    expect(routeHelpers.__sanitiseBuiltOutput('/about/:param?')).toEqual(
      '/about'
    );
  });
  test('it should remove optional multiple route params following non-optional route segments', () => {
    expect(
      routeHelpers.__sanitiseBuiltOutput('/about/:param?/:param2?')
    ).toEqual('/about');
  });
  test('it should remove multiple optional route segments', () => {
    expect(
      routeHelpers.__sanitiseBuiltOutput('/about/profile?/employees?')
    ).toEqual('/about');
  });
  test('it should remove multiple optional route segments or params (1)', () => {
    expect(
      routeHelpers.__sanitiseBuiltOutput(
        '/about/profile?/employees?/:employeeId?'
      )
    ).toEqual('/about');
  });
  test('it should remove multiple optional route segments or params (2)', () => {
    expect(
      routeHelpers.__sanitiseBuiltOutput(
        '/site/about/profile?/employees?/:employeeId?'
      )
    ).toEqual('/site/about');
  });
});

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

  describe('Optional route segments', () => {
    const routesAPI = routeHelpers.buildRoutesApi({
      ABOUT: (params: { profile: boolean }) => '/about/profile?',
      ACCOUNT: (params: { edit?: boolean; password?: boolean }) =>
        '/account/edit?/password?',
      PROFILES: (params: { id?: string; edit?: boolean }) =>
        '/profiles/:id?/edit?',
      EMPLOYEES: (params: {
        id?: string;
        tab?: 'friends' | 'photos';
        secondaryId?: string;
      }) => '/employees/:id?/:tab?/:secondaryId?',
    });

    test('any optional template route segments should exist in template', () => {
      expect(routesAPI.ABOUT.template).toEqual('/about/profile?');
    });

    test('any optional template route segments should be rendered if `true`', () => {
      expect(routesAPI.ABOUT.build({ profile: true })).toEqual(
        '/about/profile'
      );
    });

    test('any optional template route segments should not be rendered if `false`', () => {
      expect(routesAPI.ABOUT.build({ profile: false })).toEqual('/about');
    });

    test('Optional segments left empty or false should be omitted', () => {
      expect(routesAPI.ACCOUNT.build({ edit: false, password: false })).toEqual(
        '/account'
      );
      expect(routesAPI.ACCOUNT.build({ edit: false })).toEqual('/account');
      expect(routesAPI.ACCOUNT.build({})).toEqual('/account');
    });

    test('any optional template route params should exist in template', () => {
      expect(routesAPI.EMPLOYEES.template).toEqual(
        '/employees/:id?/:tab?/:secondaryId?'
      );
    });

    test('optional param replacement (1)', () => {
      expect(routesAPI.EMPLOYEES.build({})).toEqual('/employees');
    });
    test('optional param replacement (2)', () => {
      expect(routesAPI.EMPLOYEES.build({ id: '123' })).toEqual(
        '/employees/123'
      );
    });
    test('optional param replacement (3)', () => {
      expect(routesAPI.EMPLOYEES.build({ id: '123', tab: 'friends' })).toEqual(
        '/employees/123/friends'
      );
    });
    test('optional param replacement (4)', () => {
      expect(routesAPI.EMPLOYEES.build({ id: '123', tab: 'photos' })).toEqual(
        '/employees/123/photos'
      );
    });
    test('optional param replacement (5)', () => {
      expect(
        routesAPI.EMPLOYEES.build({
          id: '123',
          tab: 'friends',
          secondaryId: '234',
        })
      ).toEqual('/employees/123/friends/234');
    });

    test('optional param replacement (6)', () => {
      expect(routesAPI.PROFILES.build({})).toEqual('/profiles');
    });
    test('optional param replacement (7)', () => {
      expect(routesAPI.PROFILES.build({ id: '123' })).toEqual('/profiles/123');
    });
    test('optional param replacement (8)', () => {
      expect(routesAPI.PROFILES.build({ id: '123', edit: false })).toEqual(
        '/profiles/123'
      );
    });
    test('optional param replacement (9)', () => {
      expect(routesAPI.PROFILES.build({ id: '123', edit: true })).toEqual(
        '/profiles/123/edit'
      );
    });
  });
});
