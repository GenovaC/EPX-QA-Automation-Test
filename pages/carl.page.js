const { expect, Locator, Page } = require('@playwright/test');

class CarlPage {
  constructor(page) {
    this.page = page;
    this.chatInput       = page.getByRole('textbox', { name: 'How can C.A.R.L. help you today?' });
    this.lastCarlMessage = page.locator('.carl-chat-item.list-style-disc').last(); // Localizador del último mensaje
    this.allChatMessages = page.locator('.carl-chat-item.list-style-disc');
    this.sendButton      = page.locator('button.ant-btn.ant-btn-text.block.float-right.p-0')
    this.newChatButton   = page.getByRole('button', { name: 'New chat', exact: false}); 
    this.headingCarlText = page.getByRole('heading', { name: 'Chat with C.A.R.L.', exact: true }); 
    this.answerLoader    = page.getByRole('img', { name: 'loading'}); 
    this.historyTab      = page.getByText('History');
    this.microButton     = page.locator('img[src="/img/png/microCarl.png"]');
    this.initialChatMessage = page.getByRole('heading', { name: `Hi there!`, exact: false }); 
    this.deleteLastChatButton = page.locator('div.flex.flex-row.gap-2.items-center >> div.cursor-pointer').nth(1);
  }

  async goToCarlFromHome() {
    await this.viewFullDetailsButton.click();
  }

  async clickSendButton() {
    await this.sendButton.click();
    await this.page.waitForTimeout(5000); // Pequeña espera para que el bot responda
  }

  async writeText(message) {
    await this.answerLoader.waitFor({ state: 'detached' });
    await this.sendButton.waitFor({ state: 'visible' });
    await this.chatInput.fill(message);    
  }

  async clickOption(locator) {
    await locator.waitFor({ state: 'visible' }); 
    await locator.click(); 
  }

  async getLastCarlAnswer() {
    await this.answerLoader.waitFor({ state: 'detached' });     //Esperar a que el loader se oculte
    await this.sendButton.waitFor({ state: 'visible' });     //Esperar a que el botón de enviar sea visible
    await this.microButton.waitFor({ state: 'visible' });     //Esperar a que el botón de micro sea visible
    await this.lastCarlMessage.waitFor({ state: 'visible' });

    return this.lastCarlMessage.innerText();
  }

  //Para obtener el penúltimo mensaje
  async getSecondToLastMessage() {
    await this.allChatMessages.nth(1).waitFor({ state: 'visible' });    // esperar a que existan al menos 2 mensajes    
    let messageCount = await this.allChatMessages.count(); // contar total de mensajes

    // Selecciona el mensaje de índice-2
    if (messageCount >= 2) {
       return this.allChatMessages.nth(messageCount - 2).innerText();
    } else {
      throw new Error('No existe penúltimo mensaje');
    }
  }

  async waitForElement(locator){
    await locator.waitFor({ state: 'visible' });
  }

  async getChatInputText() {
    await this.chatInput.waitFor({ state: 'visible' });
    return this.chatInput.inputValue();
  }

  async isAnswerLoading() {
    return this.answerLoader.isVisible();
  }

  async elementIsVisible(locator) {
    return locator.isVisible();
  }

  async validateKeywordsInResponseStrictMode(keywords) {
    //por si acaso, esperar que habilite el botón ENVIAR 
    await this.sendButton.waitFor({ state: 'visible' });     

    const responseText = await this.getLastCarlAnswer(); //obtener última respuesta de CARL
    
    for (const keyword of keywords) {
      expect(responseText.toLowerCase(), `Faltó el keyword "${keyword}" en la respuesta`).toContain(keyword.toLowerCase());
    }
  }

  //Valida que hayan al menos 8 de las 10 palabras claves
  async validateKeywordsInResponseFlexibleMode(keywords) {
    //por si acaso, esperar que habilite el botón ENVIAR 
    await this.sendButton.waitFor({ state: 'visible' });     

    const responseText = await this.getLastCarlAnswer(); //obtener última respuesta de CARL
    const lowerCaseResponse = responseText.toLowerCase();

    const missingKeywords = [];
    const matchedKeywords = [];

    // Recorrer todas las palabras clave y contar cuántas se encuentran en la respuesta
    for (const keyword of keywords) {
      if (lowerCaseResponse.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    }

    // Afirmar que el porcentaje de coincidencia es igual o superior al 80%
    let pass = matchedKeywords.length >= 8;
    
    if (!pass) {
      const errorMessage = `
        --- Test de Cobertura de Palabras Clave ---
        FALLA: La respuesta no alcanzó el umbral del 80%.
          - Total de Palabras que coincidieron: ${matchedKeywords.length}
          - Palabras Clave que coincidieron: ${matchedKeywords}
          - Palabras Clave Faltantes: ${missingKeywords}
          - Total de Palabras Clave esperadas: ${keywords.length}
        ---------------------------------------------
        `;
      expect(pass, errorMessage).toBe(true);
    }
      
  }

  //Validar que hay al menos una intención o frase que coincide
  async validateIntentionInResponse(intentions) {
    //por si acaso, esperar que habilite el botón ENVIAR 
    await this.sendButton.waitFor({ state: 'visible' });     

    const responseText = await this.getLastCarlAnswer(); //obtener última respuesta de CARL
    const lowerCaseResponse = responseText.toLowerCase();

    let validatedIntention = false;
    for (const phrase of intentions) {
        if (lowerCaseResponse.includes(phrase)) {
            validatedIntention = true;
            break; // Una vez que se encuentra una coincidencia, no es necesario seguir buscando.
        }
    }

    if (!validatedIntention) {
      const errorMessage = `
        --- Test de Intenciones ---
        FALLA: La respuesta del CARL no coincidió con ninguna de las intenciones planteadas.
          - Frases esperadas: ${intentions}
        ---------------------------------------------
        `;
    }

    // Afirmar que al menos una frase de la intención correcta está presente
    expect(validatedIntention, errorMessage).toBe(true);
      
  }  
}

module.exports = { CarlPage };
