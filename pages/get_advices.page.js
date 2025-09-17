const { expect, Locator, Page } = require('@playwright/test');

class GetAdvicePage {
  constructor(page) {
    this.page = page;

    const limitAdviceText = 'You are allowed a limited number of opportunities to post per period of time.';
    const postedGetAdviceText = 'Your request has been submitted and now our fleet of high horsepower, EPX match-making autobots are sending your request to other members with matching expertise.';
    //const cardNumberFrame = page.frameLocator('#braintree-hosted-field-number');    
    const expirationDateFrame = page.frameLocator('#braintree-hosted-field-expirationDate');
    const cvvFrame = page.frameLocator('#braintree-hosted-field-cvv');
    const postalCode = page.frameLocator('#braintree-hosted-field-postalCode');

    //Home 
    this.getAdviceHomeButton = page.getByRole('button', { name: 'Get Advice', exact: true});
    this.achieveMenuOption = page.getByRole('link', { name: 'Achieve', exact: true});    
    this.getAdviceOption = page.getByText('Get Advice');


    //Modal para subir de membresía
    this.modalContainer     = page.locator('div.overflow-y-auto.bg-gray-0');
    this.upgradeButton      = page.getByRole('button', {name: 'Upgrade', exact: true} );
    this.payToPlayButton    = page.getByText('Pay to Play.');
    this.closeModalIcon     = page.locator('h1.absolute.top-4.right-8.cursor-pointer');    
    this.limitedAdvicesText = page.getByText(limitAdviceText);

    // Formulario Pay to Play
    this.placeOrderButton      = page.getByRole('button', { name: 'Place order' });
    this.amountText            = page.locator('div.flex.justify-between >> p.text-primary');
    this.payFormTitle          = page.getByRole('heading', { name: 'Get Advice' });
    this.termsCheckbox         = page.locator('input.ant-checkbox-input');
    this.payFormNameInput           = page.getByRole('textbox', { name: 'Name on card' });
    //this.payFormCardNumberInput   = cardNumberFrame.locator('input');
    this.payFormCardNumberInput     = page.locator('#credit-card-number');
    this.payFormExpirationDateInput = expirationDateFrame.locator('input');
    this.payFormCVVInput            = cvvFrame.locator('input');
    this.payFormCVVInput2           = page.getByRole('textbox', { name: '123' });
    this.payFormPostalCodeInput     = postalCode.locator('input');

    //toast notification in form Pay to Play
    this.numberToastNotification         = page.getByText('number is invalid');
    this.cvvToastNotification            = page.getByText('cvv is invalid');
    this.expirationDateToastNotification = page.getByText('expirationDate is invalid');
    this.postalCodeNotification          = page.getByText('postalCode is invalid');

    //Success Payment
    this.succesPaymentText           = page.getByRole('heading', { name: 'Your payment has been successful!' });
    this.succesPaymentContinueButton = page.getByRole('button', { name: 'Continue' });

    //Get Expert Advice Form    
    this.getAdviceFormTitle    = page.getByRole('heading', { name: 'Get Expert Advice' });
    this.descriptionTextEditor = page.locator('[aria-label="rdw-editor"]');
    this.getAdviceSubmitButton = page.getByRole('button', { name: 'Submit' });
    this.anySkillRadioInput    = page.locator('input.ant-radio-input').first();

    //Success modal published Get Advice
    this.successPostGetAdviceTitle = page.getByRole('heading', { name: 'Way to Go!' });
    this.successPostGetAdviceText = page.getByText(postedGetAdviceText);
    this.succesPostGetAdviceButton = page.getByRole('button', { name: 'Continue' });

    //Modal Maximum posting exceeded
    this.maximumPostingModalTitle = page.getByRole('heading', { name: 'Maximum posting exceeded' });
    this.maximumPostingModalText  = page.getByText('You have exhausted your maximum number of posts as an EPX member');
  }

  async goToMyAdvices() {
    await page.goto('/achieve/give-advice'); 
  }


  async click(locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async writeText(message, locator) {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(message);    
  }

  async checkRadioInput(selector) {
    await selector.waitFor({ state: 'visible' });
    await selector.check();   
  }

   async waitForElement(locator){
    await locator.waitFor({ state: 'visible' });
  }

  async uncheckRadioInput(selector) {
    await selector.waitFor({ state: 'visible' });
    await selector.uncheck();   
  }

  async isVisible(locator) {
    await locator.waitFor({ state: 'visible' });
    return locator.isVisible();  
  }

  async isDisabled(locator) {
    return locator.isDisabled();  
  }

  async isEnabled(locator) {
    return locator.isEnabled();  
  }

  async elementExists(locator) {
    return await locator.count() == 1;
}

 async  getText(locator) {
    return await locator.textContent();
 }

  
}

module.exports = { GetAdvicePage };
