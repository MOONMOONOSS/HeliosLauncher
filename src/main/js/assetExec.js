import AssetGuard from './assetGuard.js';
import JavaGuard from './assetGuard/javaGuard.js';

export default class AssetExec {
  constructor(args) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    this.percent = 0;
    this.tracker = new AssetGuard(...args);
    this.assignListeners();

    process.on('message', (msg) => {
      switch (msg.context) {
        case 'validate-java':
          process.send({
            context: 'status-msg',
            data: 'Searching for Java',
          });

          new JavaGuard('1.14').validateJava(this.tracker.commonPath)
            .then((jGuard) => {
              if (jGuard && jGuard !== '') {
                process.send({
                  context: 'java-status',
                  data: jGuard,
                });
              } else {
                process.send({
                  context: 'java-status',
                  data: false,
                });
              }
            });
          break;
        case 'validate-pack':
          process.send({
            context: 'status-msg',
            data: 'Getting Pack Info',
          });

          this.tracker.validateEverything(msg.server)
            .then((obj) => {
              process.send({
                context: 'finished',
                data: obj,
              });
            });
          break;
        case 'disconnect':
          process.exit(0);
          break;
        default:
          // eslint-disable-next-line no-console
          console.warn(`Unknown context in AssetExec: ${msg.context}`);
          // eslint-disable-next-line no-console
          console.dir(msg);
      }
    });

    process.on('disconnect', () => {
      // eslint-disable-next-line no-console
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
