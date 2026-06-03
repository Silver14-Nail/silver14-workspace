"use strict";
exports.id = 8;
exports.ids = [8];
exports.modules = {

/***/ 2480
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  fromHttp: () => (/* reexport */ fromHttp)
});

// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js
var setCredentialFeature = __webpack_require__(2031);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js
var CredentialsProviderError = __webpack_require__(1961);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+node-http-handler@4.7.3/node_modules/@smithy/node-http-handler/dist-es/node-http-handler.js + 10 modules
var node_http_handler = __webpack_require__(2066);
// EXTERNAL MODULE: external "node:fs/promises"
var promises_ = __webpack_require__(1422);
var promises_default = /*#__PURE__*/__webpack_require__.n(promises_);
;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-http@3.972.40/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/checkUrl.js

const LOOPBACK_CIDR_IPv4 = "127.0.0.0/8";
const LOOPBACK_CIDR_IPv6 = "::1/128";
const ECS_CONTAINER_HOST = "169.254.170.2";
const EKS_CONTAINER_HOST_IPv4 = "169.254.170.23";
const EKS_CONTAINER_HOST_IPv6 = "[fd00:ec2::23]";
const checkUrl = (url, logger) => {
    if (url.protocol === "https:") {
        return;
    }
    if (url.hostname === ECS_CONTAINER_HOST ||
        url.hostname === EKS_CONTAINER_HOST_IPv4 ||
        url.hostname === EKS_CONTAINER_HOST_IPv6) {
        return;
    }
    if (url.hostname.includes("[")) {
        if (url.hostname === "[::1]" || url.hostname === "[0000:0000:0000:0000:0000:0000:0000:0001]") {
            return;
        }
    }
    else {
        if (url.hostname === "localhost") {
            return;
        }
        const ipComponents = url.hostname.split(".");
        const inRange = (component) => {
            const num = parseInt(component, 10);
            return 0 <= num && num <= 255;
        };
        if (ipComponents[0] === "127" &&
            inRange(ipComponents[1]) &&
            inRange(ipComponents[2]) &&
            inRange(ipComponents[3]) &&
            ipComponents.length === 4) {
            return;
        }
    }
    throw new CredentialsProviderError.CredentialsProviderError(`URL not accepted. It must either be HTTPS or match one of the following:
  - loopback CIDR 127.0.0.0/8 or [::1/128]
  - ECS container host 169.254.170.2
  - EKS container host 169.254.170.23 or [fd00:ec2::23]`, { logger });
};

// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/protocols/protocol-http/httpRequest.js
var httpRequest = __webpack_require__(1934);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/date-utils.js
var date_utils = __webpack_require__(2001);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.js + 5 modules
var sdk_stream_mixin = __webpack_require__(2021);
;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-http@3.972.40/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/requestHelpers.js




function createGetRequest(url) {
    return new httpRequest.HttpRequest({
        protocol: url.protocol,
        hostname: url.hostname,
        port: Number(url.port),
        path: url.pathname,
        query: Array.from(url.searchParams.entries()).reduce((acc, [k, v]) => {
            acc[k] = v;
            return acc;
        }, {}),
        fragment: url.hash,
    });
}
async function getCredentials(response, logger) {
    const stream = (0,sdk_stream_mixin.sdkStreamMixin)(response.body);
    const str = await stream.transformToString();
    if (response.statusCode === 200) {
        const parsed = JSON.parse(str);
        if (typeof parsed.AccessKeyId !== "string" ||
            typeof parsed.SecretAccessKey !== "string" ||
            typeof parsed.Token !== "string" ||
            typeof parsed.Expiration !== "string") {
            throw new CredentialsProviderError.CredentialsProviderError("HTTP credential provider response not of the required format, an object matching: " +
                "{ AccessKeyId: string, SecretAccessKey: string, Token: string, Expiration: string(rfc3339) }", { logger });
        }
        return {
            accessKeyId: parsed.AccessKeyId,
            secretAccessKey: parsed.SecretAccessKey,
            sessionToken: parsed.Token,
            expiration: (0,date_utils.parseRfc3339DateTime)(parsed.Expiration),
        };
    }
    if (response.statusCode >= 400 && response.statusCode < 500) {
        let parsedBody = {};
        try {
            parsedBody = JSON.parse(str);
        }
        catch (e) { }
        throw Object.assign(new CredentialsProviderError.CredentialsProviderError(`Server responded with status: ${response.statusCode}`, { logger }), {
            Code: parsedBody.Code,
            Message: parsedBody.Message,
        });
    }
    throw new CredentialsProviderError.CredentialsProviderError(`Server responded with status: ${response.statusCode}`, { logger });
}

