const { expect } = require('@playwright/test');

class HomePage {
    constructor(page) {
        this.page = page;
        this.welcomeText = page.getByRole('heading', { name: 'Welcome!', exact: false });  
        this.viewFullDetailsButton = page.getByText('View Full Details');
    }

    async goToCarl() {
        await this.viewFullDetailsButton.waitFor({ state: 'visible' });
        await this.viewFullDetailsButton.click();
    }
  
}

module.exports = { HomePage };
