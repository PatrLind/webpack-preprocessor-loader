"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var mockCtx = {
    callback: function (error) {
        throw error;
    }
};
describe('processSource function', function () {
    it('should throw on wrong directive', function () {
        var source = "\n      //#should-throw\n      ";
        expect(function () { index_1.default.call(mockCtx, source, ''); }).toThrow();
    });
});
describe('processSource function', function () {
    it('should be able to work with at least one define and ifdef else', function () {
        var source = "\n      First line\n      //#define A1\n      //#ifdef A1\n      Second line\n      //#else\n      No no no\n      //#endif\n      Third line\n      ";
        var result = index_1.default.call(mockCtx, source, '');
        expect(result).toBe("\n      First line\n      Second line\n      Third line\n      ");
    });
});
describe('processSource function', function () {
    it('should throw on unmatched else', function () {
        var source = "\n    //#ifdef A1\n    //#else\n    //#else\n    //#endif\n    ";
        expect(function () { index_1.default.call(mockCtx, source, ''); }).toThrow();
    });
});
describe('processSource function', function () {
    it('should throw on unmatched endif', function () {
        var source = "\n    //#ifdef A1\n    //#else\n    //#endif\n    //#endif\n    ";
        expect(function () { index_1.default.call(mockCtx, source, ''); }).toThrow();
    });
});
describe('processSource function', function () {
    it('should be able to work with nested ifdef else', function () {
        var source = "\n      First line\n      //#define A1\n      //#define A2\n      //#define A3\n      //#ifdef A1\n      Second line\n      //#  ifdef A2\n      Third line\n      //#  else\n      Nope...\n      //#  endif\n      //#else\n      No no no\n      //#  ifdef A4\n      No!\n      //#  else\n      Not this either...\n      //#  endif\n      //#endif\n      Fourth line\n      ";
        var result = index_1.default.call(mockCtx, source, '');
        expect(result).toBe("\n      First line\n      Second line\n      Third line\n      Fourth line\n      ");
    });
});
describe('processSource function', function () {
    it('should replace define value constants', function () {
        var source = "\n      //#define M_PI 3.14159265358979323846\n      //#define MY_STR \"My Str\"\n      Pi is /*=M_PI*/\n      This is not defined: /*=NOT_DEFINED*/\n      var str = /*=MY_STR*/\n      //#ifdef MY_STR\n      Yes, the MY_STR is defined\n      //#endif\n      ";
        var result = index_1.default.call(mockCtx, source, '');
        expect(result).toBe("\n      Pi is 3.14159265358979323846\n      This is not defined: /*=NOT_DEFINED*/\n      var str = \"My Str\"\n      Yes, the MY_STR is defined\n      ");
    });
});
describe('processSource function', function () {
    it('should be able to undef a define', function () {
        var source = "\n      //#define MY_STR \"My Str\"\n      var str = /*=MY_STR*/\n      //#undef MY_STR\n      //#ifdef MY_STR\n      Yes, the MY_STR is defined\n      //#else\n      MY_STR is not defined now\n      //#endif\n      ";
        var result = index_1.default.call(mockCtx, source, '');
        expect(result).toBe("\n      var str = \"My Str\"\n      MY_STR is not defined now\n      ");
    });
});
describe('processSource function', function () {
    it('should be able to get ifndef to work', function () {
        var source = "\n      //#define MY_STR \"My Str\"\n      var str = /*=MY_STR*/\n      //#undef MY_STR\n      //#ifndef MY_STR\n      MY_STR is not defined now\n      //#else\n      Yes, the MY_STR is defined\n      //#endif\n      ";
        var result = index_1.default.call(mockCtx, source, '');
        expect(result).toBe("\n      var str = \"My Str\"\n      MY_STR is not defined now\n      ");
    });
});
//# sourceMappingURL=index.spec.js.map