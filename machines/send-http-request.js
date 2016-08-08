module.exports = {


  friendlyName: 'Send HTTP request',


  description: 'Send an HTTP request and receive the response.',


  inputs: {

    url: {
      description: 'The URL where the request should be sent.',
      extendedDescription: 'If `baseUrl` is specified, then `url` should be the "path" part of the URL-- e.g. everything after and including the leading slash ("/users/7/friends/search")',
      example: '/pets/18',
      required: true
    },

    baseUrl: {
      description: 'The base URL, including the hostname and a protocol like "http://".',
      example: 'http://google.com'
    },

    method: {
      description: 'The HTTP method or "verb".',
      example: 'get'
    },

    params: {
      description: 'Parameters to include in the request (e.g. {"email": "fooberbash.foo"}).',
      extendedDescription: 'These values will be either encoded in the querystring or included as JSON in the body of the request based on the request method (GET/POST/etc.).  For non-GET requests, this input will be ignored if "body" is provided.',
      example: {},
      // e.g. {"email": "foo@fooberbash.foo"}
    },

    body: {
      description: 'Body of the request (for PUT and POST).',
      extendedDescription: 'This will override the value of the "params" input (if any) for non-GET requests unless "formData" is true.  Conversely, GET requests will ignore this input entirely.  To send an empty body with a non-GET request, do not provide a value for the "params" or "body" inputs.',
      example: '*'
    },

    formData: {
      description: 'A boolean value indicating if the params should be sent as url encoded form data. If false JSON will be used.',
      extendedDescription: 'If "formData" is true, the "body" input will be ignored in favor of the "params" input value (defaulting to an empty dictionary).',
      example: false
    },

    headers: {
      description: 'Headers to include in the request (e.g. {"Content-Type": "application/json"}).',
      example: {},
      // e.g. {"Accepts":"application/json"}
    }

  },

  exits: {

    success: {
      description: '2xx status code returned from server.',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including status, headers and body.',
      outputExample: {
        status: 201,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    notFound: {
      description: '404 status code returned from server.',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including status, headers and body.',
      outputExample: {
        status: 404,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    badRequest: {
      description: '400 status code returned from server.',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including status, headers and body.',
      outputExample: {
        status: 400,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    forbidden: {
      description: '403 status code returned from server.',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including status, headers and body.',
      outputExample: {
        status: 403,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    unauthorized: {
      description: '401 status code returned from server.',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including status, headers and body.',
      outputExample: {
        status: 401,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    serverError: {
      description: '5xx status code returned from server (this usually means something went wrong on the other end).',
      outputFriendlyName: 'Server response',
      outputDescription: 'The response from the server, including status, headers and body.',
      outputExample: {
        status: 503,
        headers: '{"Accepts":"application/json"}',
        body: '[{"maybe some JSON": "like this"}]  (but could be any string)'
      }
    },

    requestFailed: {
      description: 'Unexpected connection error: could not send or receive HTTP request.',
      extendedDescription: 'Could not send HTTP request; perhaps network connection was lost?'
    },

  },

  fn: function (inputs,exits) {

    // Import `util`.
    var util = require('util');

    // Import `lodash` and `request`.
    var _ = require('lodash');
    var request = require('request');

    // Import `machinepack-urls` and `machinepack-json`.
    var Urls = require('machinepack-urls');
    var Json = require('machinepack-json');


    // Default to a GET request.
    inputs.method = (inputs.method||'get').toLowerCase();

    // If `inputs.baseUrl` is specified, resolve the `inputs.url` from that base.
    if (inputs.baseUrl) {

      // Strip trailing slashes.
      inputs.baseUrl = inputs.baseUrl.replace(/\/*$/, '');

      // Ensure this is a fully qualified URL w/ the "http://" part,
      // and if not, attempt to coerce.  Note that if this fails, the error
      // will be forwarded through our `error` exit, which is proper since
      // it'll be an input validation error.
      inputs.baseUrl = Urls.resolve({url:inputs.baseUrl}).execSync();

      // If a `baseUrl` was provided then `url` should just be the path part
      // of the URL, so it should start w/ a leading slash.
      inputs.url = inputs.url.replace(/^([^\/])/,'/$1');
    }

    // If no baseUrl was specified...
    else {
      // Coerce it to an empty string.
      inputs.baseUrl = '';

      // Ensure `url` is fully qualified (w/ the "http://" and hostname part).
      inputs.url = Urls.resolve({url:inputs.url}).execSync();
    }

    // Build the options to send to the `request` module.
    var options = (function build_options_for_mikeal_request(){

      // Declare a var to hold the options, and set some base values.
      var options = {
        method: inputs.method.toUpperCase(),
        url: inputs.baseUrl + inputs.url,
        headers: inputs.headers||{}
      };

      // For GET requests, set the query string to the specified params,
      // and default to expecting a JSON response.
      if (options.method === 'GET') {
        return _.extend(options, {
          qs: inputs.params,
          json: true,
        });
      }

      // Set the "form" or "json" options depending on whether `inputs.formData`
      // was set.
      if(inputs.formData) {
        options.form = inputs.params || {};
      } else {
        options.json = inputs.body || inputs.params;
      }

      // Return the options dictionary we constructed.
      return options;
    })();

    // Send the request using the options dictionary constructed above.
    request(options, function gotResponse(err, response, httpBody) {

      // Wat (disconnected from internet maybe?)
      // Return the unknown error through `requestFailed`.
      if (err) {
        return exits.requestFailed(err);
      }

      // If the status code of the response is not 2xx or 3xx...
      if (response.statusCode >= 300 || response.statusCode < 200) {

        // Determine which exit to call based on the status code.
        var exitToCall;
        switch (response.statusCode) {
          case 400: exitToCall = exits.badRequest; break;
          case 401: exitToCall = exits.unauthorized; break;
          case 403: exitToCall = exits.forbidden; break;
          case 404: exitToCall = exits.notFound; break;
          default:
            if (response.statusCode > 499 && response.statusCode < 600) {
              exitToCall = exits.serverError;
            }
            else exitToCall = exits.error;
        }

        // Call the appropriate error with information from the server response.
        return exitToCall({
          status: response.statusCode,
          headers: Json.stringifySafe({value: response.headers || {}}).execSync(),
          body: Json.stringifySafe({value: httpBody || ''}).execSync()
        });
      }

      // Success!  Output the server response through the `success` exit.
      return exits.success({
        status: response.statusCode,
        headers: Json.stringifySafe({value: response.headers || {}}).execSync(),
        body: Json.stringifySafe({value: httpBody || ''}).execSync()
      });
    });

  },

};
