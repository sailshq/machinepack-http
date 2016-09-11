/**
 * `data`
 *
 * For HTTP shortcut machines that encode provided data as JSON and send it as the request body.
 *
 * (input def)
 */
module.exports = {
  description: 'Optional data to send with this request.',
  example: {},
  extendedDescription:
  'If provided, this request data will be stringified as JSON and transmitted '+
  'in the body of the request.  For additional encoding options, use the lower-level '+
  'machine: `sendHttpRequest()`.',
};
