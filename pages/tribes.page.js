const { expect } = require('@playwright/test');

class TribesPage {
    constructor(page) {
        this.page = page;
        this.allMyTribes   = page.locator('div.flex.gap-4.items-center h2.text-white.my-1.text-sm');
        this.discoverTitle = page.getByText('Discover New Tribes');      
    }

    async goToTribes() {
        await this.page.goto('/tribes');
  }

    async getMyTribes() {        
        await this.discoverTitle.waitFor({ state: 'visible' });
        await this.allMyTribes.nth(0).waitFor({ state: 'visible' }); 

        let tribesCount = await this.allMyTribes.count();   
        let i=0;
        const tribeNames = [];

        while (i<tribesCount) {
            let text = await this.allMyTribes.nth(i).innerText();

            if (text) {
                tribeNames.push(text.trim());
            }

            i++;
        }
    
        return tribeNames;
    }
  
}

module.exports = { TribesPage };
