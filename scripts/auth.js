let firebase = require('../app').firebase;
let admin = require('../app').admin;

let createUserConfig = function(email, password, username){
    return {
        email: email,
        emailVerified: false,
        password: password,
        displayName: username,
        disabled: false
    };
};

module.exports = {
                    createUserConfig: createUserConfig
                }