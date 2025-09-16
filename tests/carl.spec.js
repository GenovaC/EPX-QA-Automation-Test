const { test, expect, describe } = require('@playwright/test');
import chatData from '../data/carl_data_keywords.json';
import { CarlPage } from '../pages/carl.page';
import { HomePage } from '../pages/home.page';
import { TribesPage } from '../pages/tribes.page';
import { LoginPage } from '../pages/login.page'; 
import { users } from '../utils/test-users';


/////////////////////////////////////////////////////// Grupo 1: Navegación a CARL
/*describe('Navegación a CARL', () => {

  test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(users.userPremium.email, users.userPremium.password); //Usuario con 0 advice publicado
  });

  test('Navegar a CARL desde el HOME', async ({ page }) => {
      const carlPage = new CarlPage(page);
      const homePage = new HomePage(page);

      await expect(homePage.welcomeText).toBeVisible();

      await homePage.goToCarl();

      await expect(carlPage.headingCarlText).toBeVisible();
      await expect(carlPage.chatInput).toBeVisible();
      await expect(carlPage.sendButton).toBeDisabled();
    
  });
   
}); 
 

/////////////////////////////////////////////////////// Grupo 2: Operatividad básica de CARL
 describe('Funcionamiento básico de CARL', () => {

  //Se ejecutará antes de cada uno de los tests dentro de este bloque Describe
  test.beforeEach(async ({ page }) => {  
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(users.userPremium.email, users.userPremium.password); //Usuario con 0 advice publicado
    
      await page.goto('/carl'); 
  });

  
  test('Escribir texto en input del chat', async ({ page }) => {    
      const carlPage = new CarlPage(page);    

      const textToSend = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet arcu vel pretium tempor. Donec tristique sed massa vitae blandit. Vivamus massa massa, eleifend eu orci sit amet, ornare varius nisl. Etiam suscipit rutrum neque, eu facilisis justo auctor et. Proin vehicula eleifend congue. Mauris sed nisi ut elit euismod porttitor sed vel eros. Integer ac dictum massa. Fusce ut venenatis orci. Curabitur eu mauris urna. ";

      await carlPage.writeText(textToSend);
      let currentTypedText = await carlPage.getChatInputText();

      expect(currentTypedText, 'El texto escrito en el input no se visualiza correctamente').toBe(textToSend);    
  });
  
  test('Enviar pregunta a CARL con tecla Enter', async ({ page }) => {   
      const carlPage = new CarlPage(page);     

      const textToSend = "Traveling to Miami. Are there any members there?";

      await carlPage.writeText(textToSend);
      page.keyboard.press("Enter")

      let secondToLastMessage = await carlPage.getSecondToLastMessage();
      let isLoading = await carlPage.isAnswerLoading();

      expect(isLoading, 'La pregunta enviada no disparó el loader de respuesta de CARL').toBe(true); 
      expect(secondToLastMessage, 'La pregunta recién enviada no se visualiza de penúltimo en el chat').toBe(textToSend);      
  }); 

  
  test('Enviar pregunta a CARL clickeando botón Enviar', async ({ page }) => {   
      const carlPage = new CarlPage(page);     

      const textToSend = "Who else in EPX has made films?";

      await carlPage.writeText(textToSend);
      await carlPage.clickSendButton();

      let secondToLastMessage = await carlPage.getSecondToLastMessage();
      let isLoading = await carlPage.isAnswerLoading();

      expect(isLoading, 'La pregunta enviada no disparó el loader de respuesta de CARL').toBe(true); 
      expect(secondToLastMessage, 'La pregunta recién enviada no se visualiza de penúltimo en el chat').toBe(textToSend);    
  });
   
}); 

/////////////////////////////////////////////////////// Grupo 3: Preguntas sobre las tribus a CARL
describe('Solicitud de Tribus a CARL', () => {

  //Se ejecutará antes de cada uno de los tests dentro de este bloque Describe
  test.beforeEach(async ({ page }) => {  
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(users.userPremium.email, users.userPremium.password); //Usuario con 0 advice publicado
    
      await page.goto('/carl'); 
  });

  test('Solicitar tribus de las que soy parte', async ({ page }) => {
      const carlPage = new CarlPage(page);    
      const tribesPage = new TribesPage(page);

      await tribesPage.goToTribes();
      let myTribes = await tribesPage.getMyTribes()

      await page.goto('/carl'); 

      let textToSend = "Devuélveme las tribus de las que soy parte, escribiendo única y exclusivamente lo siguiente (Y NADA MÁS): Tribu 1, Tribu 2, Tribu 3, ... Tribu n";
      await carlPage.writeText(textToSend);
      await carlPage.clickSendButton();

      let carlAnswer = await carlPage.getLastCarlAnswer(); // Obtener respuesta de CARL    
      const carlAnswerToArray = carlAnswer.split(', ');  

      const sortedCarlAnswerArray = carlAnswerToArray.sort();
      const sortedTribes = myTribes.sort(); 

      console.log("Tribus según CARL: ", sortedCarlAnswerArray);
      console.log("Tribus según My Tribes: ", sortedTribes);

      expect(sortedCarlAnswerArray, 'La lista de tribus proporcionada por Carl no coincide con las tribus listadas en My Tribes').toEqual(sortedTribes);    
  });
   
}); */


