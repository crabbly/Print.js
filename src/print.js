/*
 * Print.js
 * http://printJS.crabbly.com
 * Version: 1.0.0
 *
 * Copyright 2016 Rodrigo Vieira (@crabbly)
 * Released under the MIT license
 * https://github.com/crabbly/print.js/LICENSE.md
 */

(function(window, document) {
    'use strict';

    var defaultParams = {
        printable: null,
        type: 'pdf',
        header: null,
        maxWidth: 800,
        font: 'TimesNewRoman',
        font_size: '12pt',
        honorMarginPadding: true,
        properties: null,
        showModal: false,
        modalMessage: 'Retrieving Document...',
        frameId: 'printJS'
    };

    //print friendly defaults
    var printFriendlyElement = 'max-width: ' + defaultParams.maxWidth + 'px !important;' + defaultParams.font_size + ' !important;';
    var bodyStyle = 'font-family:' + defaultParams.font + '; font-size: ' + defaultParams.font_size + ' !important;';
    var headerStyle = 'font-weight:300;';

    //get document body
    var documentBody = document.getElementsByTagName("body")[0];

    //Occupy the global variable of printJS, and create a simple base class
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
                throw new Error('Unexpected type of argument! Expected "string" or "object", got ' + typeof args[0]);
        }

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
        this.printFrame.setAttribute('src', this.params.printable);

        this.send(this.printFrame, this.params);
    };


    PrintJS.prototype.image = function() {
        //create image element (with wrapper)
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

        var print = this;

        loadImage.then(function(result) {
            //create wrapper
            var printableElement = document.createElement('div');
            printableElement.setAttribute('style', 'width:100%');
            printableElement.appendChild(img);

            //add header if any
            if (print.params.header) {
                print.addHeader(printableElement);
            }

            print.printFrame.setAttribute('srcdoc', printableElement.outerHTML);

            print.send(print.printFrame, print.params);
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

        //add cloned element to DOM, to have DOM element methods available. It will also be easier to colect the correct elements styles
        printableElement.setAttribute('style', 'display:none;');
        printableElement.setAttribute('id', 'printJS-html');
        printElement.parentNode.appendChild(printableElement);

        //update printableElement variable with newly created DOM element
        printableElement = document.getElementById('printJS-html');

        //get main element styling
        printableElement.setAttribute('style', this.collectStyles(printableElement, this.params) + 'margin:0 !important;');

        //get all children elements
        var elements = printableElement.children;

        //get styles for all children elements
        this.loopNodesCollectStyles(elements, this.params);

        //add header if any
        if (this.params.header) {
            this.addHeader(printableElement);
        }

        //pass printable HTML to iframe
        this.printFrame.srcdoc = printableElement.innerHTML;

        //remove DOM printableElement
        printableElement.parentNode.removeChild(printableElement);

        this.send(this.printFrame, this.params);
    };


    PrintJS.prototype.json = function() {
        var print = this;

        //check if we received proper data
        if (!print.params.printable || typeof print.params.printable !== 'object') {
            throw new Error('Invalid javascript data object (JSON).');
        }

        //check if properties were provided
        if (!print.params.properties || typeof print.params.properties !== 'object') {
            throw new Error('Invalid properties array for your JSON data.');
        }

        //variable to hold html string
        var htmlData = '';

        //check print has header
        if (print.params.header) {
            htmlData += '<h1 style="' + headerStyle + '">' + print.params.header + '</h1>';
        }

        htmlData += print.jsonToHTML();

        //create function to build html templates for json data
        print.printFrame.setAttribute('srcdoc', htmlData);

        print.send(print.printFrame, print.params);
    };


    PrintJS.prototype.send = function() {
        //append iframe element to document body
        documentBody.appendChild(this.printFrame);

        //set variables to use within .onload
        var frameId = this.params.frameId;
        var type = this.params.type;
        
        //wait for iframe to load all content
        this.printFrame.onload = function() {

            //initiates print once content has been loaded into iframe
            var printJS = document.getElementById(frameId);

            //if printing HTML or JSON, set body style
            if (type == 'html' || type == 'json') {
                var printDocument = printJS.contentDocument;
                printDocument.body.style = bodyStyle;
            }

            printJS.focus();
            printJS.contentWindow.print();

            //reset stuff
        };

        //if showing feedback to user, remove processing message
        if (this.params.showModal) {
            this.disablePrintModal();
        }
    };


    PrintJS.prototype.collectStyles = function(element) {
        var win = document.defaultView || window, style = [];

        //string variable to hold styling for each element
        var elementStyle = '';

        if (win.getComputedStyle) { //modern browsers

            style = win.getComputedStyle(element, '');

            for (var i = 0; i < style.length; i++) {
                //no need to receive many of the computed styles, let's skip some
                if (style[i] != 'font-family' && style[i].indexOf( 'animation' ) === -1 && style[i].indexOf( 'background' ) === -1 && style[i].indexOf( 'image' ) === -1 && style[i].indexOf( 'transition' ) === -1 && style[i].indexOf( 'text-fill' ) === -1) {

                    //optionaly dismiss margin and padding
                    if (this.params.honorMarginPadding) {
                        elementStyle += style[i] + ':' + style.getPropertyValue(style[i]) + ';';
                    }
                    else {
                        if (style[i].indexOf( 'margin' ) === -1 && style[i].indexOf( 'padding' ) === -1) {

                            elementStyle += style[i] + ':' + style.getPropertyValue(style[i]) + ';';
                        }
                    }
                }
            }
        } else if (element.currentStyle) { //IE

            style = element.currentStyle;

            for (var name in style) {
                if (style != 'font-family' && style.indexOf( 'animation' ) === -1 && style.indexOf( 'background' ) === -1 && style.indexOf( 'image' ) === -1 && style.indexOf( 'transition' ) === -1 && style[i].indexOf( 'text-fill' ) === -1) {
                    elementStyle +=  name + ':' + style[name] + ';';
                }
            }
        }

        //make sure it is printer friendly
        elementStyle += printFriendlyElement;

        return elementStyle;
    };


    PrintJS.prototype.loopNodesCollectStyles = function(elements) {
        for (var n = 0; n < elements.length; n++) {

            var currentElement = elements[n];

            //get all styling for print element
            currentElement.setAttribute('style', this.collectStyles(currentElement));

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


    PrintJS.prototype.showModal = function() {
        //build modal
        var modalStyle = 'font-family:sans-serif; display:flex; text-align:center; font-weight:300; font-size:30px; left:0; top:0;position:absolute; color: #0460B5; width: 100%; height: 100%; background-color:rgba(255, 255, 255, 0.91);';

        //create wrapper
        var printModal = document.createElement('div');
        printModal.setAttribute('style', modalStyle);
        printModal.setAttribute('id', 'printJS-Modal');

        //create content div
        var contentDiv = document.createElement('div');
        contentDiv.setAttribute('style', 'flex:1; margin:auto;');

        //add spinner
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
    };


    PrintJS.prototype.disablePrintModal = function() {

        var printFrame = document.getElementById('printJS-Modal');

        printFrame.parentNode.removeChild(print.printFrame);
    };


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

})(window, document);
