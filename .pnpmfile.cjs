/** @type {import('pnpm').Hooks} */
module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === 'some-buggy-lib') {
        pkg.peerDependencies ??= {}
        pkg.peerDependencies['react'] = '^18.0.0'
        pkg.peerDependencies['react-dom'] = '^18.0.0'
      }

      return pkg
    },
  },
}