/////////////////////////////////////////////////////// Grupo 3: Validación de palabras clave en respuestas de CARL
describe('Validar palabras clave e intenciones en preguntas a CARL', () => {
  
  //Se ejecutará antes de cada uno de los tests dentro de este bloque Describe
  test.beforeEach(async ({ page }) => {  
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(users.userPremium.email, users.userPremium.password); //Usuario con 0 advice publicado  
      
  });

  
  /*for (const data of chatData) {
    test(`Validar palabras claves para la pregunta: "${data.question}"`, async ({ page }) => {
      const carlPage = new CarlPage(page); 
      const homePage = new HomePage(page);
      let textToSend = data.question; 
      console.log("Keywords esperadas:", data.keywords)

      await homePage.goToCarl();

      //Si el chat no comenzó desde cero, abrir nuevo chat
      if (!await carlPage.elementIsVisible(carlPage.initialChatMessage)){
        await carlPage.clickOption(carlPage.historyTab);
        await carlPage.clickOption(carlPage.newChatButton); 
      }
            
      await carlPage.waitForElement(carlPage.sendButton);
      await carlPage.waitForElement(carlPage.initialChatMessage);

      await carlPage.writeText(textToSend);
      await carlPage.clickSendButton();
      
      await carlPage.validateKeywordsInResponseFlexibleMode(data.keywords);
        await carlPage.clickOption(carlPage.deleteLastChatButton); 
    });
  } */

  for (const data of chatData) {
    test(`Validar intención de respuesta para la pregunta: "${data.question}"`, async ({ page }) => {
      const carlPage = new CarlPage(page); 
      const homePage = new HomePage(page);
      let textToSend = data.question; 
      console.log("Frases esperadas:", data.intention)

      await homePage.goToCarl();

      //Si el chat no comenzó desde cero, abrir nuevo chat
      if (!await carlPage.elementIsVisible(carlPage.initialChatMessage)){
        await carlPage.clickOption(carlPage.historyTab);
        await carlPage.clickOption(carlPage.newChatButton); 
      }
            
      await carlPage.waitForElement(carlPage.sendButton);
      await carlPage.waitForElement(carlPage.initialChatMessage);

      await carlPage.writeText(textToSend);
      await carlPage.clickSendButton();
      
      await carlPage.validateIntentionInResponse(data.intention);
        await carlPage.clickOption(carlPage.deleteLastChatButton); 
    });
  }

   
}); 