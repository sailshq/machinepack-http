module.exports = {


  friendlyName: 'Send custom HTTP request',


  description: 'Send an HTTP request and receive the response.',


  extendedDescription:
  'The "Send custom HTTP request" machine underlies all HTTP requests sent by this pack.  '+
  'It is often unnecessary to call this machine directly, as several higher-level '+
  'alternatives like "GET" and "POST" are available, and are easier to use.  '+
  '"Send custom HTTP request" provides more flexibility, and so it is a bit more complex.  '+
  'But if your use case demands less commonly-used options, this machine is for you.\n'+
  '\n'+
  'Internally, this machine uses the [`request` module](http://npmjs.com/package/request), '+
  'a simplified HTTP request client for Node.js.  For advanced usage that is outside the '+
  'scope of this machine (e.g. `multiplart/related` encoding for .NET WebAPI v4.0), write '+
  'a custom machine and use `require(\'request\')` directly.',


  inputs: {

    method: {
      description: 'The HTTP method or "verb".',
      example: 'GET',
      required: true
    },

    url: {
      friendlyName: 'URL',
      description: 'The URL where the request should be sent.',
      extendedDescription: 'This is either (A) the fully-qualified URL, like "api.example.com/pets"; or (B) a URL path like "/posts/283119/comments" to use as a suffix for the provided `baseUrl`.',
      example: '/7/friends/search',
      required: true
    },

    baseUrl: {
      friendlyName: 'Base URL',
      description: 'Optional base URL to resolve the main URL against, with or without the protocol prefix (e.g. "http://").',
      extendedDescription: 'If specified, this _must_ include the hostname (e.g. `api.example.com`).  It may also include a path (e.g. `http://api.example.com/pets`).',
      example: 'api.example.com/pets'
    },

    qs: {
      friendlyName: 'Data (query string)',
      description: 'Optional dictionary of data to encode and append in the URL\'s query string.  Particularly useful for GET and DELETE requests.',
      extendedDescription:
      'If provided, this data will be automatically encoded in the URL\'s query string '+
      'and sent along with the request.  For example, if `{ page: 2 }` is passed in, '+
      'and the URL is "http://api.example.com/pets", the actual request URL will be '+
      '"http://api.example.com/pets?page=2".',
      moreInfoUrl: 'https://en.wikipedia.org/wiki/Query_string',
      example: {},
    },

    body: {
      friendlyName: 'Data (request body)',
      description: 'Optional data to encode and include in the request body.  Designed for POST, PUT, and PATCH requests.',
      extendedDescription:
      'If provided, this request data will be encoded into the appropriate format, and then transmitted '+
      'in the body of the request.  By default, this data will be stringified as JSON, but that can be '+
      'customized by setting a body encoding type (`enctype`).',
      example: '==='
    },

    enctype: {
      friendlyName: 'Enctype (request body)',
      description: 'Custom format to use when encoding data for the request body.',
      extendedDescription: 'Either "application/json", "application/x-www-form-urlencoded", or "multipart/form-data".  This is only relevant when providing `body` data.  Also note that the appropriate "Content-Type" request header will be set automatically based on the configuration of this input.',
      example: 'application/json',
      defaultsTo: 'application/json'
    },

    headers: {
      description: 'Headers to include in the request (e.g. {"Content-Type": "application/json"}).',
      extendedDescription: 'Request headers should be provided as a dictionary, where each key is the name of a request header to send, '+
      'and each right-hand-side value is the data to send for that header.  Header values are always strings.',
      // e.g. {"Accepts":"application/json"}
      example: {},
      defaultsTo: {}
    }

  },

  exits: {

    success: {
      description: 'A 2xx status code was returned from the server.',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including the status code, headers, and raw body.',
      outputExample: {
        statusCode: 201,
        headers: {},
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      },
      extendedDescription:
      'This server response contains a _raw response body_ (`body`), which is _always_ a string.  '+
      'If you need to work with this response body in more depth, you may need to parse it '+
      'into whichever format you are expecting (usually JSON--but occasionally XML, CSV, etc.)'
    },

    non200Response: require('../constants/non-200-response.exit'),

    requestFailed: require('../constants/request-failed.exit')

  },

  fn: function (inputs,exits) {

    // Import `request`.
    var request = require('request');

    // Import `lodash`.
    var _ = require('lodash');

    // Import `machinepack-urls`.
    var Urls = require('machinepack-urls');


    // Ensure method is upper-cased.
    inputs.method = inputs.method.toUpperCase();


    // Resolve the fully-qualified destination URL.
    // (remember: this also ensures that this is a fully qualified URL, including the protocol)
    //
    // > Note that if this fails, the error will be forwarded through our
    // > `error` exit, which is proper since it'll be an input validation error.
    var targetUrl = Urls.resolve({
      baseUrl: inputs.baseUrl,
      url: inputs.url
    }).execSync();


    // Now we'll build the options to send to the `request` module.

    // Start by declaring a var to hold the options and setting some base values.
    var requestOpts = {
      method: inputs.method,
      url: targetUrl,
      headers: {}
    };


    // If query string data was provided, then...
    if (!_.isUndefined(inputs.qs)) {

      // Set the request module's `qs` option so that the provided data
      // will be appropriately encoded and appended to the URL.
      requestOpts.qs = inputs.qs;
    }


    // If body data was provided, then...
    if (!_.isUndefined(inputs.body)) {

      // Determine if the provided body data is a dictionary (used below)
      var isProvidedBodyDataDictionary = _.isObject(inputs.body) && !_.isArray(inputs.body) && !_.isFunction(inputs.body);

      // Set the appropriate options for the request module so that the
      // provided data will be appropriately encoded and included as the
      // request body.
      //
      // > Note that the appropriate options to use here vary.
      // > It depends on the encoding type (`enctype`).
      switch (inputs.enctype) {
        case 'application/json':
          var stringifiedBodyData;
          try {
            stringifiedBodyData = JSON.stringify(inputs.body);
          } catch (e) {
            throw new Error('Cannot send request:  The provided data for the request body (`'+inputs.body+'`) cannot be stringified as JSON.  Make sure the specified data is JSON-compatible, or use a different encoding type.  Stringification error details: '+e.stack);
          }

          // Use the `form` option to URL-form-encode this data and
          // include it as the body of the request.
          //
          // > Note that we're using `body` and not `json`.  Just because we're sending
          // > the request body encoded as JSON _doesn't necessarily_ mean we want the
          // > response body to be JSON-encoded as well.
          // >
          // > Also note that, since we're not using the `json` option, we have to set
          // > the content-type header manually.
          requestOpts.body = stringifiedBodyData;
          requestOpts.headers = { 'Content-Type': 'application/json' };
          break;

        case 'application/x-www-form-urlencoded':
          if (!isProvidedBodyDataDictionary) {
            throw new Error('Cannot send request:  The provided data for the request body (`'+inputs.body+'`) cannot be encoded as "application/x-www-form-urlencoded".  Specify the data as a dictionary instead, or use a different encoding type.');
          }

          // Use the `form` option to URL-form-encode this data and
          // include it as the body of the request.
          //
          // > Note that, since we're using `form`, the `request` module
          // > will set the appropriate content type header automatically.
          requestOpts.form = inputs.body;
          break;

        case 'multipart/form-data':
          if (!isProvidedBodyDataDictionary) {
            throw new Error('Cannot send request:  The provided data for the request body (`'+inputs.body+'`) cannot be encoded as "multipart/form-data".  Specify the data as a dictionary instead, or use a different encoding type.');
          }

          // Use the `form` option to multipart-form-encode this data and
          // include it as the body of the request.
          //
          // > Note that, since we're using `formData`, the `request` module
          // > will set the appropriate content type header automatically.
          requestOpts.formData = inputs.body;
          break;

        default:
          throw new Error('Cannot send request:  Specified enctype (`'+inputs.enctype+'`) is not recognized as the encoding type for the body of an HTTP request.');
      }

    }//</if :: `body` was provided>


    // >-
    // Now fold in any custom headers that were provided.
    //
    // > We do this down here so that custom headers from userland
    // > override the defaults we assigned above.
    _.extend(requestOpts.headers, inputs.headers);


    // And send the request using the options dictionary constructed above.
    request(requestOpts, function gotResponse(err, httpResponse) {
      try {
        // The request failed (disconnected from internet?  server down?)
        // Return the unknown error through the `requestFailed` exit.
        if (err) {
          return exits.requestFailed(err);
        }

        // --•
        // Otherwise, we'll build a normalized server response.
        //
        // > Regardless of the status code sent in the response, we'll
        // > use this dictionary as our output when we exit below.
        var serverRes = {
          statusCode: httpResponse.statusCode,
          headers: httpResponse.headers || {},
          body: httpResponse.body || ''
        };

        // If the status code of the response is not in the 2xx range, then
        // return the server response dictionary through the `non2xxResponse` exit.
        if (httpResponse.statusCode >= 300 || httpResponse.statusCode <= 199) {
          return exits.non200Response(serverRes);
        }

        // --•
        // Otherwise, return the server response dictionary through
        // the `success` exit.
        return exits.success(serverRes);

      } catch (e) { return exits.error(e); }
    });//</request()>

  }


};
