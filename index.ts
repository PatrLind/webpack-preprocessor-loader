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
  *   \/*=DEFINED_VARIABLE_NAME*\/
  *   ( dont use the backslashes :) )
  */

import * as loaderUtils from 'loader-utils'
import { loader } from 'webpack'

interface Defines {
  [name: string]: string | undefined
}

interface ConditionalState {
  directive: string
  condition: boolean
  inElse: boolean
}

const DIRECTIVE_FIX = '//#'

function checkIfShouldUseLine(conditionalStack: ConditionalState[]) {
  let useLine = true
  for (let i = conditionalStack.length - 1; i >= 0; i--) {
    const cond = conditionalStack[i]
    useLine = cond ? (cond.inElse ? !cond.condition : cond.condition) : true
    if (!useLine) {
      break
    }
  }
  return useLine
}

function createDefineReplaceRegExp(defines: Defines) {
  const defKeys = Object.keys(defines)
  const regExpStr = '\\/\\*=(' + defKeys.join('|') + ')\\*\\/'
  return new RegExp(regExpStr, 'g')
}

export default <loader.Loader> function processSource(source, sourceMap) {
  const options = loaderUtils.getOptions(this)
  const defines: Defines = {}
  let outSource = ''
  const conditionalStack: ConditionalState[] = []
  let defineReplaceRegExp = createDefineReplaceRegExp(defines)

  const lines = source.toString().split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const tLine = line.trim()
    const currCond = conditionalStack[conditionalStack.length - 1] || undefined
    const useLine = checkIfShouldUseLine(conditionalStack)
  if (tLine.indexOf(DIRECTIVE_FIX) === 0) {
      const directiveLine = tLine.substr(DIRECTIVE_FIX.length).trim()
      const directiveLineParts = directiveLine.split(' ')
      const directive = directiveLineParts[0] || ''
      const param1 = directiveLineParts[1] || undefined
      switch (directive) {
        case 'ifdef': {
          if (param1) {
            conditionalStack.push({
              directive,
              inElse: false,
              condition: defines[param1] !== undefined,
            })
          }
          break
        }
        case 'ifndef': {
          if (param1) {
            conditionalStack.push({
              directive,
              inElse: false,
              condition: defines[param1] === undefined,
            })
          }
          break
        }
        case 'else': {
          const conditional = conditionalStack[conditionalStack.length - 1]
          if (conditional.inElse) {
            return this.callback(new Error('Unmatched else'))
          }
          conditional.inElse = true
          break
        }
        case 'endif': {
          const conditional = conditionalStack[conditionalStack.length - 1]
          if (!conditional) {
            return this.callback(new Error('Unmatched endif'))
          }
          conditionalStack.pop()
          break
        }
        case 'define': {
          if (useLine && param1) {
            defines[param1] = directiveLineParts.slice(2).join(' ') || ''
            defineReplaceRegExp = createDefineReplaceRegExp(defines)
          }
          break
        }
        case 'undef': {
          if (useLine && param1) {
            delete defines[directiveLineParts[1]]
            defineReplaceRegExp = createDefineReplaceRegExp(defines)
          }
          break
        }
        default: {
          return this.callback(new Error('Unknown processor directive: ' + directive))
        }
      }
    } else {
      if (useLine) {
        const fixedLine = line.replace(defineReplaceRegExp, (match, p1) => defines[p1] || '')
        outSource += fixedLine + (i < lines.length - 1 ? '\n' : '')
      }
    }
  }
  return outSource
}
