/**
 * `non200Response`
 *
 * (exit definition)
 */
module.exports = {
  description: 'A non-2xx status code was returned from the server.',
  outputFriendlyName: 'Server response',
  outputDescription: 'A dictionary representing the response from the server, including the status code, headers, and raw body.',
  outputExample: {
    statusCode: 404,
    headers: {},
    body: '...[{"maybe some JSON": "like this"}]  (but could be any string)'
  },
  extendedDescription:
  'This server response contains a _raw response body_ (`body`), which is _always_ a string.  '+
  'If you need to work with this response body in more depth, you may need to parse it '+
  'into whichever format you are expecting (usually JSON--but occasionally XML, CSV, etc.)'
};
