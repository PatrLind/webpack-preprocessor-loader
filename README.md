# Webpack preprocessor loader

Helps to disable parts of the code depending on preprocessor directives.

Use `//#` to start a directive

Supported directives:
```
  ifdef  - If defined, start a new block
  ifndef - If not defined, start a new block
  else   - If the directive was false, use the else block
  endif  - Ends a block
  define - Defines a define variable
  undef  - Undefines a define variable
```

To use define variable substitution use:
  `/*=DEFINED_VARIABLE_NAME*/`
