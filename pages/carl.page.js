const { expect, Locator, Page } = require('@playwright/test');

const MIN_WAIT_TIME = 1000;
const MAX_WAIT_TIME = 5000;
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
    await this.page.waitForTimeout(MAX_WAIT_TIME);
  }

  async clickSendButton() {
    await this.sendButton.click();
    await this.page.waitForTimeout(MAX_WAIT_TIME); // Pequeña espera para que el bot responda
  }

  async writeText(message) {
    await this.answerLoader.waitFor({ state: 'detached' });
    await this.sendButton.waitFor({ state: 'visible' });
    await this.chatInput.fill(message);    
  }

  async clickOption(locator) {
    await locator.waitFor({ state: 'visible' }); 
    await locator.click(); 
    await this.page.waitForTimeout(MIN_WAIT_TIME);
  }

  async getLastCarlAnswer() {
    await this.answerLoader.waitFor({ state: 'detached' });     //Esperar a que el loader se oculte
    await this.sendButton.waitFor({ state: 'visible' });     //Esperar a que el botón de enviar sea visible
    await this.microButton.waitFor({ state: 'visible' });     //Esperar a que el botón de micro sea visible

    await this.page.waitForTimeout(MIN_WAIT_TIME);
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

  async isMessageHistory() {
    let messageCount = await this.allChatMessages.count()
     
    if (messageCount < 2) { //Si hay menos de 2 mensajes, no hay historial
       return false;
    } else {    //Sino, hay 2 mensajes o más, es decir, hay historial
      return true;
    }
  }

  async waitForElement(locator){
    await locator.waitFor({ state: 'visible' });
  }

  async getChatInputText() {
    await this.chatInput.waitFor({ state: 'visible' });
    let chatInput = await this.chatInput.inputValue();
    return chatInput;
  }

  async isAnswerLoading() {
    let flagIsLoading = await this.answerLoader.isVisible();
    return flagIsLoading;
  }

  async elementIsVisible(locator) {
    return await locator.isVisible();
  }

  //Valida que hayan al menos 8 de las 15 palabras claves
  async validateKeywordsInResponseFlexibleMode(keywords) {
    //por si acaso, esperar que habilite el botón ENVIAR 
    await this.sendButton.waitFor({ state: 'visible' });     

    const responseText = await this.getLastCarlAnswer(); //obtener última respuesta de CARL
    const lowerCaseResponse = responseText.toLowerCase();

    const missingKeywords = [];
    const matchedKeywords = [];

    let errorMessage = "";
    

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

    let resultMessage = `
        ------- Test de Cobertura de Palabras Clave -------        
          - Total de Palabras que coincidieron: ${matchedKeywords.length}
          - Palabras Clave que coincidieron: ${matchedKeywords}
          - Palabras Clave Faltantes: ${missingKeywords}
          - Total de Palabras Clave esperadas: ${keywords.length}
        ---------------------------------------------
        `;      
    
      console.log(resultMessage)
    
    if (!pass) {
      errorMessage = `FALLA: La respuesta de CARL no hizo match con al menos el 50% de los keywords esperados.`;      
    }
      await expect(pass, errorMessage).toBe(true);
  }

  //Validar que hay al menos una intención o frase que coincide
  async validateIntentionInResponse(intentions) {
    //por si acaso, esperar que habilite el botón ENVIAR 
    await this.sendButton.waitFor({ state: 'visible' });     

    const responseText = await this.getLastCarlAnswer(); //obtener última respuesta de CARL
    const lowerCaseResponse = responseText.toLowerCase();
    
    let errorMessage = "";
    let phraseMatched = "Ninguna";
    let resultMessage = "";
    let validatedIntention = false;

    for (const phrase of intentions) {
        if (lowerCaseResponse.includes(phrase)) {
            validatedIntention = true;
            phraseMatched = phrase;
            break; // Una vez que se encuentra una coincidencia, no es necesario seguir buscando.
        }
    }

    resultMessage = `
        -------------- Test de Intenciones ---------
          - Frases esperadas: ${intentions}
          - Frase que hizo Match: ${phraseMatched}
        ---------------------------------------------
        `;
    
    console.log(resultMessage);

    if (!validatedIntention) {
      errorMessage = 'FALLA: La respuesta del CARL no coincidió con ninguna de las intenciones planteadas.';
    }

    // Afirmar que al menos una frase de la intención correcta está presente
    await expect(validatedIntention, errorMessage).toBe(true);
      
  }  
}

module.exports = { CarlPage };
