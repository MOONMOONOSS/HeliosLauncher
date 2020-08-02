import utils from '../utils';

describe('Launch', function () {
  beforeEach(utils.beforeEach);
  afterEach(utils.afterEach);

  it('shows the proper application title', async function () {
    const title = await this.app.client.getTitle();
    return expect(title).to.equal('MOON2 Launcher');
  });

  it('arrives on the welcome page', async function () {
    const element = await this.app.client.element('#welcomeContainer');
    return expect(element.value).to.exist;
  });
});
