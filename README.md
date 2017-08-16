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

I hope you will find this useful. If you have problems, please open an issue and I will try to help you as best I can.

## Usage instructions
### Install:
`npm install --save-dev https://github.com/Ramzeus/webpack-preprocessor-loader.git`

### Add to webpack config:
Add it by using `loader: require.resolve('webpack-preprocessor-loader'),`

You can configure the predefined defines by using options like this:
```
options: {
  defines: {
    MY_DEFINE: 'Some Value',
    DEBUG: ''
  }
}
```

## Example:
```
module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        loaders: [
          // In this example I use a typescript loader
          // The loaders are run in reverse order,
          // so firtst the code will filter thru webpack-preprocessor-loader
          // and the thru the typescript loader, or whatever you want to use
          {
            loader: 'awesome-typescript-loader',
            options:{
              configFileName: 'tsconfig.json'
            }
          },
          {
            loader: require.resolve('webpack-preprocessor-loader'),
            options: {
              defines: {
                MY_DEFINE: 'Some value',
                DEBUG: ''
              }
            }
          }
        ],
        exclude: [/node_modules/],
      }
    ]
  },
}
```

