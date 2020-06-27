module.exports = {
    env: {
        browser: true,
        es2020: true
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: 11
    },
    rules: {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "brace-style": [
            "error", "1tbs", { "allowSingleLine": true }
        ],
        "keyword-spacing": [
            "error", { "before": true }
        ],
        "arrow-spacing": "error",
        "computed-property-spacing": ["error", "never"],
        "object-curly-spacing": ["error", "always"],
        "no-trailing-spaces": "error",
        "space-in-parens": ["error", "never"],
        "space-before-blocks": "error",
        "no-multi-spaces": "error",
        "space-infix-ops": ["error", { "int32Hint": false }],
        "comma-spacing": ["error", { "before": false, "after": true }],
        "key-spacing": "error"
    }
};
