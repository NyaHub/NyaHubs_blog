const utils = {};

/**
 * This is a HACK to fetch all routes from an express
 * router with nested sub-routers
 *
 * It uses the regex pattern added to the sub-router and
 * tries to normalize it into something more human readable
 * since this doesn't appear to be stored elsewhere as far 
 * as I could tell
 */
const replaceParams = (string) => {
  let curr = string;
  let last = '';
  let paramCount = 1;
  while (last !== curr) {
    last = curr.slice();
    // this is the pattern that express uses when you define your path param without a custom regex
    curr = curr.replace('(?:([^\\/]+?))', `:param${paramCount++}`);
  }
  return curr;
};

/**
 * @param {express.Router} initialRouter the top level router
 * @returns {Array.<Object>} route definitions
 *
 * @example
 * > fetchRoutes(router)
 * [
 *      {path: '/some/express/route', methods: {get: true}}
 * ]
 */
utils.fetchRoutes = (initialRouter) => {
  const _fetchRoutes = (router, prefix = '') => {
    const routes = [];
    router.stack.forEach(({
      route, handle, name, ...rest
    }) => {
      if (route) { // routes registered directly on the app
        const path = replaceParams(`${prefix}${route.path}`).replace(/\\/g, '');
        routes.push({path, methods: route.methods});
      } else if (name === 'router') { // router middleware
        const newPrefix = rest.regexp.source
          .replace('\\/?(?=\\/|$)', '') // this is the pattern express puts at the end of a route path
          .slice(1)
          .replace('\\', ''); // remove escaping to make paths more readable
        routes.push(..._fetchRoutes(handle, prefix + newPrefix));
      }
    });
    return routes;
  };
  return _fetchRoutes(initialRouter);
};

module.exports = utils;