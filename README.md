# react-intl-messages-linter

## Install

```sh
yarn add --dev react-intl-messages-linter
```

## Usage

```sh
lint-react-intl-messages [options] path
```

### Command line options/flags
```
-q, --quiet [true]          Report errors only   
-i, --ignore                Pattern of files to ignore
--webpack                   Path to webpack config
```

## Disclaimer

Note that this tool was made to help you spotting missing messages.
It does not aim to replace proper unit/integrations tests you should have in most (if not all) cases.
There are a couple of caveats and it may be unable to detect missing messages under unsupported circumstances or report a false positive.

## Assumptions and caveats

+ Names of import specifiers must match the following regexp /[az]*messages$/i
+ Path of message imports must match /\.*\/[a-z-]*messages(?:\.js)?$/i
+ Reasonable shadowing
* Computed messages are not supported well... just yet
* Messages with circular (imported) dependencies are not supported

## TODO:

* add some documentation :D
* get rid of as many of above caveats as possible
* make unsafe usages more robust and reliable
* add feature to ignore files

## LICENSE

[MIT](https://github.com/P0lip/react-intl-messages-linter/blob/master/LICENSE)
