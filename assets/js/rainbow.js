/**
 * Copyright 2012-2014 Craig Campbell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Rainbow is a simple code syntax highlighter
 *
 * @see rainbowco.de
 */
(function(global) {
    "use strict";

    /**
     * An array of the language patterns specified for each language
     *
     * @type {Object}
     */
    var languagePatterns = {};

    /**
     * An array of languages and whether they should bypass the
     * default patterns
     *
     * @type {Object}
     */
    var bypassDefaults = {};

    /**
     * A mapping of language aliases
     *
     * @type {Object}
     */
    var aliases = {};

    /**
     * Constant used to refer to the default language
     *
     * @type {number}
     */
    var DEFAULT_LANGUAGE = 0;

    /**
     * Global class added to each span in the highlighted code
     *
     * @type {null|string}
     */
    var globalClass;

    /**
     * Callback to fire after each block is highlighted
     *
     * @type {null|Function}
     */
    var onHighlight;

    /**
     * Reference to web worker for doing the heavy lifting
     *
     * @type Worker
     */
    var worker;

    var isNode = typeof module !== 'undefined' && typeof module.exports === 'object';
    /**
     * Flag for if this is the web worker or not
     *
     * @type {Boolean}
     */
    var isWorker = !isNode && typeof document === 'undefined';
    if (isNode) {
        global.Worker = require('webworker-threads').Worker;
    }

    /**
     * Browser Only - Gets the language for this block of code
     *
     * @param {Element} block
     * @returns {string|null}
     */
    function _getLanguageForBlock(block) {

        // If this doesn't have a language but the parent does then use that.
        //
        // This means if for example you have: <pre data-language="php">
        // with a bunch of <code> blocks inside then you do not have
        // to specify the language for each block.
        var language = block.getAttribute('data-language') || block.parentNode.getAttribute('data-language');

        // This adds support for specifying language via a CSS class.
        //
        // You can use the Google Code Prettify style: <pre class="lang-php">
        // or the HTML5 style: <pre><code class="language-php">
        if (!language) {
            var pattern = /\blang(?:uage)?-(\w+)/;
            var match = block.className.match(pattern) || block.parentNode.className.match(pattern);

            if (match) {
                language = match[1];
            }
        }

        if (language) {
            return language.toLowerCase();
        }
    }

    /**
     * Encodes < and > as html entities
     *
     * @param {string} code
     * @returns {string}
     */
    function _htmlEntities(code) {
        return code.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&(?![\w\#]+;)/g, '&amp;');
    }

    /**
     * Determines if a new match intersects with an existing one
     *
     * @param {number} start1    start position of existing match
     * @param {number} end1      end position of existing match
     * @param {number} start2    start position of new match
     * @param {number} end2      end position of new match
     * @returns {boolean}
     */
    function _intersects(start1, end1, start2, end2) {
        if (start2 >= start1 && start2 < end1) {
            return true;
        }

        return end2 > start1 && end2 < end1;
    }

    /**
     * Determines if two different matches have complete overlap with each other
     *
     * @param {number} start1   start position of existing match
     * @param {number} end1     end position of existing match
     * @param {number} start2   start position of new match
     * @param {number} end2     end position of new match
     * @returns {boolean}
     */
    function _hasCompleteOverlap(start1, end1, start2, end2) {

        // If the starting and end positions are exactly the same
        // then the first one should stay and this one should be ignored.
        if (start2 == start1 && end2 == end1) {
            return false;
        }

        return start2 <= start1 && end2 >= end1;
    }

    /**
     * Takes a string of code and wraps it in a span tag based on the name
     *
     * @param {string} name     name of the pattern (ie keyword.regex)
     * @param {string} code     block of code to wrap
     * @returns {string}
     */
    function _wrapCodeInSpan(name, code) {
        return '<span class="' + name.replace(/\./g, ' ') + (globalClass ? ' ' + globalClass : '') + '">' + code + '</span>';
    }

    /**
     * Finds out the position of group match for a regular expression
     *
     * @see http://stackoverflow.com/questions/1985594/how-to-find-index-of-groups-in-match
     * @param {Object} match
     * @param {number} groupNumber
     * @returns {number}
     */
    function _indexOfGroup(match, groupNumber) {
        var index = 0;
        var i;

        for (i = 1; i < groupNumber; ++i) {
            if (match[i]) {
                index += match[i].length;
            }
        }

        return index;
    }

    /**
     * Determines if a language should bypass the default patterns
     *
     * If you create a language and call Rainbow.extend() with `true` as the
     * third argument it will bypass the defaults.
     *
     * @param {string} language
     * @returns {boolean}
     */
    function _bypassDefaultPatterns(language)
    {
        return bypassDefaults[language];
    }

    /**
     * Returns a list of regex patterns for this language
     *
     * @param {string} language
     * @returns {Array}
     */
    function _getPatternsForLanguage(language) {
        var patterns = languagePatterns[language] || [];
        var defaultPatterns = languagePatterns[DEFAULT_LANGUAGE] || [];

        return _bypassDefaultPatterns(language) ? patterns : patterns.concat(defaultPatterns);
    }

    /**
     * Substring replace call to replace part of a string at a certain position
     *
     * @param {number} position         the position where the replacement
     *                                  should happen
     * @param {string} replace          the text we want to replace
     * @param {string} replaceWith      the text we want to replace it with
     * @param {string} code             the code we are doing the replacing in
     * @returns {string}
     */
    function _replaceAtPosition(position, replace, replaceWith, code) {
        var subString = code.substr(position);
        return code.substr(0, position) + subString.replace(replace, replaceWith);
    }

   /**
     * Sorts an objects keys by index descending
     *
     * @param {Object} object
     * @return {Array}
     */
    function keys(object) {
        var locations = [];

        for(var location in object) {
            if (object.hasOwnProperty(location)) {
                locations.push(location);
            }
        }

        // numeric descending
        return locations.sort(function(a, b) {
            return b - a;
        });
    }

    /**
     * Raindrop is a class used to highlight individual blocks of code
     *
     * @class
     */
    function Raindrop() {

        /**
         * Object of replacements to process at the end of the processing
         *
         * @type {Object}
         */
        var replacements = {};

        /**
         * Language associated with this Raindrop object
         *
         * @type {string}
         */
        var currentLanguage;

        /**
         * Object of start and end positions of blocks to be replaced
         *
         * @type {Object}
         */
        var replacementPositions = {};

        /**
         * Determines if the match passed in falls inside of an existing match.
         * This prevents a regex pattern from matching inside of another pattern
         * that matches a larger amount of code.
         *
         * For example this prevents a keyword from matching `function` if there
         * is already a match for `function (.*)`.
         *
         * @param {number} start    start position of new match
         * @param {number} end      end position of new match
         * @returns {boolean}
         */
        function _matchIsInsideOtherMatch(start, end) {
            for (var key in replacementPositions) {
                key = parseInt(key, 10);

                // If this block completely overlaps with another block
                // then we should remove the other block and return `false`.
                if (_hasCompleteOverlap(key, replacementPositions[key], start, end)) {
                    delete replacementPositions[key];
                    delete replacements[key];
                }

                if (_intersects(key, replacementPositions[key], start, end)) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Process replacements in the string of code to actually update
         * the markup
         *
         * @param {string} code         the code to process replacements in
         * @returns void
         */
        function _processReplacements(code) {
            var positions = keys(replacements);
            for (var i = 0; i < positions.length; i++) {
                var pos = positions[i];
                var replacement = replacements[pos];
                code = _replaceAtPosition(pos, replacement['replace'], replacement['with'], code);
            }
            return code;
        }

        /**
         * Matches a regex pattern against a block of code, finds all matches
         * that should be processed, and stores the positions of where they
         * should be replaced within the string.
         *
         * This is where pretty much all the work is done but it should not
         * be called directly.
         *
         * @param {Object} pattern
         * @param {string} code
         * @returns void
         */
        function _processPattern(pattern, code) {
            var regex = pattern.pattern;

            if (!regex) {
                return;
            }

            var match = regex.exec(code);

            if (!match) {
                return;
            }

            // Treat match 0 the same way as name
            if (!pattern['name'] && typeof pattern['matches'][0] == 'string') {
                pattern['name'] = pattern['matches'][0];
                delete pattern['matches'][0];
            }

            var replacement = match[0];
            var startPos = match.index;
            var endPos = match[0].length + startPos;

            // If this is not a child match and it falls inside of another
            // match that already happened we should skip it and continue
            // processing.
            if (_matchIsInsideOtherMatch(startPos, endPos)) {
                _processPattern(pattern, code);
                return;
            }

            /**
             * Callback for when a match was successfully processed
             *
             * @param {string} replacement
             * @returns void
             */
            function onMatchSuccess(replacement) {

                // If this match has a name then wrap it in a span tag
                if (pattern['name']) {
                    replacement = _wrapCodeInSpan(pattern['name'], replacement);
                }

                // For debugging
                // console.log('Replace ' + match[0] + ' with ' + replacement + ' at position ' + startPos + ' to ' + endPos);

                // Store what needs to be replaced with what at this position
                replacements[startPos] = {
                    'replace': match[0],
                    'with': replacement
                };

                // Store the range of this match so we can use it for
                // comparisons with other matches later.
                replacementPositions[startPos] = endPos;

                _processPattern(pattern, code);
            }

            /**
             * Helper function for processing a sub group
             *
             * @param {number} groupKey      index of group
             * @returns void
             */
            function _processGroup(groupKey) {
                var block = match[groupKey];

                // If there is no match here then move on
                if (!block) {
                    return;
                }

                var group = pattern['matches'][groupKey];
                var language = group['language'];

                /**
                 * Process group is what group we should use to actually process
                 * this match group.
                 *
                 * For example if the subgroup pattern looks like this:
                 *
                 * 2: {
                 *     'name': 'keyword',
                 *     'pattern': /true/g
                 * }
                 *
                 * then we use that as is, but if it looks like this:
                 *
                 * 2: {
                 *     'name': 'keyword',
                 *     'matches': {
                 *          'name': 'special',
                 *          'pattern': /whatever/g
                 *      }
                 * }
                 *
                 * we treat the 'matches' part as the pattern and keep
                 * the name around to wrap it with later
                 */
                var groupToProcess = group['name'] && group['matches'] ? group['matches'] : group;

                /**
                 * Takes the code block matched at this group, replaces it
                 * with the highlighted block, and optionally wraps it with
                 * a span with a name
                 *
                 * @param {string} block
                 * @param {string} replaceBlock
                 * @param {string|null} matchName
                 */
                var _getReplacement = function(block, replaceBlock, matchName) {
                    replacement = _replaceAtPosition(_indexOfGroup(match, groupKey), block, matchName ? _wrapCodeInSpan(matchName, replaceBlock) : replaceBlock, replacement);
                    return;
                };

                // If this is a string then this match is directly mapped
                // to selector so all we have to do is wrap it in a span
                // and continue.
                if (typeof group === 'string') {
                    _getReplacement(block, block, group);
                    return;
                }

                var localCode;
                var drop = new Raindrop();

                // If this is a sublanguage go and process the block using
                // that language
                if (language) {
                    localCode = drop.refract(block, language);
                    _getReplacement(block, localCode);
                    return;
                }

                // The process group can be a single pattern or an array of
                // patterns. `_processCodeWithPatterns` always expects an array
                // so we convert it here.
                localCode = drop.refract(block, currentLanguage, groupToProcess.length ? groupToProcess : [groupToProcess]);
                _getReplacement(block, localCode, group['matches'] ? group['name'] : 0);
            }

            // If this pattern has sub matches for different groups in the regex
            // then we should process them one at a time by running them through
            // the _processGroup function to generate the new replacement.
            //
            // We use the `keys` function to run through them backwards because
            // the match position of earlier matches will not change depending
            // on what gets replaced in later matches.
            var groupKeys = keys(pattern['matches']);
            for (var i = 0; i < groupKeys.length; i++) {
                _processGroup(groupKeys[i]);
            }

            // Finally, call `onMatchSuccess` with the replacement
            onMatchSuccess(replacement);
        }

        /**
         * Takes a string of code and highlights it according to the language
         * specified
         *
         * @param {string} code
         * @param {string} language
         * @returns void
         */
        function _highlightBlockForLanguage(code, language, patterns) {
            currentLanguage = language;
            patterns = patterns || _getPatternsForLanguage(language);
            return _processCodeWithPatterns(_htmlEntities(code), patterns);
        }

        /**
         * Processes a block of code using specified patterns
         *
         * @param {string} code
         * @param {Array} patterns
         * @returns void
         */
        function _processCodeWithPatterns(code, patterns) {
            for (var i = 0; i < patterns.length; i++) {
                _processPattern(patterns[i], code);
            }

            // We are done processing the patterns so we should actually replace
            // what needs to be replaced in the code.
            return _processReplacements(code);
        }

        return {
            refract: _highlightBlockForLanguage
        };
    }

    /**
     * Web Worker Only - Handles message from main script giving commands about
     * what to highlight
     *
     * @param {object} message      message received from worker.postMessage
     * @returns void
     */
    function _handleMessageFromRainbow(message) {
        languagePatterns = message.data.languagePatterns;
        bypassDefaults = message.data.bypassDefaults;
        globalClass = message.data.globalClass;
        var drop = new Raindrop();
        var result = drop.refract(message.data.code, message.data.lang);
        var data = {
            id: message.data.id,
            lang: message.data.lang,
            result: result
        };
        self.postMessage(data);
    }

    /**
     * Browser Only - Helper for matching up callbacks directly with the
     * post message requests to a web worker.
     *
     * @param {object} message      data to send to web worker
     * @param {Function} callback   callback function for worker to reply to
     * @return void
     */
    function _messageWorker(message, callback) {
        function _listen(e) {
            if (e.data.id === message.id) {
                callback(e.data);
                worker.removeEventListener('message', _listen);
            }
        }

        worker.addEventListener('message', _listen);
        worker.postMessage(message);
    }

    /**
     * Browser Only - Handles response from web worker, updates DOM with
     * resulting code, and fires callback
     *
     * @param {object} message      message received from self.postMessage
     * @returns void
     */
    function _generateHandler(element, waitingOn, callback) {
        return function _handleResponseFromWorker(data) {
            element.innerHTML = data.result;
            element.classList.add('rainbow');
            element.classList.remove('loading');
            element.classList.remove('stop-animation');

            if (onHighlight) {
                onHighlight(element, data.lang);
            }

            if (--waitingOn.c === 0) {
                callback();
            }
        };
    }

    /**
     * Browser Only - Gets data to send to webworker
     * @param  {string} code
     * @param  {string} lang
     * @return {object}
     */
    function _getWorkerData(code, lang) {
        lang = aliases[lang] || lang;

        var workerData = {
            id: String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now(),
            code: code,
            lang: lang,
            languagePatterns: languagePatterns,
            bypassDefaults: bypassDefaults,
            globalClass: globalClass
        };

        return workerData;
    }

    /**
     * Browser Only - Sends messages to web worker to highlight elements passed
     * in
     *
     * @param {Array} codeBlocks
     * @returns void
     */
    function _highlightCodeBlocks(codeBlocks, callback) {
        var waitingOn = {c: 0};
        for (var i = 0; i < codeBlocks.length; i++) {
            var block = codeBlocks[i];

            // This cancels the pending animation to fade the code in on load
            // since we want to delay doing this until it is actually
            // highlighted
            block.classList.add('stop-animation');

            var language = _getLanguageForBlock(block);

            if (block.classList.contains('rainbow') || !language) {
                continue;
            }

            // for long files show a spinner
            if (block.innerHTML.length > 20000) {
                block.classList.add('loading');
            }

            ++waitingOn.c;
            _messageWorker(_getWorkerData(block.innerHTML, language), _generateHandler(block, waitingOn, callback));
        }

        if (waitingOn.c === 0) {
            callback();
        }
    }

    /**
     * Browser Only - Start highlighting all the code blocks
     *
     * @param {Element} node       HTMLElement to search within
     * @returns void
     */
    function _highlight(node, callback) {
        callback = callback || function() {};

        // The first argument can be an Event or a DOM Element.
        //
        // I was originally checking instanceof Event but that made it break
        // when using mootools.
        //
        // @see https://github.com/ccampbell/rainbow/issues/32
        node = node && typeof node.getElementsByTagName == 'function' ? node : document;

        var preBlocks = node.getElementsByTagName('pre');
        var codeBlocks = node.getElementsByTagName('code');
        var i;
        var finalPreBlocks = [];
        var finalCodeBlocks = [];

        // First loop through all pre blocks to find which ones to highlight
        for (i = 0; i < preBlocks.length; ++i) {

            // Strip whitespace around code tags when they are inside of a pre
            // tag.  This makes the themes look better because you can't
            // accidentally add extra linebreaks at the start and end.
            //
            // When the pre tag contains a code tag then strip any extra
            // whitespace.
            //
            // For example:
            //
            // <pre>
            //      <code>var foo = true;</code>
            // </pre>
            //
            // will become:
            //
            // <pre><code>var foo = true;</code></pre>
            //
            // If you want to preserve whitespace you can use a pre tag on
            // its own without a code tag inside of it.
            if (preBlocks[i].getElementsByTagName('code').length) {
                preBlocks[i].innerHTML = preBlocks[i].innerHTML.trim();
                continue;
            }

            // If the pre block has no code blocks then we are going to want to
            // process it directly.
            finalPreBlocks.push(preBlocks[i]);
        }

        // @see http://stackoverflow.com/questions/2735067/how-to-convert-a-dom-node-list-to-an-array-in-javascript
        // We are going to process all <code> blocks
        for (i = 0; i < codeBlocks.length; ++i) {
            finalCodeBlocks.push(codeBlocks[i]);
        }

        _highlightCodeBlocks(finalCodeBlocks.concat(finalPreBlocks), callback);
    }

    /**
     * Extends the language pattern matches
     *
     * @param {string} language         name of language
     * @param {object} patterns         object of patterns to add on
     * @param {boolean|null} bypass     if `true` this will not inherit the
     *                                  default language patterns
     */
    function _extend(language, patterns, bypass) {
        if (isWorker) {
            return;
        }

        // If there is only one argument then we assume that we want to
        // extend the default language rules.
        if (arguments.length == 1) {
            patterns = language;
            language = DEFAULT_LANGUAGE;
        }

        bypassDefaults[language] = bypass;
        languagePatterns[language] = patterns.concat(languagePatterns[language] || []);
    }

    /**
     * Callback to let you do stuff in your app after a piece of code has
     * been highlighted
     *
     * @param {Function} callback
     */
    function _onHighlight(callback) {
        onHighlight = callback;
    }

    /**
     * Method to set a global class that will be applied to all spans.
     *
     * This is realy only useful for the effect on rainbowco.de where you can
     * force all blocks to not be highlighted and remove this class to
     * transition them to being highlighted.
     *
     * @param {string} className
     * @returns void
     */
    function _addGlobalClass(className) {
        globalClass = className;
    }

    /**
     * Method to add an alias for an existing language.
     *
     * For example if you want to have "coffee" map to "coffeescript"
     *
     * @see https://github.com/ccampbell/rainbow/issues/154
     */
    function _addAlias(alias, originalLanguage) {
        aliases[alias] = originalLanguage;
    }

    /**
     * Starts the magic rainbow
     *
     * @returns void
     */
    function _color() {

        // If you want to straight up highlight a string you can pass the
        // string of code, the language, and a callback function.
        //
        // Example:
        //
        // Rainbow.color(code, language, function(highlightedCode, language) {
        //     // this code block is now highlighted
        // });
        if (typeof arguments[0] == 'string') {
            var workerData = _getWorkerData(arguments[0], arguments[1]);
            _messageWorker(workerData, (function(cb) {
                return function(data) {
                    if (cb) {
                        cb(data.result, data.lang);
                    }
                };
            } (arguments[2])));
            return;
        }

        // If you pass a callback function then we rerun the color function
        // on all the code and call the callback function on complete.
        //
        // Example:
        //
        // Rainbow.color(function() {
        //     console.log('All matching tags on the page are now highlighted');
        // });
        if (typeof arguments[0] == 'function') {
            return _highlight(0, arguments[0]);
        }

        // Otherwise we use whatever node you passed in with an optional
        // callback function as the second parameter.
        //
        // Example:
        //
        // var preElement = document.createElement('pre');
        // var codeElement = document.createElement('code');
        // codeElement.setAttribute('data-language', 'javascript');
        // codeElement.innerHTML = '// Here is some JavaScript';
        // preElement.appendChild(codeElement);
        // Rainbow.color(preElement, function() {
        //     // New element is now highlighted
        // });
        //
        // If you don't pass an element it will default to `document`
        _highlight(arguments[0], arguments[1]);
    }

    /**
     * public methods
     */
    var _rainbow = {
        extend: _extend,
        onHighlight: _onHighlight,
        addClass: _addGlobalClass,
        addAlias: _addAlias,
        color: _color
    };

    if (isNode) {
        _rainbow.colorSync = function(code, lang) {
            var drop = new Raindrop();
            return drop.refract(code, aliases[lang] || lang);
        };
    }

    global.Rainbow = _rainbow;
    if (isNode) {
        module.exports = _rainbow;
    }

    var setUpWorker = !isWorker && typeof global.Worker !== 'undefined';

    /**
     * Set up web worker and add event listener to start highlighting
     *
     * @see http://stackoverflow.com/questions/5408406/web-workers-without-a-separate-javascript-file
     */
    if (setUpWorker) {
        var currentSrc;
        if (!isNode) {

            // @see http://stackoverflow.com/questions/2255689/how-to-get-the-file-path-of-the-currently-executing-javascript-code
            var scripts = document.getElementsByTagName('script');
            currentSrc = scripts[scripts.length - 1].src;
        }

        worker = new global.Worker(isNode ? __filename : currentSrc);

        if (!isNode) {
            document.addEventListener('DOMContentLoaded', _rainbow.color, false);
        }

        return;
    }

    self.addEventListener('message', _handleMessageFromRainbow);
}) (this);
