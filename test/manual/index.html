<html>
  <script src='../../dist/print.js'></script>
  <script type="text/javascript">
    function printPdf() {
      printJS('/test/manual/test.pdf')
    }

    function printPdfWithModal() {
      printJS({
        printable: '/test/manual/test.pdf',
        type: 'pdf',
        showModal: true
      })
    }
    
    function printPdfWithModalAndCloseCallback() {
      printJS({
        printable: '/test/manual/test.pdf',
        type: 'pdf',
        showModal: true,
        onPrintDialogClose: () => console.log('The print dialog was closed'),
        onPdfOpen: () => console.log('Pdf was opened in a new tab due to an incompatible browser')
      })
    }

    function printPdfCompatibleBrowser() {
      printJS({
        printable: '/test/manual/test.pdf',
        type: 'pdf',
        onBrowserIncompatible: () => {
          alert('Browser incompatible')
          return false
        }
      })
    }

    function printPdfBase64() {
      fetch('/test/manual/base64.txt').then(function(response) {
        response.text().then(function(base64) {
          printJS({
            printable: base64,
            type: 'pdf',
            base64: true
          })
        })
      })
    }

    function printHtml() {
      printJS({
        printable: 'test',
        type: 'html'
      })
    }

    function printRawHtml() {
      printJS({
        printable: `<h1>Print.js Raw HTML Print Test</h1>
        <p class="blueText">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        type: 'raw-html',
        style: '.blueText {color:blue;}'
      })
    }

    function printHtmlCustomStyle() {
      const style = '@page { margin-top: 400px } @media print { h1 { color: blue } }'

      printJS({
        printable: 'test',
        type: 'html',
        style: style,
        scanStyles: false
      })
    }

    function printHtmlCss() {
      printJS({
        printable: 'test',
        type: 'html',
        css: 'test.css',
        scanStyles: false
      })
    }

    function printJson() {
      let data = []
      for (let i=0; i <= 1000; i++) {
        data.push({
          test1: createRandomString(),
          test2: createRandomString()
        })
      }

      printJS({
        printable: data,
        properties: [
          {
            field: 'test1',
            displayName: 'test 1',
            columnSize: 1
          },
          {
            field: 'test2',
            displayName: 'test 2',
            columnSize: 4
          }
        ],
        type: 'json',
        header: 'JSON Print Test'
      })
    }

    function printStyledJson() {
      let data = [
        {
          test1: 'Test1 string',
          test2: 'Test2 string'
        },
        {
          test1: 'more Test1 string',
          test2: 'more Test2 string'
        }
      ]

      printJS({
        printable: data,
        properties: ['test1', 'test2'],
        type: 'json',
        gridStyle: 'border: 2px solid #3971A5;',
        gridHeaderStyle: 'color: red;  border: 2px solid #3971A5;'
      })
    }

    function printNestedJson() {
      let data = []
      for (let i=0; i <= 100; i++) {
        data.push({
          test1: createRandomString(),
          test2: {
            a: createRandomString()
          }
        })
      }

      printJS({
        printable: data,
        properties: [
          {
            field: 'test1',
            displayName: 'test 1',
            columnSize: 1
          },
          {
            field: 'test2.a',
            displayName: 'test 2 - a',
            columnSize: 4
          }
        ],
        type: 'json'
      })
    }

    function createRandomString() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }

    function printImage() {
      printJS('test-01.jpg', 'image')
    }

    function printImages() {
      printJS({
        printable: [
          'test-01.jpg',
          'test-02.jpg'
        ],
        type: 'image'
      })
    }

    function printStyledImages() {
      printJS({
        printable: [
          'test-01.jpg',
          'test-02.jpg'
        ],
        type: 'image',
        style: 'img { max-width: 400px; margin: 30px; }'
      })
    }

    function printStyledImagesWithStyleSheet() {
      printJS({
        printable: [
          'test-01.jpg',
          'test-02.jpg'
        ],
        type: 'image',
        css: 'test.css',
      })
    }

    function printExternalImages() {
      printJS({
        printable: [
          'https://printjs.crabbly.com/images/print-01-highres.jpg',
          'https://printjs.crabbly.com/images/print-02-highres.jpg',
          'https://printjs.crabbly.com/images/print-03-highres.jpg'
        ],
        type: 'image',
        showModal: true,
        modalMessage: 'Printing...'
      })
    }
  </script>
  <body>
    <section id="test" class="test">
      <h1>Print.js Test Page</h1>
      <p>
        <button onClick='printPdf();'>
          Print PDF
        </button>
        <button onClick='printPdfWithModal();'>
          Print PDF with Loading Modal
        </button>
        <button onClick='printPdfWithModalAndCloseCallback();'>
          Print PDF with Loading Modal and close callback
        </button>
        <button onClick='printPdfCompatibleBrowser();'>
          Print PDF only on compatible browser
        </button>
        <button onClick='printPdfBase64();'>
          Print base64 PDF
        </button>
      </p>
      <p>
        <button onClick='printHtml();'>
          Print HTML
        </button>
        <button onClick='printHtmlCustomStyle();'>
          Print HTML with custom style
        </button>
        <button onClick='printHtmlCss();'>
          Print HTML with custom css
        </button>
        <button onClick='printRawHtml();'>
          Print Raw HTML
        </button>
      </p>
      <p>
        <button onClick='printJson();'>
          Print JSON
        </button>
        <button onClick='printStyledJson();'>
          Print Styled JSON
        </button>
        <button onClick='printNestedJson();'>
          Print Nested JSON
        </button>
      </p>
      <p>
        <button onClick='printImage();'>
          Print Image
        </button>
        <button onClick='printImages();'>
          Print Multiple Images
        </button>
        <button onClick='printStyledImages();'>
          Print Multiple Images Passing Custom Style
        </button>
        <button onClick='printStyledImagesWithStyleSheet();'>
          Print Multiple Images Passing a Style Sheet
        </button>
        <button onClick='printExternalImages();'>
          Print Multiple External Images
        </button>
      </p>
      <div>
        <h2>Form Elements</h2>
        <div>
          <input type="checkbox" /> Checkbox Example
        </div>
        <div>
            <input type="text" value="Styled text input content..." style="color: red; min-width: 300px;" />
        </div>
        <div>
            <textarea>Text area content...</textarea>
        </div>
        <div>
            <canvas id="myCanvas" width="200" height="50"
            style="border:2px solid blue;">
            Your browser does not support the canvas element.
            </canvas>

            <script>
              var canvas = document.getElementById("myCanvas");
              var ctx = canvas.getContext("2d");
              ctx.fillStyle = "#FF0000";
              ctx.fillRect(0,0,150,25);
            </script>
        </div>
        <div>
          <select>
            <option value="super" selected>Super</option>
            <option value="test">Test</option>
            <option value="printjs">Print.js</option>
          </select>
        </div>
      </div>
    </section>
  </body>
</html>