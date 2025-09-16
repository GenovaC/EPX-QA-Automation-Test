const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = '#email';
    this.passwordInput = '#password';
    this.loginButton = 'button[type="submit"]';
  }

  async navigate() {
    await this.page.goto('https://app-stg.epxworldwide.com/log-in');
  }

  async login(email, password) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    
    await expect(
            this.page.getByRole('button', { name: 'Beta Bugs' }).first()
        ).toBeVisible();
  }
}

module.exports = { LoginPage };