;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-http@3.972.40/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/retry-wrapper.js
const retryWrapper = (toRetry, maxRetries, delayMs) => {
    return async () => {
        for (let i = 0; i < maxRetries; ++i) {
            try {
                return await toRetry();
            }
            catch (e) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
        return await toRetry();
    };
};

;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-http@3.972.40/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/fromHttp.js







const AWS_CONTAINER_CREDENTIALS_RELATIVE_URI = "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI";
const DEFAULT_LINK_LOCAL_HOST = "http://169.254.170.2";
const AWS_CONTAINER_CREDENTIALS_FULL_URI = "AWS_CONTAINER_CREDENTIALS_FULL_URI";
const AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE = "AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE";
const AWS_CONTAINER_AUTHORIZATION_TOKEN = "AWS_CONTAINER_AUTHORIZATION_TOKEN";
const fromHttp = (options = {}) => {
    options.logger?.debug("@aws-sdk/credential-provider-http - fromHttp");
    let host;
    const relative = options.awsContainerCredentialsRelativeUri ?? process.env[AWS_CONTAINER_CREDENTIALS_RELATIVE_URI];
    const full = options.awsContainerCredentialsFullUri ?? process.env[AWS_CONTAINER_CREDENTIALS_FULL_URI];
    const token = options.awsContainerAuthorizationToken ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN];
    const tokenFile = options.awsContainerAuthorizationTokenFile ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE];
    const warn = options.logger?.constructor?.name === "NoOpLogger" || !options.logger?.warn
        ? console.warn
        : options.logger.warn.bind(options.logger);
    if (relative && full) {
        warn("@aws-sdk/credential-provider-http: " +
            "you have set both awsContainerCredentialsRelativeUri and awsContainerCredentialsFullUri.");
        warn("awsContainerCredentialsFullUri will take precedence.");
    }
    if (token && tokenFile) {
        warn("@aws-sdk/credential-provider-http: " +
            "you have set both awsContainerAuthorizationToken and awsContainerAuthorizationTokenFile.");
        warn("awsContainerAuthorizationToken will take precedence.");
    }
    if (full) {
        host = full;
    }
    else if (relative) {
        host = `${DEFAULT_LINK_LOCAL_HOST}${relative}`;
    }
    else {
        throw new CredentialsProviderError.CredentialsProviderError(`No HTTP credential provider host provided.
Set AWS_CONTAINER_CREDENTIALS_FULL_URI or AWS_CONTAINER_CREDENTIALS_RELATIVE_URI.`, { logger: options.logger });
    }
    const url = new URL(host);
    checkUrl(url, options.logger);
    const requestHandler = node_http_handler.NodeHttpHandler.create({
        requestTimeout: options.timeout ?? 1000,
        connectionTimeout: options.timeout ?? 1000,
    });
    return retryWrapper(async () => {
        const request = createGetRequest(url);
        if (token) {
            request.headers.Authorization = token;
        }
        else if (tokenFile) {
            request.headers.Authorization = (await promises_default().readFile(tokenFile)).toString();
        }
        try {
            const result = await requestHandler.handle(request);
            return getCredentials(result.response).then((creds) => (0,setCredentialFeature.setCredentialFeature)(creds, "CREDENTIALS_HTTP", "z"));
        }
        catch (e) {
            throw new CredentialsProviderError.CredentialsProviderError(String(e), { logger: options.logger });
        }
    }, options.maxRetries ?? 3, options.timeout ?? 1000);
};

;// ../../node_modules/.pnpm/@aws-sdk+credential-provider-http@3.972.40/node_modules/@aws-sdk/credential-provider-http/dist-es/index.js



/***/ }

};
;
//# sourceMappingURL=8.js.map