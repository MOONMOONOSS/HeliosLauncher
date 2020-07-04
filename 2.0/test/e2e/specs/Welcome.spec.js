import utils from '../utils';

describe('Welcome', function () {
  beforeEach(utils.beforeEach);
  afterEach(utils.afterEach);

  it('has a button which takes takes you to the login page', async function () {
    await this.app.client.element('#welcomeButton').click();
    const element = await this.app.client.element('#loginContainer');
    return expect(element.value).to.exist;
  });
});
