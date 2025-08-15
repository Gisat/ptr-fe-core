# NPM Folder for ptr-fe-core
As this app is focused on NPM development with NextJS rendering demos, `/ptr-fe-core` is the NPM content that will be exported as final product of this repository.

Here is good place for:
- Anything for final NPM
- Each file from this section will be exported

We should avoid any platform dependencies like Next, test frameworks or similar.

## Installation
- Install Node and NPM
- Install YALC by `npm install -g yalc`
- Clone the geoimage package repository (https://github.com/Gisat/deck.gl-geotiff-dev)
- Open terminal in package root.
- Run `npm i` and `npm run build`
- Run `yalc publish` or `yalc publish --watch` for adding the package to local NPM repository
- Run `npm i`
- Now you can add this package to any project by calling `yalc add ptr-fe-core` inside the target application repository.
