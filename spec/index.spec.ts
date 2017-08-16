import { default as processSource } from '../index'
import { } from 'jasmine'
import { loader } from 'webpack'

const mockCtx: loader.LoaderContext = <any> {
  callback: (error?: Error) => {
    throw error
  }
}

describe('processSource function', () => {
  it('should throw on wrong directive', () => {
    const source = `
      //#should-throw
      `
    expect(() => { processSource.call(mockCtx, source, '') }).toThrow()
  })
})


describe('processSource function', () => {
  it('should be able to work with at least one define and ifdef else', () => {
    const source = `
      First line
      //#define A1
      //#ifdef A1
      Second line
      //#else
      No no no
      //#endif
      Third line
      `
    const result = processSource.call(mockCtx, source, '')
    expect(result).toBe(`
      First line
      Second line
      Third line
      `)
  })
})


describe('processSource function', () => {
  it('should throw on unmatched else', () => {
    const source = `
    //#ifdef A1
    //#else
    //#else
    //#endif
    `
    expect(() => { processSource.call(mockCtx, source, '') }).toThrow()
  })
})


describe('processSource function', () => {
  it('should throw on unmatched endif', () => {
    const source = `
    //#ifdef A1
    //#else
    //#endif
    //#endif
    `
    expect(() => { processSource.call(mockCtx, source, '') }).toThrow()
  })
})


describe('processSource function', () => {
  it('should be able to work with nested ifdef else', () => {
    const source = `
      First line
      //#define A1
      //#define A2
      //#define A3
      //#ifdef A1
      Second line
      //#  ifdef A2
      Third line
      //#  else
      Nope...
      //#  endif
      //#else
      No no no
      //#  ifdef A4
      No!
      //#  else
      Not this either...
      //#  endif
      //#endif
      Fourth line
      `
    const result = processSource.call(mockCtx, source, '')
    expect(result).toBe(`
      First line
      Second line
      Third line
      Fourth line
      `)
  })
})

describe('processSource function', () => {
  it('should replace define value constants', () => {
    const source = `
      //#define M_PI 3.14159265358979323846
      //#define MY_STR "My Str"
      Pi is /*=M_PI*/
      This is not defined: /*=NOT_DEFINED*/
      var str = /*=MY_STR*/
      //#ifdef MY_STR
      Yes, the MY_STR is defined
      //#endif
      `
    const result = processSource.call(mockCtx, source, '')
    expect(result).toBe(`
      Pi is 3.14159265358979323846
      This is not defined: /*=NOT_DEFINED*/
      var str = "My Str"
      Yes, the MY_STR is defined
      `)
  })
})


describe('processSource function', () => {
  it('should be able to undef a define', () => {
    const source = `
      //#define MY_STR "My Str"
      var str = /*=MY_STR*/
      //#undef MY_STR
      //#ifdef MY_STR
      Yes, the MY_STR is defined
      //#else
      MY_STR is not defined now
      //#endif
      `
    const result = processSource.call(mockCtx, source, '')
    expect(result).toBe(`
      var str = "My Str"
      MY_STR is not defined now
      `)
  })
})


describe('processSource function', () => {
  it('should be able to get ifndef to work', () => {
    const source = `
      //#define MY_STR "My Str"
      var str = /*=MY_STR*/
      //#undef MY_STR
      //#ifndef MY_STR
      MY_STR is not defined now
      //#else
      Yes, the MY_STR is defined
      //#endif
      `
    const result = processSource.call(mockCtx, source, '')
    expect(result).toBe(`
      var str = "My Str"
      MY_STR is not defined now
      `)
  })
})
