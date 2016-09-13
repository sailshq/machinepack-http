/**
 * `success`
 *
 * Success exit for HTTP shortcut machines (GET, POST, PUT, DELETE).
 *
 * (exit definition)
 */
module.exports = {
  description: 'The server responded with a 2xx status code.',
  outputFriendlyName: 'Data',
  outputDescription: 'The response data from the server, parsed and ready to use.',
  outputExample: '*',
  extendedDescription:
  'This response data is decoded automatically from the response body by attempting to parse it as JSON.  '+
  'If the response body cannot be parsed as JSON, it is left as the original raw string.  If _no_ response '+
  'body is received at all, then this response data is `null`.\n'+
  '\n'+
  'If you are expecting a response with binary data (like a `.jpg`), or with data encoded '+
  'in a format other than JSON; or if you need to access the status code and response headers, '+
  'then consider using the lower-level machine in this pack: `sendHttpRequest()`.'
};
