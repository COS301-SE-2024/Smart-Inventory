import 'cypress-wait-until';

declare global {
  namespace Cypress {
    interface Chainable {
      waitUntil(
        condition: () => boolean | Cypress.Chainable<boolean>,
        options?: {
          timeout?: number
          interval?: number
          errorMsg?: string
        }
      ): Cypress.Chainable<boolean>
    }
  }
}