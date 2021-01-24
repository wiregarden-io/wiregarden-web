# wiregarden-web

This is the Wiregarden web application deployed to [wiregarden.io](https://wiregarden.io).

Operational issues with the site or service may also be opened on this project.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
See [create-react-app.md](create-react-app.md) for details.

## Quick start

Instructions assume a Debian-based Linux distribution.

[Install yarn](https://classic.yarnpkg.com/en/docs/install#debian-stable). See also `scripts/install-yarn.bash`.

`yarn` to fetch dependencies.

Edit `src/setupProxy.js` to point the web application in development to your
own API instance.

Edit `src/index.js` to customize the Auth0 provider. Note that this only works
with the purchase of a tenant subdomain, or a self-hosted wiregarden API server.

`yarn start` to run the web application on localhost:3000 for development.

`yarn build` to package the web application for deployment. Serving the web
application requires some front-end URL routing; `/api.*/` to the API backend,
everything else to the static root copied from `build`.

