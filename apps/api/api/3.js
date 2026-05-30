"use strict";
exports.id = 3;
exports.ids = [3];
exports.modules = {

/***/ 2457
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  fromProcess: () => (/* reexport */ fromProcess)
});

// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseKnownFiles.js + 1 modules
var parseKnownFiles = __webpack_require__(2453);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getProfileName.js
var getProfileName = __webpack_require__(1958);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/externalDataInterceptor.js
var externalDataInterceptor = __webpack_require__(2458);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js
var CredentialsProviderError = __webpack_require__(1957);
// EXTERNAL MODULE: external "node:child_process"
var external_node_child_process_ = __webpack_require__(2459);
// EXTERNAL MODULE: external "node:util"
var external_node_util_ = __webpack_require__(1399);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js
var setCredentialFeature = __webpack_require__(2027);
;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-process@3.972.38/node_modules/@aws-sdk/credential-provider-process/dist-es/getValidatedProcessCredentials.js

const getValidatedProcessCredentials = (profileName, data, profiles) => {
    if (data.Version !== 1) {
        throw Error(`Profile ${profileName} credential_process did not return Version 1.`);
    }
    if (data.AccessKeyId === undefined || data.SecretAccessKey === undefined) {
        throw Error(`Profile ${profileName} credential_process returned invalid credentials.`);
    }
    if (data.Expiration) {
        const currentTime = new Date();
        const expireTime = new Date(data.Expiration);
        if (expireTime < currentTime) {
            throw Error(`Profile ${profileName} credential_process returned expired credentials.`);
        }
    }
    let accountId = data.AccountId;
    if (!accountId && profiles?.[profileName]?.aws_account_id) {
        accountId = profiles[profileName].aws_account_id;
    }
    const credentials = {
        accessKeyId: data.AccessKeyId,
        secretAccessKey: data.SecretAccessKey,
        ...(data.SessionToken && { sessionToken: data.SessionToken }),
        ...(data.Expiration && { expiration: new Date(data.Expiration) }),
        ...(data.CredentialScope && { credentialScope: data.CredentialScope }),
        ...(accountId && { accountId }),
    };
    (0,setCredentialFeature.setCredentialFeature)(credentials, "CREDENTIALS_PROCESS", "w");
    return credentials;
};

;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-process@3.972.38/node_modules/@aws-sdk/credential-provider-process/dist-es/resolveProcessCredentials.js




const resolveProcessCredentials = async (profileName, profiles, logger) => {
    const profile = profiles[profileName];
    if (profiles[profileName]) {
        const credentialProcess = profile["credential_process"];
        if (credentialProcess !== undefined) {
            const execPromise = (0,external_node_util_.promisify)(externalDataInterceptor.externalDataInterceptor?.getTokenRecord?.().exec ?? external_node_child_process_.exec);
            try {
                const { stdout } = await execPromise(credentialProcess);
                let data;
                try {
                    data = JSON.parse(stdout.trim());
                }
                catch {
                    throw Error(`Profile ${profileName} credential_process returned invalid JSON.`);
                }
                return getValidatedProcessCredentials(profileName, data, profiles);
            }
            catch (error) {
                throw new CredentialsProviderError.CredentialsProviderError(error.message, { logger });
            }
        }
        else {
            throw new CredentialsProviderError.CredentialsProviderError(`Profile ${profileName} did not contain credential_process.`, { logger });
        }
    }
    else {
        throw new CredentialsProviderError.CredentialsProviderError(`Profile ${profileName} could not be found in shared credentials file.`, {
            logger,
        });
    }
};

;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-process@3.972.38/node_modules/@aws-sdk/credential-provider-process/dist-es/fromProcess.js


const fromProcess = (init = {}) => async ({ callerClientConfig } = {}) => {
    init.logger?.debug("@aws-sdk/credential-provider-process - fromProcess");
    const profiles = await (0,parseKnownFiles.parseKnownFiles)(init);
    return resolveProcessCredentials((0,getProfileName.getProfileName)({
        profile: init.profile ?? callerClientConfig?.profile,
    }), profiles, init.logger);
};

;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-process@3.972.38/node_modules/@aws-sdk/credential-provider-process/dist-es/index.js



/***/ },

/***/ 2458
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   externalDataInterceptor: () => (/* binding */ externalDataInterceptor)
/* harmony export */ });
/* harmony import */ var _getSSOTokenFromFile__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2454);
/* harmony import */ var _readFile__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1966);


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

/***/ 2455
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getSSOTokenFilepath: () => (/* binding */ getSSOTokenFilepath)
/* harmony export */ });
/* harmony import */ var node_crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1990);
/* harmony import */ var node_crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_crypto__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(796);
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(node_path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _getHomeDir__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1963);



const getSSOTokenFilepath = (id) => {
    const hasher = (0,node_crypto__WEBPACK_IMPORTED_MODULE_0__.createHash)("sha1");
    const cacheName = hasher.update(id).digest("hex");
    return (0,node_path__WEBPACK_IMPORTED_MODULE_1__.join)((0,_getHomeDir__WEBPACK_IMPORTED_MODULE_2__.getHomeDir)(), ".aws", "sso", "cache", `${cacheName}.json`);
};


/***/ },

/***/ 2454
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getSSOTokenFromFile: () => (/* binding */ getSSOTokenFromFile),
/* harmony export */   tokenIntercept: () => (/* binding */ tokenIntercept)
/* harmony export */ });
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1422);
/* harmony import */ var node_fs_promises__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_fs_promises__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _getSSOTokenFilepath__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2455);


const tokenIntercept = {};
const getSSOTokenFromFile = async (id) => {
    if (tokenIntercept[id]) {
        return tokenIntercept[id];
    }
    const ssoTokenFilepath = (0,_getSSOTokenFilepath__WEBPACK_IMPORTED_MODULE_1__.getSSOTokenFilepath)(id);
    const ssoTokenText = await (0,node_fs_promises__WEBPACK_IMPORTED_MODULE_0__.readFile)(ssoTokenFilepath, "utf8");
    return JSON.parse(ssoTokenText);
};


/***/ },

/***/ 2453
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  parseKnownFiles: () => (/* binding */ parseKnownFiles)
});

// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSharedConfigFiles.js + 2 modules
var loadSharedConfigFiles = __webpack_require__(1959);
;// ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/mergeConfigFiles.js
const mergeConfigFiles = (...files) => {
    const merged = {};
    for (const file of files) {
        for (const [key, values] of Object.entries(file)) {
            if (merged[key] !== undefined) {
                Object.assign(merged[key], values);
            }
            else {
                merged[key] = values;
            }
        }
    }
    return merged;
};

;// ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseKnownFiles.js


const parseKnownFiles = async (init) => {
    const parsedFiles = await (0,loadSharedConfigFiles.loadSharedConfigFiles)(init);
    return mergeConfigFiles(parsedFiles.configFile, parsedFiles.credentialsFile);
};


/***/ }

};
;
//# sourceMappingURL=3.js.map