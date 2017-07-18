/**
 * `headers`
 *
 * Custom request headers.
 *
 * (input definition)
 */
module.exports = {
  description: 'Custom headers to include in the request (e.g. {"X-Auth": "k3yboardc4t"}).',
  extendedDescription: 'Request headers should be provided as a dictionary, where each key is the name of a request header to send, '+
  'and each right-hand-side value is the data to send for that header.  Header values are always strings.\n'+
  '> Also note: Some additional request headers, such as "Content-type" are implicitly attached by this package.  '+
  '> As you might expect, these implicit headers can be overridden here, so use with care.',
  // e.g. {"Accepts":"application/json"}
  example: {}
};
