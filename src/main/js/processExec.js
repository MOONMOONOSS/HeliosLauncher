import ProcessBuilder from './processBuilder';

export default class ProcessExec {
  constructor() {
    process.on('message', (msg) => {
      const { data } = msg;

      switch (msg.context) {
        case 'start-game':
          new ProcessBuilder(
            data.distroServer,
            data.versionData,
            data.forgeData,
            data.authUser,
            null,
            data.modConfig,
            data.javaConfig,
            data.minecraftConfig,
            data.commonDir,
          ).build();

          break;
        case 'disconnect':
          process.exit(0);
          break;
        default:
          // eslint-disable-next-line no-console
          console.warn(`Unknown context in ProcessBuilder: ${msg.context}`);
          // eslint-disable-next-line no-console
          console.dir(msg);
      }
    });

    process.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log('ProcessBuilder Disconnected');

      process.exit(0);
    });
  }
}
