# Typed Named Routes

## What is it?

This is a lightweight helper for converting typed route definitions and templates into a rich, typed API for using your routes.

It's largely inspired by [this post](https://www.blogreader.com.au/blog/named-routes-with-react-router.html), but provides a typed API for working with your routes. It is a lighter, less holistic solution than the one proposed in the post, and is designed to play nicely with the more dynamic nature of react-router 4+.

## How do I use it?

Install as you would expect - `npm i typed-named-routes --save` or `yarn add typed-named-routes`.

Import the package - `import { buildRoutesApi } from 'typed-named-routes` or `const { buildRoutesApi } = require('typed-named-routes')`.

**Create your route definitions -**

```TS
const routeDefinitions = {
  HOME: () => '/',
  ABOUT: () => '/about',
  PROFILE: (params: { id: string }) => `/profile/:id`,
};
```

Routes are defined using arrow functions. There are two parts to the route definition - the params signature, and the template. The signature defines the parameters required in order to build the route, and the template is used to build the route.

In the case of `ABOUT` above - no parameters are required, so the input for the arrow function is left empty, the template returns the route's path.

For the `PROFILE` definition a parameter `id` is required in order to build the route. This is typed (`params: { id: string }`) and will be used to generate the signature for the API for that route. The template for `PROFILE` provides the placeholders for each of the params.

**Create the route API -**

```TS
const routeAPI = buildRoutesApi(routeDefinitions);
```

**Use the routes API -**

```TSX
import { Router, Switch, Route, Link } from 'react-router';

// ...

const App = () => (
  <>
    <nav>
      <Link to={routeAPI.HOME.build()}>Home</Link>
      <Link to={routeAPI.ABOUT.build()}>About</Link>
      <Link to={routeAPI.PROFILE.build({id: "123"})}>Your profile</Link>
    </nav>
    <Router>
      <Switch>
        <Route path={routeAPI.HOME.template} exact component={Home} />
        <Route path={routeAPI.ABOUT.template} component={About} />
        <Route path={routeAPI.PROFILE.template} component={Profile} />
      </Switch>
    </Router>
  </>
);
```

The template property will give you back the template that you provided in the route definition, so it can be used as the path for react-router `<Route />`s.

The build property is a method that will require the params defined in the route definition. If you are using vscode you should get intellisense around the required parameters for a given route and if you're using TypeScript it should warn you if you do not provide the correct params.

![Image depicting intellisense at work](img/intellisense.png?raw=true)

[Change log](CHANGE_LOG.md)

## TODO

- Document optional parameters (for now see `routeHelpers.spec.ts` for examples)
