
# node-red-contrib-rpi-garage-door

A node that allows you to control a rpi-garage-door server from Node Red.

## Input

To open or close your garage door pass a message to the `garage-door` node. The payload can either be:

 * `boolean` - `true` will open the door, `false` will close it
 * `string` - pass `OPEN` or `CLOSED`

## Output

 Messages will be emitted by the node with the following properties:

  * `status`: `string` - 'OPEN', 'CLOSED', 'OPENING', 'CLOSING' or 'UNKNOWN',
  * `isOpen`: `boolean`
  * `isClosed`: `boolean`
  * `isOpening`: `boolean`
  * `isClosing`: `boolean`
  * `isUnknown`: `boolean`