/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import utils from '../utils';

describe('Login', function () {
  beforeEach(utils.beforeEach);
  afterEach(utils.afterEach);

  it.skip('navigates to whitelist view after successful login', async function () {
    // From launch, navigate to login page
    await this.app.client.element('#welcomeButton').click();
    const loginPageElement = await this.app.client.element('#loginContainer');
    expect(loginPageElement.value).to.exist;

    const email = '#mcUsername';
    const password = '#mcPassword';
    const loginButton = await this.app.client.element('#loginButton');

    await this.app.client.setValue('#mcUsername', 'myEmail@email.com');
    await this.app.client.setValue('#mcPassword', 'fakePAssword');
    await loginButton.click();
    const whitelistElement = await this.app.client.element('.whitelistButton');
    expect(whitelistElement.value).to.exist;
  });
});
