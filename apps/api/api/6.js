"use strict";
exports.id = 6;
exports.ids = [6];
exports.modules = {

/***/ 2461
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  fromTokenFile: () => (/* reexport */ fromTokenFile),
  fromWebToken: () => (/* reexport */ fromWebToken)
});

// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js
var setCredentialFeature = __webpack_require__(2038);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js
var CredentialsProviderError = __webpack_require__(1968);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/externalDataInterceptor.js
var externalDataInterceptor = __webpack_require__(2459);
// EXTERNAL MODULE: external "node:fs"
var external_node_fs_ = __webpack_require__(797);
;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-web-identity@3.972.42/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/fromWebToken.js
const fromWebToken = (init) => async (awsIdentityProperties) => {
    init.logger?.debug("@aws-sdk/credential-provider-web-identity - fromWebToken");
    const { roleArn, roleSessionName, webIdentityToken, providerId, policyArns, policy, durationSeconds } = init;
    let { roleAssumerWithWebIdentity } = init;
    if (!roleAssumerWithWebIdentity) {
        const { getDefaultRoleAssumerWithWebIdentity } = await __webpack_require__.e(/* import() */ 12).then(__webpack_require__.bind(__webpack_require__, 2470));
        roleAssumerWithWebIdentity = getDefaultRoleAssumerWithWebIdentity({
            ...init.clientConfig,
            credentialProviderLogger: init.logger,
            parentClientConfig: {
                ...awsIdentityProperties?.callerClientConfig,
                ...init.parentClientConfig,
            },
        }, init.clientPlugins);
    }
    return roleAssumerWithWebIdentity({
        RoleArn: roleArn,
        RoleSessionName: roleSessionName ?? `aws-sdk-js-session-${Date.now()}`,
        WebIdentityToken: webIdentityToken,
        ProviderId: providerId,
        PolicyArns: policyArns,
        Policy: policy,
        DurationSeconds: durationSeconds,
    });
};

;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-web-identity@3.972.42/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/fromTokenFile.js




const ENV_TOKEN_FILE = "AWS_WEB_IDENTITY_TOKEN_FILE";
const ENV_ROLE_ARN = "AWS_ROLE_ARN";
const ENV_ROLE_SESSION_NAME = "AWS_ROLE_SESSION_NAME";
const fromTokenFile = (init = {}) => async (awsIdentityProperties) => {
    init.logger?.debug("@aws-sdk/credential-provider-web-identity - fromTokenFile");
    const webIdentityTokenFile = init?.webIdentityTokenFile ?? process.env[ENV_TOKEN_FILE];
    const roleArn = init?.roleArn ?? process.env[ENV_ROLE_ARN];
    const roleSessionName = init?.roleSessionName ?? process.env[ENV_ROLE_SESSION_NAME];
    if (!webIdentityTokenFile || !roleArn) {
        throw new CredentialsProviderError.CredentialsProviderError("Web identity configuration not specified", {
            logger: init.logger,
        });
    }
    const credentials = await fromWebToken({
        ...init,
        webIdentityToken: externalDataInterceptor.externalDataInterceptor?.getTokenRecord?.()[webIdentityTokenFile] ??
            (0,external_node_fs_.readFileSync)(webIdentityTokenFile, { encoding: "ascii" }),
        roleArn,
        roleSessionName,
    })(awsIdentityProperties);
    if (webIdentityTokenFile === process.env[ENV_TOKEN_FILE]) {
        (0,setCredentialFeature.setCredentialFeature)(credentials, "CREDENTIALS_ENV_VARS_STS_WEB_ID_TOKEN", "h");
    }
    return credentials;
};

;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-web-identity@3.972.42/node_modules/@aws-sdk/credential-provider-web-identity/dist-es/index.js




/***/ },

/***/ 2459
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   externalDataInterceptor: () => (/* binding */ externalDataInterceptor)
/* harmony export */ });
/* harmony import */ var _getSSOTokenFromFile__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2455);
/* harmony import */ var _readFile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1977);


const externalDataInterceptor = {
    getFileRecord() {
        return _readFile__WEBPACK_IMPORTED_MODULE_1__.fileIntercept;
    },
    interceptFile(path, contents) {
        _readFile__WEBPACK_IMPORTED_MODULE_1__.fileIntercept[path] = Promise.resolve(contents);
    },
    getTokenRecord() {
        return _getSSOTokenFromFile__WEBPACK_IMPORTED_MODULE_0__.tokenIntercept;
    },
    interceptToken(id, contents) {
        _getSSOTokenFromFile__WEBPACK_IMPORTED_MODULE_0__.tokenIntercept[id] = contents;
    },
};


/***/ },

/***/ 2456
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getSSOTokenFilepath: () => (/* binding */ getSSOTokenFilepath)
/* harmony export */ });
/* harmony import */ var node_crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2001);
/* harmony import */ var node_crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_crypto__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(796);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(node_path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _getHomeDir__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1974);



const getSSOTokenFilepath = (id) => {
    const hasher = (0,node_crypto__WEBPACK_IMPORTED_MODULE_0__.createHash)("sha1");
    const cacheName = hasher.update(id).digest("hex");
    return (0,node_path__WEBPACK_IMPORTED_MODULE_1__.join)((0,_getHomeDir__WEBPACK_IMPORTED_MODULE_2__.getHomeDir)(), ".aws", "sso", "cache", `${cacheName}.json`);
};


/***/ },

/***/ 2455
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getSSOTokenFromFile: () => (/* binding */ getSSOTokenFromFile),
/* harmony export */   tokenIntercept: () => (/* binding */ tokenIntercept)
/* harmony export */ });
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1422);
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_fs_promises__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _getSSOTokenFilepath__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2456);


const tokenIntercept = {};
const getSSOTokenFromFile = async (id) => {
    if (tokenIntercept[id]) {
        return tokenIntercept[id];
    }
    const ssoTokenFilepath = (0,_getSSOTokenFilepath__WEBPACK_IMPORTED_MODULE_1__.getSSOTokenFilepath)(id);
    const ssoTokenText = await (0,node_fs_promises__WEBPACK_IMPORTED_MODULE_0__.readFile)(ssoTokenFilepath, "utf8");
    return JSON.parse(ssoTokenText);
};


/***/ }

};
;
//# sourceMappingURL=6.js.map