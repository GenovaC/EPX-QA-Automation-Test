const { test, expect, describe } = require('@playwright/test');
import chatData from '../data/carl_data_keywords.json';
import { CarlPage } from '../pages/carl.page';
import { HomePage } from '../pages/home.page';
import { TribesPage } from '../pages/tribes.page';
import { LoginPage } from '../pages/login.page'; 
import { users } from '../utils/test-users';
import { myJsonSchema } from '../utils/data_json_to_validate';
import Ajv from 'ajv';

const MIN_WAIT_TIME = 1000;
const MAX_WAIT_TIME = 5000;
const TIMEOUT = 60000;

//Para pruebas de JSON
const ajv = new Ajv();
const validate = ajv.compile(myJsonSchema);

/////////////////////////////////////////////////////// Grupo 1: Navegación a CARL
describe('Navegación a CARL', () => {

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
      test.setTimeout(TIMEOUT);
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(users.userPremium.email, users.userPremium.password); //Usuario con 0 advice publicado
    
      await page.goto('/carl'); 
      await page.waitForTimeout(MAX_WAIT_TIME); //Espera para cargar correctamente el bot
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
   
  test('Enviar pregunta vacía a Carl', async ({ page }) => {   
      const carlPage = new CarlPage(page);   
      const textToSend = "   ";
      let currentTypedText = "";

      await carlPage.writeText(textToSend);

      currentTypedText = await carlPage.getChatInputText();
      expect(currentTypedText, 'El texto escrito en el input no está vacío').toBe(textToSend);
      
      await carlPage.clickOption(carlPage.sendButton);

      let isLoading = await carlPage.isAnswerLoading();

      expect(isLoading, 'CARL no evita que se envíen preguntas que tengan solo caracteres en blanco').toBe(false);  
  });
}); 

/////////////////////////////////////////////////////// Grupo 3: Preguntas sobre las tribus a CARL
describe('Solicitud de Tribus a CARL', () => {

  //Se ejecutará antes de cada uno de los tests dentro de este bloque Describe
  test.beforeEach(async ({ page }) => {   
      test.setTimeout(TIMEOUT);
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(users.userPremium.email, users.userPremium.password); //Usuario con 0 advice publicado
    
      await page.goto('/carl'); 
      await page.waitForTimeout(MAX_WAIT_TIME); //Espera para cargar correctamente el bot
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
   
}); 


/////////////////////////////////////////////////////// Grupo 4: Validación de palabras clave e intenciones en respuestas de CARL
describe('Validar palabras clave e intenciones en preguntas a CARL', () => {
  
  //Se ejecutará antes de cada uno de los tests dentro de este bloque Describe
  test.beforeEach(async ({ page }) => {  
      test.setTimeout(TIMEOUT);
      const loginPage = new LoginPage(page);
      
      await loginPage.navigate();
      await loginPage.login(users.userPremium.email, users.userPremium.password); //Usuario con 0 advice publicado  

      await page.goto('/carl'); 
      await page.waitForTimeout(MAX_WAIT_TIME); //Espera para cargar correctamente el bot
      
  });

  
  for (const data of chatData) {
    test(`Validar palabras claves para la pregunta: "${data.question}"`, async ({ page }) => {
      const carlPage = new CarlPage(page); 

      let textToSend = data.question; 
      console.log("Keywords esperadas:", data.keywords)

      // Si hay historial de mensajes, entonces se inicia un chat nuevo 
      if (await carlPage.isMessageHistory()){ 
        await carlPage.clickOption(carlPage.historyTab);
        await carlPage.clickOption(carlPage.newChatButton); 
        await page.waitForTimeout(MIN_WAIT_TIME);
      }    
        
      await carlPage.waitForElement(carlPage.initialChatMessage);      

      await carlPage.writeText(textToSend);
      await carlPage.clickSendButton();
      
      await carlPage.validateKeywordsInResponseFlexibleMode(data.keywords);
      await carlPage.clickOption(carlPage.deleteLastChatButton); //Borrar el último chat para no saturar historial
    });
  } 

  for (const data of chatData) {
    test(`Validar intención de respuesta para la pregunta: "${data.question}"`, async ({ page }) => {
      const carlPage = new CarlPage(page); 

      let textToSend = data.question; 
      console.log("Frases esperadas:", data.intention)

      // Si hay historial de mensajes, entonces se inicia un chat nuevo
      if (await carlPage.isMessageHistory()){ 
        await carlPage.clickOption(carlPage.historyTab);
        await carlPage.clickOption(carlPage.newChatButton); 
        await page.waitForTimeout(MIN_WAIT_TIME);
      } 

      await carlPage.waitForElement(carlPage.initialChatMessage);  

      await carlPage.writeText(textToSend);
      await carlPage.clickSendButton();
      
      await carlPage.validateIntentionInResponse(data.intention);
      await carlPage.clickOption(carlPage.deleteLastChatButton);  //Borrar el último chat para no saturar historial
    });
  }

   
}); 

/////////////////////////////////////////////////////// Grupo 5: Validar formato de respuestas
describe('Validar formato de respuestas', () => {

  //Se ejecutará antes de cada uno de los tests dentro de este bloque Describe
  test.beforeEach(async ({ page }) => { 
      test.setTimeout(TIMEOUT); 
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(users.userPremium.email, users.userPremium.password); //Usuario con 0 advice publicado
    
      await page.goto('/carl'); 
      await page.waitForTimeout(MAX_WAIT_TIME); //Espera para cargar correctamente el bot
  });

  test('Solicitar respuesta en formato JSON', async ({ page }) => {
      const carlPage = new CarlPage(page);    

      const textToSend = `Dame un top 3 de eventos online, la respuesta debe ser exclusivamente en formato JSON y debe incluir las propiedades "name", "date" y "type", y NADA MÁS QUE EL JSON`;

      await carlPage.writeText(textToSend);
      await carlPage.clickSendButton();

      let isLoading = await carlPage.isAnswerLoading();
      let isValidJSON = false;
      let responseJson = "";

      expect(isLoading, 'La pregunta enviada no disparó el loader de respuesta de CARL').toBe(true);    

      const responseText = await carlPage.getLastCarlAnswer();

      console.log(responseText);
      
      // Paso 1: Intenta parsear la respuesta. Si falla, el formato no es JSON.
      try {
        responseJson = JSON.parse(responseText);
        isValidJSON = true;
      } catch (e) {
        console.log(`La respuesta no es un JSON válido. Error detallado: ${e}`);
      }

      // Verificar que la respuesta sea un JSON válido antes de continuar.
      expect(isValidJSON, 'La respuesta del chatbot no es un JSON válido.').toBe(true);

      // Paso 2: Valida la estructura del objeto JSON parseado.
      const isValid = validate(responseJson);

      // Si la validación falla, muestra los errores para facilitar la depuración.
      if (!isValid) {
        console.error('Errores de validación JSON:', validate.errors);
      }

      // Afirma que la validación fue exitosa.
      expect(isValid, "El JSON de la respuesta no tiene el formato esperado").toBe(true);
          
  });
   
}); 