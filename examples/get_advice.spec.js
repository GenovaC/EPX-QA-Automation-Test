const { test, expect, describe } = require('@playwright/test');
import { GetAdvicePage } from '../pages/get_advices.page';
import { LoginPage } from '../pages/login.page'; 
import { users } from '../utils/test-users';


/////////////////////////////////////////////////////// Grupo 1: Navegación a Get Advices
/////////////////////////////////////////////////////// Pre condición: No haber superado el límite
 describe('Navegación a Get Advices', () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(users.userWithoutAdvices.email, users.userWithoutAdvices.password); //Usuario con 0 advice publicado
    });

    test('Navegar a Get Advices desde el HOME', async ({ page }) => {
        const getAdvicePage = new GetAdvicePage(page);

        await page.goto('/'); // Usa baseURL del config
        await getAdvicePage.click(getAdvicePage.getAdviceHomeButton);

        expect(getAdvicePage.getAdviceFormTitle, 'No cargó el título del Formulario Get Expert Advice').toBeVisible();    
    });

    test('Navegar a Get Advices desde Achieve', async ({ page }) => {
        const getAdvicePage = new GetAdvicePage(page);

        await page.goto('/achieve'); // Usa baseURL del config
        await getAdvicePage.click(getAdvicePage.getAdviceOption);

        expect(getAdvicePage.getAdviceFormTitle, 'No cargó el título del Formulario Get Expert Advice').toBeVisible();    
    });
   
}); 

/*
/////////////////////////////////////////////////////// Pre condición: No haber publicado ningún get advice previamente
  test('Publicar 1er Get Advice', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const getAdvicePage = new GetAdvicePage(page);

      //Iniciar sesión
      await loginPage.navigate();
      await loginPage.login(users.userWithoutAdvices.email, users.userWithoutAdvices.password); //Usuario con 0 advice publicado 

      await getAdvicePage.click(getAdvicePage.getAdviceHomeButton);
      
      //Validar que el formulario de Get Advice cargó      
      let isTitleVisible = await getAdvicePage.isVisible(getAdvicePage.getAdviceFormTitle);
      let isSubmitButtonVisible = await getAdvicePage.isVisible(getAdvicePage.getAdviceSubmitButton);

      expect(isTitleVisible, 'No cargó el título del Formulario Get Expert Advice').toBe(true);   
      expect(isSubmitButtonVisible, 'No cargó el botón del Formulario Get Expert Advice').toBe(true); 
      
      //Seleccionar skill (por defecto la primera skill)
      await getAdvicePage.checkRadioInput(getAdvicePage.anySkillRadioInput);

      //Ingresar descripción del get Advice      
      await getAdvicePage.click(getAdvicePage.descriptionTextEditor);
      await page.keyboard.type('This is an automated testing by Génova Castillo');   
      await getAdvicePage.click(getAdvicePage.getAdviceSubmitButton); //Publicar

      //Validar que es visible el modal "Way to go!" al publicar un advice
      let isSuccessPostTitleVisible = await getAdvicePage.isVisible(getAdvicePage.successPostGetAdviceTitle);
      let isContinueButtonVisible = await getAdvicePage.isVisible(getAdvicePage.succesPostGetAdviceButton);

      expect(isSuccessPostTitleVisible, 'No cargó el modal de éxito al publicar un Get Advice').toBe(true);   
      expect(isContinueButtonVisible, 'No cargó el botón Continuar del modal de éxito al publicar un Get Advice').toBe(true); 

  }); */

  /////////////////////////////////////////////////////// Pre condición: Haber publicado solo 1 Advice, no haber pagado el 2do
  test('Publicar 2do Get Advice sin pagar', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const getAdvicePage = new GetAdvicePage(page);
      const expectedAmoutToPay = '$29.99';

      //Iniciar sesión
      await loginPage.navigate();
      await loginPage.login(users.userWithOneAdvice.email, users.userWithOneAdvice.password); //Usuario con 1 advice publicado   
      
      await getAdvicePage.click(getAdvicePage.getAdviceHomeButton);
      
      //Validar que el modal de upgrade membership      
      expect(getAdvicePage.limitedAdvicesText, 'No cargó el título del modal Pay to Play').toBeVisible();   
      expect(getAdvicePage.upgradeButton, 'No cargó el botón del modal Pay to Play').toBeVisible(); 
      expect(getAdvicePage.payToPlayButton, 'No cargó la opción Pay to Play en el modal').toBeVisible(); 

      //Abrir formulario de pago
      await getAdvicePage.click(getAdvicePage.payToPlayButton);

      //Validar monto del pago
      let ammoutToPay = await getAdvicePage.getText(getAdvicePage.amountText);
      expect(ammoutToPay, 'Cargó un monto distinto al esperado para publicar 2do Get Advice').toBe(expectedAmoutToPay); 

  }); 

  /////////////////////////////////////////////////////// Pre condición: Haber publicado 2 get advices en el mes
  test('Publicar 3er Advice', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const getAdvicePage = new GetAdvicePage(page);
      
      await loginPage.navigate();
      await loginPage.login(users.userWithTwoAdvices.email, users.userWithTwoAdvices.password); //Usuario con 0 advice publicado
      
      await page.goto('/'); // Usa baseURL del config
      await getAdvicePage.click(getAdvicePage.getAdviceHomeButton);
      
      //Validar que el modal de posts excedidos  
      expect(getAdvicePage.maximumPostingModalTitle, 'No cargó el título del modal Máximo de posts Excedidos').toBeVisible();   
      expect(getAdvicePage.maximumPostingModalText, 'No cargó el texto del modal Máximo de posts Excedidos').toBeVisible(); 

  });

 