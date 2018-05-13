module.exports = {
    "extends": "standard",
    "rules": {
        "indent": ["error", 4],
        "space-before-function-paren": ["error", {
            "anonymous": "never",
            "named": "always",
            "asyncArrow": "always"
        }],
        "semi": ["error", "always"]
    },
    "env": {
        "node": true,
        "mocha": true
    }
};
