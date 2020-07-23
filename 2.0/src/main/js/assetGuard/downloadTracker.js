// @flow

/**
 * Representation of a download tracker.
 * This is used to store metadata about a download
 * queue, including the queue itself.
 *
 * @export
 * @class DlTracker
 */
export default class DlTracker<T> {
  dlQueue: Array<T>;

  dlSize: number;

  callback: () => T;

  constructor(
    dlQueue: Array<T>,
    dlSize: number,
    callback?: () => T,
  ) {
    this.dlQueue = dlQueue;
    this.dlSize = dlSize;

    if (typeof callback !== 'undefined') {
      this.callback = callback;
    }
  }
}
