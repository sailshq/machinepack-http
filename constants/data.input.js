/**
 * `data`
 *
 * (input def)
 */
module.exports = {
  description: 'Optional data to include in the body of this request.',
  example: {},
  extendedDescription:
  'If provided, this request data will be stringified as JSON and transmitted '+
  'as the body of the request.  For additional encoding options, use the lower-level '+
  'machine: `sendHttpRequest()`.',
};
