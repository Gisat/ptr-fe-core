# NPM Folder for ptr-fe-core
As this app is focused on NPM development with NextJS rendering demos, `/ptr-fe-core` is the NPM content that will be exported as final product of this repository.

Here is good place for:
- Anything for final NPM
- Each file from this section will be exported

We should avoid any platform dependencies like Next, test frameworks or similar.

## Diferences from Next App
- Styles: Please use exact CSS class names like `<Component className="some.class />` not `<Component className={styles.CoolClass} />`
- All NPM Dependency must be in `package.json`. Peer dependencies are required to install by NPM user, rest is part of the NPM.
