module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-fastform`
  extends: ["fastform"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
