# eslint-plugin-zowe-explorer

Custom ESLint Rules for ZOWE Explorer

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-zowe-explorer`:

```
$ npm install eslint-plugin-zowe-explorer --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-zowe-explorer` globally.

## Usage

Add `zowe-explorer` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "zowe-explorer"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "zowe-explorer/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





