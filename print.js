/*
 * Print.js
 * http://printjs.crabbly.com
 * Version: 1.0.0
 *
 * Copyright 2016 Rodrigo Vieira (@crabbly)
 * Released under the MIT license
 * https://github.com/crabbly/print.js/LICENSE.md
 */

(function(window, document) {
    'use strict';

    var printTypes = ['pdf', 'html', 'image', 'json'];

    var defaultParams = {
        printable: null,
        type: 'pdf',
        header: null,
        maxWidth: 800,
        font: 'TimesNewRoman',
        font_size: '12pt',
        honorMarginPadding: true,
        honorColor: false,
        properties: null,
        showModal: false,
        modalMessage: 'Retrieving Document...',
        frameId: 'printJS'
    };

    //print friendly defaults
    var printFriendlyElement = 'max-width: ' + defaultParams.maxWidth + 'px !important;' + defaultParams.font_size + ' !important;';
    var bodyStyle = 'font-family:' + defaultParams.font + ' !important; font-size: ' + defaultParams.font_size + ' !important; width:100%;';
    var headerStyle = 'font-weight:300;';

    //get document body
    var documentBody = document.getElementsByTagName("body")[0];

    //Occupy the global variable of printJS
    window.printJS = function() {

        //check if a printable document or object was supplied
        if (arguments[0] === undefined) {
            window.console.error('printJS expects at least 1 attribute.');
            return false;
        }

        //instantiate print object
        new PrintJS(arguments);
    };

    //printJS class
    var PrintJS = function() {

        var args = arguments[0];

        var print = this;

        print.params = extend({}, defaultParams);

        switch (typeof args[0]) {

            case 'string':
                print.params.printable = encodeURI(args[0]);
                print.params.type = args[1] || defaultParams.type;
                break;

            case 'object':
                print.params.printable = args[0].printable;
                print.params.type = args[0].type || defaultParams.type;
                print.params.frameId = args[0].frameId || defaultParams.frameId;
                print.params.header = args[0].header || defaultParams.header;
                print.params.maxWidth = args[0].maxWidth || defaultParams.maxWidth;
                print.params.font = args[0].font || defaultParams.font;
                print.params.font_size = args[0].font_size || defaultParams.font_size;
                print.params.honorMarginPadding = (typeof args[0].honorMarginPadding != 'undefined') ? args[0].honorMarginPadding : defaultParams.honorMarginPadding;
                print.params.properties = args[0].properties || defaultParams.properties;
                print.params.showModal = (typeof args[0].showModal != 'undefined') ? args[0].showModal : defaultParams.showModal;
                print.params.modalMessage = args[0].modalMessage || defaultParams.modalMessage;
                break;

            default:
                throw new Error('Unexpected argument type! Expected "string" or "object", got ' + typeof args[0]);
        }

        //some validation
        print.validateInput();


        //check if showing feedback to user (useful for large files)
        if (print.params.showModal) {
            print.showModal();
        }

        //To prevent duplication and "onload" issues, remove print.printFrame from DOM, if it exists.
        var usedFrame = document.getElementById(print.params.frameId);

        if (usedFrame) {
            usedFrame.parentNode.removeChild(usedFrame);
        }

        //create a new iframe element
        print.printFrame = document.createElement('iframe');

        //set iframe attributes
        print.printFrame.setAttribute('style', 'display:none;');
        print.printFrame.setAttribute('id', print.params.frameId);

        //check printable type
        switch (print.params.type) {
            case 'pdf':
                    print.pdf();
                break;

            case 'image':
                    print.image();
                break;
            case 'html':
                    print.html();
                break;
            case 'json':
                    print.json();
                break;

            default:
                throw new Error('Invalid printable type');
                break;
        }
    };


    PrintJS.prototype.pdf = function() {
        var pdf = this.params.printable;
        var print = this;

        //if showing feedback to user, pre load pdf files (hacky)
        if (print.params.showModal) {

            var getPDF = new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.open('GET', print.params.printable);
                xhr.send();
                resolve('PDF Loaded!');
            });

            getPDF.then(function() {
                print.printFrame.setAttribute('src', print.params.printable);
                print.print();
            });
        }
        else {
            print.printFrame.setAttribute('src', print.params.printable);
            print.print();
        }
    };


    PrintJS.prototype.image = function() {
        //create the image element
        var img = document.createElement('img');
        img.setAttribute('style', 'width:100%;');
        img.src = this.params.printable;

        //load image
        var loadImage = new Promise(function(resolve, reject) {

            var loadPrintableImg = setInterval(checkImgLoad, 100);

            function checkImgLoad() {
                if (img.complete) {
                    window.clearInterval(loadPrintableImg);
                    resolve('Image loaded. Read to print!');
                }
            }
        });

        //assign this to a variable, to be used in the promise
        var print = this;

        loadImage.then(function(result) {
            //create wrapper
            var printableElement = document.createElement('div');
            printableElement.setAttribute('style', 'width:100%');

            //to prevent firefox from not loading the image within iframe, we can use a base64-encoded data URL of the image pixel data
            if (isFirefox) {
                //let's make firefox happy
                var canvas = document.createElement('canvas');
                canvas.setAttribute('width', img.width);
                canvas.setAttribute('height', img.height);
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);

                //reset img src attribute with canvas dataURL
                img.setAttribute('src', canvas.toDataURL('JPEG', 1.0));
            }

            printableElement.appendChild(img);

            //add header if any
            if (print.params.header) {
                print.addHeader(printableElement);
            }

            print.printFrame.setAttribute('srcdoc', printableElement.outerHTML);

            print.print();
        });
    };


    PrintJS.prototype.html = function() {
        //get HTML printable element
        var printElement = document.getElementById(this.params.printable);

        //check if element exists
        if (!printElement) {
            window.console.error('Invalid HTML element id: ' + this.params.printable);

            return false;
        }

        //make a copy of the printElement to prevent DOM changes
        var printableElement = document.createElement('div');
        printableElement.appendChild(printElement.cloneNode(true));

        //add cloned element to DOM, to have DOM element methods available. It will also be easier to colect styles
        printableElement.setAttribute('style', 'display:none;');
        printableElement.setAttribute('id', 'printJS-html');
        printElement.parentNode.appendChild(printableElement);

        //update printableElement variable with newly created DOM element
        printableElement = document.getElementById('printJS-html');

        //get main element styling
        printableElement.setAttribute('style', this.collectStyles(printableElement) + 'margin:0 !important;');

        //get all children elements
        var elements = printableElement.children;

        //get styles for all children elements
        this.loopNodesCollectStyles(elements);

        //add header if any
        if (this.params.header) {
            this.addHeader(printableElement);
        }

        //pass printable HTML to iframe
        this.printFrame.srcdoc = addWrapper(printableElement.innerHTML);

        //remove DOM printableElement
        printableElement.parentNode.removeChild(printableElement);

        this.print();
    };


    PrintJS.prototype.json = function() {
        //check if we received proper data
        if (typeof this.params.printable !== 'object') {
            throw new Error('Invalid javascript data object (JSON).');
        }

        //check if properties were provided
        if (!this.params.properties || typeof this.params.properties !== 'object') {
            throw new Error('Invalid properties array for your JSON data.');
        }

        //variable to hold html string
        var htmlData = '';

        //check print has header
        if (this.params.header) {
            htmlData += '<h1 style="' + headerStyle + '">' + this.params.header + '</h1>';
        }

        //function to build html templates for json data
        htmlData += this.jsonToHTML();

        htmlData = addWrapper(htmlData);

        this.printFrame.setAttribute('srcdoc', htmlData);

        this.print();
    };


    PrintJS.prototype.print = function() {
        var print = this;

        //append iframe element to document body
        documentBody.appendChild(this.printFrame);

        //set variables to use within .onload
        var frameId = this.params.frameId;
        
        //wait for iframe to load all content
        this.printFrame.onload = function() {

            var printJS = document.getElementById(frameId);

            printJS.focus();
            printJS.contentWindow.print();

            //if showing feedback to user, remove processing message (close modal)
            if (print.params.showModal) {

                print.disablePrintModal();
            }
        };
    };


    PrintJS.prototype.collectStyles = function(element) {
        var win = document.defaultView || window, style = [];

        //string variable to hold styling for each element
        var elementStyle = '';

        if (win.getComputedStyle) { //modern browsers

            style = win.getComputedStyle(element, '');

            for (var i = 0; i < style.length; i++) {

                //styles including
                var targetStyles = ['border', 'float', 'box'];
                //exact
                var targetStyle = ['clear', 'display', 'width', 'min-width', 'height', 'min-height', 'max-height'];

                //optinal - include margin and padding
                if (this.params.honorMarginPadding) {
                    targetStyle.push('margin', 'padding');
                }

                //optinal - include color
                if (this.params.honorColor) {
                    targetStyle.push('color');
                }

                for(var s = 0; s < targetStyle.length; s++) {
                    if (style[i].indexOf(targetStyles[s]) !== -1 || style[i].indexOf(targetStyle[s]) === 0) {
                        elementStyle += style[i] + ':' + style.getPropertyValue(style[i]) + ';';
                    }
                }
            }
        } else if (element.currentStyle) { //IE

            style = element.currentStyle;

            for (var name in style) {
                if (style.indexOf( 'border' ) !== -1 && style.indexOf( 'color' ) !== -1) {
                    elementStyle +=  name + ':' + style[name] + ';';
                }
            }
        }

        //add printer friendly
        elementStyle += printFriendlyElement;

        return elementStyle;
    };


    PrintJS.prototype.loopNodesCollectStyles = function(elements) {
        for (var n = 0; n < elements.length; n++) {

            var currentElement = elements[n];

            //Form Printing - check if is element Input
            var tag = currentElement.tagName;
            if (tag == 'INPUT' || tag == 'TEXTAREA' || tag == 'SELECT') {
                //save style to variable
                var textStyle = this.collectStyles(currentElement);
                //remove INPUT element and insert a text node
                var parent = currentElement.parentNode;
                //get text value
                var textNode = tag == 'SELECT' ?
                    document.createTextNode(currentElement.options[currentElement.selectedIndex].text)
                    : document.createTextNode(currentElement.value);
                //create text element
                var textElement = document.createElement('div');
                textElement.appendChild(textNode);
                //add style to text
                textElement.setAttribute('style', textStyle);
                //add text
                parent.appendChild(textElement);
                //remove input
                parent.removeChild(currentElement);
            }
            else {
                //get all styling for print element
                currentElement.setAttribute('style', this.collectStyles(currentElement));
            }

            //check if more elements in tree
            var children = currentElement.children;

            if (children.length) {

                this.loopNodesCollectStyles(children);
            }
        }
    };


    PrintJS.prototype.addHeader = function(printElement) {
        //create header element
        var headerElement = document.createElement('h1');

        //create header text node
        var headerNode = document.createTextNode(this.params.header);

        //build and style
        headerElement.appendChild(headerNode);
        headerElement.setAttribute('style', headerStyle);

        printElement.insertBefore(headerElement, printElement.childNodes[0]);
    };


    PrintJS.prototype.jsonToHTML = function() {
        var data = this.params.printable;
        var properties = this.params.properties;

        var htmlData = '<div style="display:flex; flex-direction: column;">';

        //header
        htmlData += '<div style="flex:1; display:flex;">';

        for (var a = 0; a < properties.length; a++) {
            htmlData += '<div style="flex:1; padding:5px;">' + capitalizePrint(properties[a]) + '</div>';
        }

        htmlData += '</div>';


        //create html data
        for (var i = 0; i < data.length; i++) {

            htmlData += '<div style="flex:1; display:flex; border:1px solid lightgray;">';

            for (var n = 0; n < properties.length; n++) {

                htmlData += '<div style="flex:1; padding:5px;">' + data[i][properties[n]] + '</div>';
            }

            htmlData += '</div>';
        }

        htmlData += '</div>';

        return htmlData;
    };


    PrintJS.prototype.validateInput = function() {
        if (!this.params.printable) {
            throw new Error('Missing printable information.');
        }

        if (!this.params.type || typeof this.params.type !== 'string' || printTypes.indexOf(this.params.type.toLowerCase()) == -1) {
            throw new Error('Invalid print type. Available types are: pdf, html, image and json.');
        }
    };


    PrintJS.prototype.showModal = function() {
        //build modal
        var modalStyle = 'font-family:sans-serif; ' +
            'display:table; ' +
            'text-align:center; ' +
            'font-weight:300; ' +
            'font-size:30px; ' +
            'left:0; top:0;' +
            'position:fixed; ' +
            'z-index: 9990;' +
            'color: #0460B5; ' +
            'width: 100%; ' +
            'height: 100%; ' +
            'background-color:rgba(255,255,255,.9);' +
            'transition: opacity .3s ease;';

        //create wrapper
        var printModal = document.createElement('div');
        printModal.setAttribute('style', modalStyle);
        printModal.setAttribute('id', 'printJS-Modal');

        //create content div
        var contentDiv = document.createElement('div');
        contentDiv.setAttribute('style', 'display:table-cell; vertical-align:middle; padding-bottom:100px;');

        //add close button (requires print.css)
        var closeButton = document.createElement('div');
        closeButton.setAttribute('class', 'printClose');
        closeButton.setAttribute('id', 'printClose');
        contentDiv.appendChild(closeButton);

        //add spinner (requires print.css)
        var spinner = document.createElement('span');
        spinner.setAttribute('class', 'printSpinner');
        contentDiv.appendChild(spinner);

        //add message
        var messageNode = document.createTextNode(this.params.modalMessage);
        contentDiv.appendChild(messageNode);

        //add contentDiv to printModal
        printModal.appendChild(contentDiv);

        //append print modal element to document body
        documentBody.appendChild(printModal);

        //add event listener to close button
        var print = this;
        document.getElementById('printClose').addEventListener('click', function() {
            print.disablePrintModal();
        });
    };


    PrintJS.prototype.disablePrintModal = function() {
        var printFrame = document.getElementById('printJS-Modal');

        printFrame.parentNode.removeChild(printFrame);
    };


    function addWrapper(htmlData) {
        return '<div style="' + bodyStyle + '">' + htmlData + '</div>';
    }


    //update default print.params with user input
    function extend(a, b) {
        for (var key in b) {
            if (b.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }

        return a;
    }

    //capitalize string
    function capitalizePrint(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    //check user's browser
    function isFirefox() {
        return typeof InstallTrigger !== 'undefined';
    }

})(window, document);
