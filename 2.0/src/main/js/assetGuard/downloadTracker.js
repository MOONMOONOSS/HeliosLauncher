//

/**
 * Representation of a download tracker.
 * This is used to store metadata about a download
 * queue, including the queue itself.
 *
 * @export
 * @class DlTracker
 */
export default class DlTracker {
  dlQueue;

  dlSize;

  callback;

  constructor(
    dlQueue,
    dlSize,
    callback,
  ) {
    this.dlQueue = dlQueue;
    this.dlSize = dlSize;

    if (typeof callback !== 'undefined') {
      this.callback = callback;
    }
  }
}
