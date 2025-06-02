describe('Print.js Tests', () => {
  beforeEach(() => {
    // Visit the local HTML file
    cy.visit('test/manual/index.html');

    // Stub window.print and track its calls
    cy.window().then((win) => {
      cy.stub(win, 'print').as('printStub');
    });
  });

  it('Should trigger print for "Print PDF" button', () => {
    cy.contains('button', 'Print PDF').click();
    cy.get('@printStub').should('be.calledOnce');
    // Check if an iframe was created for the PDF
    cy.get('iframe[src="/test/manual/test.pdf"]', { timeout: 10000 }).should('exist');
  });

  it('Should trigger print for "Print PDF with Loading Modal" button', () => {
    cy.contains('button', 'Print PDF with Loading Modal').click();
    cy.get('@printStub').should('be.calledOnce');
    // Check for the modal
    cy.get('#printJS-Modal').should('be.visible');
    // Check if an iframe was created for the PDF
    cy.get('iframe[src="/test/manual/test.pdf"]', { timeout: 10000 }).should('exist');
  });

  it('Should trigger print for "Print PDF with Loading Modal and close callback" button', () => {
    // Stub alert to prevent it from blocking the test
    cy.on('window:alert', cy.stub().as('alertStub'));

    cy.contains('button', 'Print PDF with Loading Modal and close callback').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-Modal').should('be.visible');
    cy.get('iframe[src="/test/manual/test.pdf"]', { timeout: 10000 }).should('exist');
    // Note: Testing the onPrintDialogClose callback directly after printStub is called
    // can be tricky due to timing. printJS removes the frame, and the callback fires.
    // For now, we ensure print was called and the modal appeared.
    // If the callback needs explicit testing, it might require more intricate waits or spies on printJS internals.
  });

  it('Should trigger print for "Print base64 PDF" button', () => {
    cy.contains('button', 'Print base64 PDF').click();
    cy.get('@printStub').should('be.calledOnce');
    // For base64, printJS embeds the PDF data directly into the iframe src
    cy.get('iframe[src^="data:application/pdf;base64,"]', { timeout: 10000 }).should('exist');
  });

  it('Should trigger print for "Print HTML" button', () => {
    cy.contains('button', 'Print HTML').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-html', { timeout: 10000 }).should('exist').and('have.prop', 'innerHTML').should('contain', 'JSON Print Test');
  });

  it('Should trigger print for "Print HTML with custom style" button', () => {
    cy.contains('button', 'Print HTML with custom style').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-html', { timeout: 10000 }).should('exist').and('have.prop', 'innerHTML').should('contain', 'test');
    // We can also check if the style element was added
    cy.get('head style').should('contain.text', '@page { margin-top: 400px }');
  });

  it('Should trigger print for "Print HTML with custom css" button', () => {
    cy.contains('button', 'Print HTML with custom css').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-html', { timeout: 10000 }).should('exist').and('have.prop', 'innerHTML').should('contain', 'test');
    // Check if the link tag for the CSS was added
    cy.get('head link[href="test.css"]').should('exist');
  });

  it('Should trigger print for "Print Raw HTML" button', () => {
    cy.contains('button', 'Print Raw HTML').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-html', { timeout: 10000 }).should('exist').and('have.prop', 'innerHTML').should('contain', 'Print.js Raw HTML Print Test');
  });

  it('Should trigger print for "Print JSON" button', () => {
    cy.contains('button', 'Print JSON').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-json', { timeout: 10000 }).should('exist');
    cy.get('#printJS-json th').should('contain', 'test 1').and('contain', 'test 2');
  });

  it('Should trigger print for "Print Styled JSON" button', () => {
    cy.contains('button', 'Print Styled JSON').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-json', { timeout: 10000 }).should('exist');
    cy.get('#printJS-json th').should('contain', 'test1').and('contain', 'test2');
    cy.get('#printJS-json table').should('have.attr', 'style', 'border: 2px solid #3971A5;');
    cy.get('#printJS-json th').first().should('have.attr', 'style', 'color: red;  border: 2px solid #3971A5;');
  });

  it('Should trigger print for "Print Nested JSON" button', () => {
    cy.contains('button', 'Print Nested JSON').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-json', { timeout: 10000 }).should('exist');
    cy.get('#printJS-json th').should('contain', 'test 1').and('contain', 'test 2 - a');
  });

  it('Should trigger print for "Print Image" button', () => {
    cy.contains('button', 'Print Image').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-image', { timeout: 10000 }).should('exist');
    cy.get('#printJS-image img[src="test-01.jpg"]').should('be.visible');
  });

  it('Should trigger print for "Print Multiple Images" button', () => {
    cy.contains('button', 'Print Multiple Images').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-image', { timeout: 10000 }).should('exist');
    cy.get('#printJS-image img[src="test-01.jpg"]').should('be.visible');
    cy.get('#printJS-image img[src="test-02.jpg"]').should('be.visible');
  });

  it('Should trigger print for "Print Multiple Images Passing Custom Style" button', () => {
    cy.contains('button', 'Print Multiple Images Passing Custom Style').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-image', { timeout: 10000 }).should('exist');
    cy.get('#printJS-image img[src="test-01.jpg"]').should('be.visible').and('have.attr', 'style', 'max-width: 400px; margin: 30px;');
    cy.get('#printJS-image img[src="test-02.jpg"]').should('be.visible').and('have.attr', 'style', 'max-width: 400px; margin: 30px;');
  });

  it('Should trigger print for "Print Multiple Images Passing a Style Sheet" button', () => {
    cy.contains('button', 'Print Multiple Images Passing a Style Sheet').click();
    cy.get('@printStub').should('be.calledOnce');
    // The style sheet is applied to the iframe, not individual images.
    // We check if the iframe exists and contains the images.
    // A more specific check would involve inspecting the iframe's head for the linked stylesheet if possible.
    cy.get('#printJS-image', { timeout: 10000 }).should('exist');
    cy.get('#printJS-image img[src="test-01.jpg"]').should('be.visible');
    cy.get('#printJS-image img[src="test-02.jpg"]').should('be.visible');
     // Check if the link tag for the CSS was added to the iframe's document
    cy.get('iframe#printJS-image', { timeout: 10000 }).its('0.contentDocument.head').find('link[href="test.css"]').should('exist');
  });

  it('Should trigger print for "Print Multiple External Images" button', () => {
    cy.contains('button', 'Print Multiple External Images').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('#printJS-Modal').should('be.visible'); // It shows a modal
    cy.get('#printJS-image', { timeout: 10000 }).should('exist');
    cy.get('#printJS-image img[src="https://printjs.crabbly.com/images/print-01-highres.jpg"]').should('be.visible');
    cy.get('#printJS-image img[src="https://printjs.crabbly.com/images/print-02-highres.jpg"]').should('be.visible');
    cy.get('#printJS-image img[src="https://printjs.crabbly.com/images/print-03-highres.jpg"]').should('be.visible');
  });

  it('Should trigger print for "Print PDF In --kiosk-printing Chrome frameRemoveDelay" button', () => {
    cy.contains('button', 'Print PDF In --kiosk-printing Chrome frameRemoveDelay').click();
    cy.get('@printStub').should('be.calledOnce');
    cy.get('iframe[src="/test/manual/test.pdf"]', { timeout: 10000 }).should('exist');
  });
});
