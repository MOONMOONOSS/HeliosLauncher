import AssetGuard from './assetGuard.mjs';

const tracker = new AssetGuard(...(process.argv.splice(2)));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let percent = 0;

function assignListeners() {
  // eslint-disable-next-line no-console
  console.log('Listeners assigned.');

  tracker.on('validate', (data) => {
    process.send({
      context: 'validate',
      data,
    });
  });

  tracker.on('progress', (data, acc, total) => {
    const curPercent = parseInt((acc / total) * 100, 10);

    if (curPercent !== percent) {
      percent = curPercent;
      process.send({
        context: 'progress',
        data,
        value: acc,
        total,
        percent,
      });
    }
  });

  tracker.on('complete', (data, ...args) => {
    process.send({
      context: 'complete',
      data,
      args,
    });
  });

  tracker.on('error', (data, error) => {
    process.send({
      context: 'error',
      data,
      error,
    });
  });
}

assignListeners();

process.on('message', (msg) => {
  console.log(msg);
});

process.on('disconnect', () => {
  console.log('AssetExec Disconnected');
  process.exit(0);
});

process.exit(0);
