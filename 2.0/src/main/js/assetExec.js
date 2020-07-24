import AssetGuard from './assetGuard.js';

export default class AssetExec {
  constructor(args) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    this.percent = 0;
    this.tracker = new AssetGuard(...args);
    this.assignListeners();

    process.on('message', (msg) => {
      console.log(msg);
    });

    process.on('disconnect', () => {
      console.log('AssetExec Disconnected');
      process.exit(0);
    });
  }

  assignListeners() {
    // eslint-disable-next-line no-console
    console.log('Listeners assigned.');

    this.tracker.on('validate', (data) => {
      process.send({
        context: 'validate',
        data,
      });
    });

    this.tracker.on('progress', (data, acc, total) => {
      const curPercent = parseInt((acc / total) * 100, 10);

      if (curPercent !== this.percent) {
        this.percent = curPercent;
        process.send({
          context: 'progress',
          data,
          value: acc,
          total,
          percent: this.percent,
        });
      }
    });

    this.tracker.on('complete', (data, ...args) => {
      process.send({
        context: 'complete',
        data,
        args,
      });
    });

    this.tracker.on('error', (data, error) => {
      process.send({
        context: 'error',
        data,
        error,
      });
    });
  }
}
