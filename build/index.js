"use strict";
/**
 * @license
 * Copyright (c) 2017 Patrik Lindahl <patrik@ramnet.se>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
exports.__esModule = true;
/** Webpack preprocessor loader
 *
 * Helps to disable parts of the code depending on preprocessor directives.
 * Use //# to start a directive
 * Supported directives:
 *   ifdef  - If defined, start a new block
 *   ifndef - If not defined, start a new block
 *   else   - If the directive was false, use the else block
 *   endif  - Ends a block
 *   define - Defines a define variable
 *   undef  - Undefines a define variable
 * To use define variable substitution use:
 *   DEFINED_VARIABLE_NAME
 * and it will be replaced with the value of the define variable
 */
var loaderUtils = require("loader-utils");
var DIRECTIVE_REGEX = /^\/\/[ ]?#(.*)/;
function checkIfShouldUseLine(conditionalStack) {
    var useLine = true;
    for (var i = conditionalStack.length - 1; i >= 0; i--) {
        var cond = conditionalStack[i];
        useLine = cond ? (cond.inElse ? !cond.condition : cond.condition) : true;
        if (!useLine) {
            break;
        }
    }
    return useLine;
}
function createDefineReplaceRegExp(defines) {
    var defKeys = Object.keys(defines);
    // This is not really according to the ECMAScript standards
    // The standard allows for unicode variable names
    if (defKeys.length === 0) {
        return;
    }
    var regExpStr = '([^a-zA-Z_\\$])(' + defKeys.join('|') + ')([^a-zA-Z0-9_\\$])?';
    return new RegExp(regExpStr, 'g');
}
exports["default"] = (function processSource(source, sourceMap) {
    var options = loaderUtils.getOptions(this);
    var defines = options.defines || {};
    var outSource = '';
    var conditionalStack = [];
    var defineReplaceRegExp = createDefineReplaceRegExp(defines);
    var lines = source.toString().split('\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var tLine = line.trim();
        var currCond = conditionalStack[conditionalStack.length - 1] || undefined;
        var useLine = checkIfShouldUseLine(conditionalStack);
        if (DIRECTIVE_REGEX.test(tLine)) {
            var directiveLine = tLine.match(DIRECTIVE_REGEX)[1].trim();
            var directiveLineParts = directiveLine.split(' ');
            var directive = directiveLineParts[0] || '';
            var param1 = directiveLineParts[1] || undefined;
            switch (directive) {
                case 'ifdef': {
                    if (param1) {
                        conditionalStack.push({
                            directive: directive,
                            inElse: false,
                            condition: defines[param1] !== undefined
                        });
                    }
                    break;
                }
                case 'ifndef': {
                    if (param1) {
                        conditionalStack.push({
                            directive: directive,
                            inElse: false,
                            condition: defines[param1] === undefined
                        });
                    }
                    break;
                }
                case 'else': {
                    var conditional = conditionalStack[conditionalStack.length - 1];
                    if (conditional.inElse) {
                        return this.callback(new Error('Unmatched else'));
                    }
                    conditional.inElse = true;
                    break;
                }
                case 'endif': {
                    var conditional = conditionalStack[conditionalStack.length - 1];
                    if (!conditional) {
                        return this.callback(new Error('Unmatched endif'));
                    }
                    conditionalStack.pop();
                    break;
                }
                case 'define': {
                    if (useLine && param1) {
                        defines[param1] = directiveLineParts.slice(2).join(' ') || '';
                        defineReplaceRegExp = createDefineReplaceRegExp(defines);
                    }
                    break;
                }
                case 'undef': {
                    if (useLine && param1) {
                        delete defines[directiveLineParts[1]];
                        defineReplaceRegExp = createDefineReplaceRegExp(defines);
                    }
                    break;
                }
                default: {
                    return this.callback(new Error('Unknown processor directive: ' + directive));
                }
            }
        }
        else {
            if (useLine) {
                var replacer = function (match, p1, p2, p3) { return p1 + (defines[p2] || '') + (p3 || ''); };
                var fixedLine = defineReplaceRegExp ? line.replace(defineReplaceRegExp, replacer) : line;
                outSource += fixedLine + (i < lines.length - 1 ? '\n' : '');
            }
        }
    }
    return outSource;
});
//# sourceMappingURL=index.js.map