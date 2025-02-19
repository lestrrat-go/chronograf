describe('Welcome Page', () => {
  beforeEach(() => {
    cy.OAuthLogin('test')
    cy.removeConnections()
    cy.OAuthLogout()
  })

  it('set up InfluxDB connection', () => {
    cy.get('button').contains('Get Started').click()
    cy.get('[id="Connection URL"]').clear().type(Cypress.env('influxDBURL'))
    cy.get('[id="Connection Name"]').clear().type(Cypress.env('connectionName'))
    cy.get('[id="Username"]').clear().type(Cypress.env('username'))
    cy.get('[id="Password"]').clear().type(Cypress.env('password'))

    if (Cypress.env('influxDBURL').startsWith('https')) {
      cy.get('.wizard-checkbox--label').contains('Unsafe SSL').click()
    }

    cy.get('.wizard-button-bar').within(() => {
      cy.get('button').contains('Add Connection').click()
    })

    cy.getByTestID('skip-button').click()
    cy.getByTestID('skip-button').click()
    cy.get('button').contains('View All Connections').click()

    cy.request('GET', '/chronograf/v1/sources').then(response => {
      const connections = response.body.sources

      // Select element with source
      cy.get('.panel-body > table > tbody')
        .should('contain.text', connections[0].name)
        .and('contain.text', connections[0].url)
    })
  })
})
