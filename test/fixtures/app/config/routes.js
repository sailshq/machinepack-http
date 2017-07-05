/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/html': function (req, res) {
    res.header('content-type', 'text/html');
    return res.send('<html><body>hi!</body></html>');
  },

  '/ok': function (req, res) {
    res.header('x-some-header', 'foobar!');
    res.header('content-type', 'application/json');
    // console.log('all params:',req.allParams());
    // console.log('req.query:',req.query);
    // console.log('req.body:',req.body);
    // console.log('req.url:',req.url);
    return res.json({params: req.params.all(), headers: req.headers, method: req.method});
  },

  '/notFound': {response: 'notFound'},

  '/forbidden': {response: 'forbidden'},

  '/badRequest': {response: 'badRequest'},

  '/unauthorized': function (req, res) {res.status(401); return res.send();},

  '/error': function (req, res) {res.serverError('some error');}

};
