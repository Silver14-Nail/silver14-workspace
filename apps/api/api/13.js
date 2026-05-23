"use strict";
exports.id = 13;
exports.ids = [13];
exports.modules = {

/***/ 2468
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  $Command: () => (/* reexport */ command.Command),
  AccessDeniedException: () => (/* reexport */ AccessDeniedException),
  AccessDeniedException$: () => (/* reexport */ AccessDeniedException$),
  AccessDeniedExceptionReason: () => (/* reexport */ AccessDeniedExceptionReason),
  AuthorizationPendingException: () => (/* reexport */ AuthorizationPendingException),
  AuthorizationPendingException$: () => (/* reexport */ AuthorizationPendingException$),
  CreateToken$: () => (/* reexport */ CreateToken$),
  CreateTokenCommand: () => (/* reexport */ CreateTokenCommand),
  CreateTokenRequest$: () => (/* reexport */ CreateTokenRequest$),
  CreateTokenResponse$: () => (/* reexport */ CreateTokenResponse$),
  ExpiredTokenException: () => (/* reexport */ ExpiredTokenException),
  ExpiredTokenException$: () => (/* reexport */ ExpiredTokenException$),
  InternalServerException: () => (/* reexport */ InternalServerException),
  InternalServerException$: () => (/* reexport */ InternalServerException$),
  InvalidClientException: () => (/* reexport */ InvalidClientException),
  InvalidClientException$: () => (/* reexport */ InvalidClientException$),
  InvalidGrantException: () => (/* reexport */ InvalidGrantException),
  InvalidGrantException$: () => (/* reexport */ InvalidGrantException$),
  InvalidRequestException: () => (/* reexport */ InvalidRequestException),
  InvalidRequestException$: () => (/* reexport */ InvalidRequestException$),
  InvalidRequestExceptionReason: () => (/* reexport */ InvalidRequestExceptionReason),
  InvalidScopeException: () => (/* reexport */ InvalidScopeException),
  InvalidScopeException$: () => (/* reexport */ InvalidScopeException$),
  SSOOIDC: () => (/* reexport */ SSOOIDC),
  SSOOIDCClient: () => (/* reexport */ SSOOIDCClient),
  SSOOIDCServiceException: () => (/* reexport */ SSOOIDCServiceException),
  SSOOIDCServiceException$: () => (/* reexport */ SSOOIDCServiceException$),
  SlowDownException: () => (/* reexport */ SlowDownException),
  SlowDownException$: () => (/* reexport */ SlowDownException$),
  UnauthorizedClientException: () => (/* reexport */ UnauthorizedClientException),
  UnauthorizedClientException$: () => (/* reexport */ UnauthorizedClientException$),
  UnsupportedGrantTypeException: () => (/* reexport */ UnsupportedGrantTypeException),
  UnsupportedGrantTypeException$: () => (/* reexport */ UnsupportedGrantTypeException$),
  __Client: () => (/* reexport */ client.Client),
  errorTypeRegistries: () => (/* reexport */ errorTypeRegistries)
});

// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/configurations.js
var configurations = __webpack_require__(1944);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-host-header/hostHeaderMiddleware.js
var hostHeaderMiddleware = __webpack_require__(1940);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/user-agent-middleware.js + 3 modules
var user_agent_middleware = __webpack_require__(1946);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-logger/loggerMiddleware.js
var loggerMiddleware = __webpack_require__(1942);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-recursion-detection/getRecursionDetectionPlugin.js + 3 modules
var getRecursionDetectionPlugin = __webpack_require__(1943);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/getHttpAuthSchemeEndpointRuleSetPlugin.js + 2 modules
var getHttpAuthSchemeEndpointRuleSetPlugin = __webpack_require__(1958);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/util-identity-and-auth/DefaultIdentityProviderConfig.js
var DefaultIdentityProviderConfig = __webpack_require__(1957);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/middleware-http-signing/getHttpSigningMiddleware.js + 1 modules
var getHttpSigningMiddleware = __webpack_require__(1954);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/client.js
var client = __webpack_require__(1959);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/resolveRegionConfig.js + 3 modules
var resolveRegionConfig = __webpack_require__(1961);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/endpoints/index.js + 12 modules
var endpoints = __webpack_require__(1963);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/protocols/middleware-content-length/contentLengthMiddleware.js
var contentLengthMiddleware = __webpack_require__(1997);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/configurations.js
var middleware_retry_configurations = __webpack_require__(2034);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/retry/index.js + 11 modules
var retry = __webpack_require__(1998);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/schema/middleware/getSchemaSerdePlugin.js + 3 modules
var getSchemaSerdePlugin = __webpack_require__(2035);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4Config.js + 1 modules
var resolveAwsSdkSigV4Config = __webpack_require__(2037);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/client/util-middleware/getSmithyContext.js
var getSmithyContext = __webpack_require__(1955);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/client/util-middleware/normalizeProvider.js
var normalizeProvider = __webpack_require__(1951);
;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/auth/httpAuthSchemeProvider.js


const defaultSSOOIDCHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
        operation: (0,getSmithyContext.getSmithyContext)(context).operation,
        region: (await (0,normalizeProvider.normalizeProvider)(config.region)()) ||
            (() => {
                throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
            })(),
    };
};
function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
        schemeId: "aws.auth#sigv4",
        signingProperties: {
            name: "sso-oauth",
            region: authParameters.region,
        },
        propertiesExtractor: (config, context) => ({
            signingProperties: {
                config,
                context,
            },
        }),
    };
}
function createSmithyApiNoAuthHttpAuthOption(authParameters) {
    return {
        schemeId: "smithy.api#noAuth",
    };
}
const defaultSSOOIDCHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
        case "CreateToken": {
            options.push(createSmithyApiNoAuthHttpAuthOption(authParameters));
            break;
        }
        default: {
            options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
        }
    }
    return options;
};
const resolveHttpAuthSchemeConfig = (config) => {
    const config_0 = (0,resolveAwsSdkSigV4Config.resolveAwsSdkSigV4Config)(config);
    return Object.assign(config_0, {
        authSchemePreference: (0,normalizeProvider.normalizeProvider)(config.authSchemePreference ?? []),
    });
};

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/endpoint/EndpointParameters.js
const resolveClientEndpointParameters = (options) => {
    return Object.assign(options, {
        useDualstackEndpoint: options.useDualstackEndpoint ?? false,
        useFipsEndpoint: options.useFipsEndpoint ?? false,
        defaultSigningName: "sso-oauth",
    });
};
const commonParams = {
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
};

// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/package.json
var nested_clients_package = __webpack_require__(2465);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/emitWarningIfUnsupportedVersion.js
var emitWarningIfUnsupportedVersion = __webpack_require__(2049);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/defaultUserAgent.js + 8 modules
var defaultUserAgent = __webpack_require__(2050);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/nodeAppIdConfigOptions.js
var nodeAppIdConfigOptions = __webpack_require__(2051);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/NODE_AUTH_SCHEME_PREFERENCE_OPTIONS.js + 2 modules
var NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = __webpack_require__(2052);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/emitWarningIfUnsupportedVersion.js
var smithy_client_emitWarningIfUnsupportedVersion = __webpack_require__(2055);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/defaults-mode.js
var defaults_mode = __webpack_require__(2054);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/defaults-mode/resolveDefaultsModeConfig.js + 2 modules
var resolveDefaultsModeConfig = __webpack_require__(2059);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js + 5 modules
var configLoader = __webpack_require__(1964);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/config.js
var regionConfig_config = __webpack_require__(2058);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/endpointsConfig/NodeUseDualstackEndpointConfigOptions.js
var NodeUseDualstackEndpointConfigOptions = __webpack_require__(2056);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/endpointsConfig/NodeUseFipsEndpointConfigOptions.js
var NodeUseFipsEndpointConfigOptions = __webpack_require__(2057);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/retry/util-retry/config.js
var util_retry_config = __webpack_require__(1948);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/util-body-length/calculateBodyLength.js
var calculateBodyLength = __webpack_require__(2017);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/hash-node/hash-node.js
var hash_node = __webpack_require__(2020);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+node-http-handler@4.7.3/node_modules/@smithy/node-http-handler/dist-es/node-http-handler.js + 10 modules
var node_http_handler = __webpack_require__(2073);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+node-http-handler@4.7.3/node_modules/@smithy/node-http-handler/dist-es/stream-collector/index.js + 1 modules
var stream_collector = __webpack_require__(2075);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4Signer.js + 3 modules
var AwsSdkSigV4Signer = __webpack_require__(2076);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsRestJsonProtocol.js + 6 modules
var AwsRestJsonProtocol = __webpack_require__(2466);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/util-identity-and-auth/httpAuthSchemes/noAuth.js
var noAuth = __webpack_require__(2467);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/NoOpLogger.js
var NoOpLogger = __webpack_require__(1999);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/protocols/url-parser/parseUrl.js + 1 modules
var parseUrl = __webpack_require__(1980);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/fromBase64.js
var fromBase64 = __webpack_require__(2002);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.js
var toBase64 = __webpack_require__(2005);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.js
var fromUtf8 = __webpack_require__(2006);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.js
var toUtf8 = __webpack_require__(2007);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/aws.js + 2 modules
var aws = __webpack_require__(2042);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/cache/EndpointCache.js
var EndpointCache = __webpack_require__(1982);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/decideEndpoint.js
var decideEndpoint = __webpack_require__(1983);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/customEndpointFunctions.js
var customEndpointFunctions = __webpack_require__(1989);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/bdd/BinaryDecisionDiagram.js
var BinaryDecisionDiagram = __webpack_require__(1981);
;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/endpoint/bdd.js

const k = "ref";
const a = -1, b = true, c = "isSet", d = "PartitionResult", e = "booleanEquals", f = "getAttr", g = { [k]: "Endpoint" }, h = { [k]: d }, i = {}, j = [{ [k]: "Region" }];
const _data = {
    conditions: [
        [c, [g]],
        [c, j],
        ["aws.partition", j, d],
        [e, [{ [k]: "UseFIPS" }, b]],
        [e, [{ [k]: "UseDualStack" }, b]],
        [e, [{ fn: f, argv: [h, "supportsDualStack"] }, b]],
        [e, [{ fn: f, argv: [h, "supportsFIPS"] }, b]],
        ["stringEquals", [{ fn: f, argv: [h, "name"] }, "aws-us-gov"]],
    ],
    results: [
        [a],
        [a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
        [a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
        [g, i],
        ["https://oidc-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
        [a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
        ["https://oidc.{Region}.amazonaws.com", i],
        ["https://oidc-fips.{Region}.{PartitionResult#dnsSuffix}", i],
        [a, "FIPS is enabled but this partition does not support FIPS"],
        ["https://oidc.{Region}.{PartitionResult#dualStackDnsSuffix}", i],
        [a, "DualStack is enabled but this partition does not support DualStack"],
        ["https://oidc.{Region}.{PartitionResult#dnsSuffix}", i],
        [a, "Invalid Configuration: Missing Region"],
    ],
};
const root = 2;
const r = 100_000_000;
const nodes = new Int32Array([
    -1,
    1,
    -1,
    0,
    13,
    3,
    1,
    4,
    r + 12,
    2,
    5,
    r + 12,
    3,
    8,
    6,
    4,
    7,
    r + 11,
    5,
    r + 9,
    r + 10,
    4,
    11,
    9,
    6,
    10,
    r + 8,
    7,
    r + 6,
    r + 7,
    5,
    12,
    r + 5,
    6,
    r + 4,
    r + 5,
    3,
    r + 1,
    14,
    4,
    r + 2,
    r + 3,
]);
const bdd = BinaryDecisionDiagram.BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/endpoint/endpointResolver.js



const cache = new EndpointCache.EndpointCache({
    size: 50,
    params: ["Endpoint", "Region", "UseDualStack", "UseFIPS"],
});
const defaultEndpointResolver = (endpointParams, context = {}) => {
    return cache.get(endpointParams, () => (0,decideEndpoint.decideEndpoint)(bdd, {
        endpointParams: endpointParams,
        logger: context.logger,
    }));
};
customEndpointFunctions.customEndpointFunctions.aws = aws.awsEndpointFunctions;

// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/schema/TypeRegistry.js
var TypeRegistry = __webpack_require__(2047);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/exceptions.js
var exceptions = __webpack_require__(2048);
;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/models/SSOOIDCServiceException.js


class SSOOIDCServiceException extends exceptions.ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, SSOOIDCServiceException.prototype);
    }
}

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/models/errors.js

class AccessDeniedException extends SSOOIDCServiceException {
    name = "AccessDeniedException";
    $fault = "client";
    error;
    reason;
    error_description;
    constructor(opts) {
        super({
            name: "AccessDeniedException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, AccessDeniedException.prototype);
        this.error = opts.error;
        this.reason = opts.reason;
        this.error_description = opts.error_description;
    }
}
class AuthorizationPendingException extends SSOOIDCServiceException {
    name = "AuthorizationPendingException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "AuthorizationPendingException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, AuthorizationPendingException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class ExpiredTokenException extends SSOOIDCServiceException {
    name = "ExpiredTokenException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "ExpiredTokenException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ExpiredTokenException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class InternalServerException extends SSOOIDCServiceException {
    name = "InternalServerException";
    $fault = "server";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "InternalServerException",
            $fault: "server",
            ...opts,
        });
        Object.setPrototypeOf(this, InternalServerException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class InvalidClientException extends SSOOIDCServiceException {
    name = "InvalidClientException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "InvalidClientException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidClientException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class InvalidGrantException extends SSOOIDCServiceException {
    name = "InvalidGrantException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "InvalidGrantException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidGrantException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class InvalidRequestException extends SSOOIDCServiceException {
    name = "InvalidRequestException";
    $fault = "client";
    error;
    reason;
    error_description;
    constructor(opts) {
        super({
            name: "InvalidRequestException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidRequestException.prototype);
        this.error = opts.error;
        this.reason = opts.reason;
        this.error_description = opts.error_description;
    }
}
class InvalidScopeException extends SSOOIDCServiceException {
    name = "InvalidScopeException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "InvalidScopeException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, InvalidScopeException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class SlowDownException extends SSOOIDCServiceException {
    name = "SlowDownException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "SlowDownException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, SlowDownException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class UnauthorizedClientException extends SSOOIDCServiceException {
    name = "UnauthorizedClientException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "UnauthorizedClientException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, UnauthorizedClientException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}
class UnsupportedGrantTypeException extends SSOOIDCServiceException {
    name = "UnsupportedGrantTypeException";
    $fault = "client";
    error;
    error_description;
    constructor(opts) {
        super({
            name: "UnsupportedGrantTypeException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, UnsupportedGrantTypeException.prototype);
        this.error = opts.error;
        this.error_description = opts.error_description;
    }
}

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/schemas/schemas_0.js
const _ADE = "AccessDeniedException";
const _APE = "AuthorizationPendingException";
const _AT = "AccessToken";
const _CS = "ClientSecret";
const _CT = "CreateToken";
const _CTR = "CreateTokenRequest";
const _CTRr = "CreateTokenResponse";
const _CV = "CodeVerifier";
const _ETE = "ExpiredTokenException";
const _ICE = "InvalidClientException";
const _IGE = "InvalidGrantException";
const _IRE = "InvalidRequestException";
const _ISE = "InternalServerException";
const _ISEn = "InvalidScopeException";
const _IT = "IdToken";
const _RT = "RefreshToken";
const _SDE = "SlowDownException";
const _UCE = "UnauthorizedClientException";
const _UGTE = "UnsupportedGrantTypeException";
const _aT = "accessToken";
const _c = "client";
const _cI = "clientId";
const _cS = "clientSecret";
const _cV = "codeVerifier";
const _co = "code";
const _dC = "deviceCode";
const _e = "error";
const _eI = "expiresIn";
const _ed = "error_description";
const _gT = "grantType";
const _h = "http";
const _hE = "httpError";
const _iT = "idToken";
const _r = "reason";
const _rT = "refreshToken";
const _rU = "redirectUri";
const _s = "smithy.ts.sdk.synthetic.com.amazonaws.ssooidc";
const _sc = "scope";
const _se = "server";
const _tT = "tokenType";
const n0 = "com.amazonaws.ssooidc";



const _s_registry = TypeRegistry.TypeRegistry.for(_s);
var SSOOIDCServiceException$ = [-3, _s, "SSOOIDCServiceException", 0, [], []];
_s_registry.registerError(SSOOIDCServiceException$, SSOOIDCServiceException);
const n0_registry = TypeRegistry.TypeRegistry.for(n0);
var AccessDeniedException$ = [
    -3,
    n0,
    _ADE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _r, _ed],
    [0, 0, 0],
];
n0_registry.registerError(AccessDeniedException$, AccessDeniedException);
var AuthorizationPendingException$ = [
    -3,
    n0,
    _APE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0],
];
n0_registry.registerError(AuthorizationPendingException$, AuthorizationPendingException);
var ExpiredTokenException$ = [-3, n0, _ETE, { [_e]: _c, [_hE]: 400 }, [_e, _ed], [0, 0]];
n0_registry.registerError(ExpiredTokenException$, ExpiredTokenException);
var InternalServerException$ = [-3, n0, _ISE, { [_e]: _se, [_hE]: 500 }, [_e, _ed], [0, 0]];
n0_registry.registerError(InternalServerException$, InternalServerException);
var InvalidClientException$ = [-3, n0, _ICE, { [_e]: _c, [_hE]: 401 }, [_e, _ed], [0, 0]];
n0_registry.registerError(InvalidClientException$, InvalidClientException);
var InvalidGrantException$ = [-3, n0, _IGE, { [_e]: _c, [_hE]: 400 }, [_e, _ed], [0, 0]];
n0_registry.registerError(InvalidGrantException$, InvalidGrantException);
var InvalidRequestException$ = [
    -3,
    n0,
    _IRE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _r, _ed],
    [0, 0, 0],
];
n0_registry.registerError(InvalidRequestException$, InvalidRequestException);
var InvalidScopeException$ = [-3, n0, _ISEn, { [_e]: _c, [_hE]: 400 }, [_e, _ed], [0, 0]];
n0_registry.registerError(InvalidScopeException$, InvalidScopeException);
var SlowDownException$ = [-3, n0, _SDE, { [_e]: _c, [_hE]: 400 }, [_e, _ed], [0, 0]];
n0_registry.registerError(SlowDownException$, SlowDownException);
var UnauthorizedClientException$ = [
    -3,
    n0,
    _UCE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0],
];
n0_registry.registerError(UnauthorizedClientException$, UnauthorizedClientException);
var UnsupportedGrantTypeException$ = [
    -3,
    n0,
    _UGTE,
    { [_e]: _c, [_hE]: 400 },
    [_e, _ed],
    [0, 0],
];
n0_registry.registerError(UnsupportedGrantTypeException$, UnsupportedGrantTypeException);
const errorTypeRegistries = [_s_registry, n0_registry];
var AccessToken = [0, n0, _AT, 8, 0];
var ClientSecret = [0, n0, _CS, 8, 0];
var CodeVerifier = [0, n0, _CV, 8, 0];
var IdToken = [0, n0, _IT, 8, 0];
var RefreshToken = [0, n0, _RT, 8, 0];
var CreateTokenRequest$ = [
    3,
    n0,
    _CTR,
    0,
    [_cI, _cS, _gT, _dC, _co, _rT, _sc, _rU, _cV],
    [0, [() => ClientSecret, 0], 0, 0, 0, [() => RefreshToken, 0], 64 | 0, 0, [() => CodeVerifier, 0]],
    3,
];
var CreateTokenResponse$ = [
    3,
    n0,
    _CTRr,
    0,
    [_aT, _tT, _eI, _rT, _iT],
    [[() => AccessToken, 0], 0, 1, [() => RefreshToken, 0], [() => IdToken, 0]],
];
var Scopes = 64 | 0;
var CreateToken$ = [
    9,
    n0,
    _CT,
    { [_h]: ["POST", "/token", 200] },
    () => CreateTokenRequest$,
    () => CreateTokenResponse$,
];

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/runtimeConfig.shared.js









const getRuntimeConfig = (config) => {
    return {
        apiVersion: "2019-06-10",
        base64Decoder: config?.base64Decoder ?? fromBase64.fromBase64,
        base64Encoder: config?.base64Encoder ?? toBase64.toBase64,
        disableHostPrefix: config?.disableHostPrefix ?? false,
        endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
        extensions: config?.extensions ?? [],
        httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSSOOIDCHttpAuthSchemeProvider,
        httpAuthSchemes: config?.httpAuthSchemes ?? [
            {
                schemeId: "aws.auth#sigv4",
                identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
                signer: new AwsSdkSigV4Signer.AwsSdkSigV4Signer(),
            },
            {
                schemeId: "smithy.api#noAuth",
                identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
                signer: new noAuth.NoAuthSigner(),
            },
        ],
        logger: config?.logger ?? new NoOpLogger.NoOpLogger(),
        protocol: config?.protocol ?? AwsRestJsonProtocol.AwsRestJsonProtocol,
        protocolSettings: config?.protocolSettings ?? {
            defaultNamespace: "com.amazonaws.ssooidc",
            errorTypeRegistries: errorTypeRegistries,
            version: "2019-06-10",
            serviceTarget: "AWSSSOOIDCService",
        },
        serviceId: config?.serviceId ?? "SSO OIDC",
        urlParser: config?.urlParser ?? parseUrl.parseUrl,
        utf8Decoder: config?.utf8Decoder ?? fromUtf8.fromUtf8,
        utf8Encoder: config?.utf8Encoder ?? toUtf8.toUtf8,
    };
};

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/runtimeConfig.js









const runtimeConfig_getRuntimeConfig = (config) => {
    (0,smithy_client_emitWarningIfUnsupportedVersion.emitWarningIfUnsupportedVersion)(process.version);
    const defaultsMode = (0,resolveDefaultsModeConfig.resolveDefaultsModeConfig)(config);
    const defaultConfigProvider = () => defaultsMode().then(defaults_mode.loadConfigsForDefaultMode);
    const clientSharedValues = getRuntimeConfig(config);
    (0,emitWarningIfUnsupportedVersion.emitWarningIfUnsupportedVersion)(process.version);
    const loaderConfig = {
        profile: config?.profile,
        logger: clientSharedValues.logger,
    };
    return {
        ...clientSharedValues,
        ...config,
        runtime: "node",
        defaultsMode,
        authSchemePreference: config?.authSchemePreference ?? (0,configLoader.loadConfig)(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS.NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
        bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength.calculateBodyLength,
        defaultUserAgentProvider: config?.defaultUserAgentProvider ??
            (0,defaultUserAgent.createDefaultUserAgentProvider)({ serviceId: clientSharedValues.serviceId, clientVersion: nested_clients_package.version }),
        maxAttempts: config?.maxAttempts ?? (0,configLoader.loadConfig)(middleware_retry_configurations.NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
        region: config?.region ??
            (0,configLoader.loadConfig)(regionConfig_config.NODE_REGION_CONFIG_OPTIONS, { ...regionConfig_config.NODE_REGION_CONFIG_FILE_OPTIONS, ...loaderConfig }),
        requestHandler: node_http_handler.NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
        retryMode: config?.retryMode ??
            (0,configLoader.loadConfig)({
                ...middleware_retry_configurations.NODE_RETRY_MODE_CONFIG_OPTIONS,
                default: async () => (await defaultConfigProvider()).retryMode || util_retry_config.DEFAULT_RETRY_MODE,
            }, config),
        sha256: config?.sha256 ?? hash_node.Hash.bind(null, "sha256"),
        streamCollector: config?.streamCollector ?? stream_collector.streamCollector,
        useDualstackEndpoint: config?.useDualstackEndpoint ?? (0,configLoader.loadConfig)(NodeUseDualstackEndpointConfigOptions.NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
        useFipsEndpoint: config?.useFipsEndpoint ?? (0,configLoader.loadConfig)(NodeUseFipsEndpointConfigOptions.NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
        userAgentAppId: config?.userAgentAppId ?? (0,configLoader.loadConfig)(nodeAppIdConfigOptions.NODE_APP_ID_CONFIG_OPTIONS, loaderConfig),
    };
};

// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/client/region-config-resolver/extensions.js
var region_config_resolver_extensions = __webpack_require__(2095);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/defaultExtensionConfiguration.js + 3 modules
var defaultExtensionConfiguration = __webpack_require__(2096);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/protocols/protocol-http/extensions/httpExtensionConfiguration.js
var httpExtensionConfiguration = __webpack_require__(2097);
;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/auth/httpAuthExtensionConfiguration.js
const getHttpAuthExtensionConfiguration = (runtimeConfig) => {
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
        setHttpAuthScheme(httpAuthScheme) {
            const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
            if (index === -1) {
                _httpAuthSchemes.push(httpAuthScheme);
            }
            else {
                _httpAuthSchemes.splice(index, 1, httpAuthScheme);
            }
        },
        httpAuthSchemes() {
            return _httpAuthSchemes;
        },
        setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
            _httpAuthSchemeProvider = httpAuthSchemeProvider;
        },
        httpAuthSchemeProvider() {
            return _httpAuthSchemeProvider;
        },
        setCredentials(credentials) {
            _credentials = credentials;
        },
        credentials() {
            return _credentials;
        },
    };
};
const resolveHttpAuthRuntimeConfig = (config) => {
    return {
        httpAuthSchemes: config.httpAuthSchemes(),
        httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
        credentials: config.credentials(),
    };
};

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/runtimeExtensions.js




const resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign((0,region_config_resolver_extensions.getAwsRegionExtensionConfiguration)(runtimeConfig), (0,defaultExtensionConfiguration.getDefaultExtensionConfiguration)(runtimeConfig), (0,httpExtensionConfiguration.getHttpHandlerExtensionConfiguration)(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, (0,region_config_resolver_extensions.resolveAwsRegionExtensionConfiguration)(extensionConfiguration), (0,defaultExtensionConfiguration.resolveDefaultRuntimeConfig)(extensionConfiguration), (0,httpExtensionConfiguration.resolveHttpHandlerRuntimeConfig)(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/SSOOIDCClient.js













class SSOOIDCClient extends client.Client {
    config;
    constructor(...[configuration]) {
        const _config_0 = runtimeConfig_getRuntimeConfig(configuration || {});
        super(_config_0);
        this.initConfig = _config_0;
        const _config_1 = resolveClientEndpointParameters(_config_0);
        const _config_2 = (0,configurations.resolveUserAgentConfig)(_config_1);
        const _config_3 = (0,middleware_retry_configurations.resolveRetryConfig)(_config_2);
        const _config_4 = (0,resolveRegionConfig.resolveRegionConfig)(_config_3);
        const _config_5 = (0,hostHeaderMiddleware.resolveHostHeaderConfig)(_config_4);
        const _config_6 = (0,endpoints.resolveEndpointConfig)(_config_5);
        const _config_7 = resolveHttpAuthSchemeConfig(_config_6);
        const _config_8 = resolveRuntimeExtensions(_config_7, configuration?.extensions || []);
        this.config = _config_8;
        this.middlewareStack.use((0,getSchemaSerdePlugin.getSchemaSerdePlugin)(this.config));
        this.middlewareStack.use((0,user_agent_middleware.getUserAgentPlugin)(this.config));
        this.middlewareStack.use((0,retry.getRetryPlugin)(this.config));
        this.middlewareStack.use((0,contentLengthMiddleware.getContentLengthPlugin)(this.config));
        this.middlewareStack.use((0,hostHeaderMiddleware.getHostHeaderPlugin)(this.config));
        this.middlewareStack.use((0,loggerMiddleware.getLoggerPlugin)(this.config));
        this.middlewareStack.use((0,getRecursionDetectionPlugin.getRecursionDetectionPlugin)(this.config));
        this.middlewareStack.use((0,getHttpAuthSchemeEndpointRuleSetPlugin.getHttpAuthSchemeEndpointRuleSetPlugin)(this.config, {
            httpAuthSchemeParametersProvider: defaultSSOOIDCHttpAuthSchemeParametersProvider,
            identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig.DefaultIdentityProviderConfig({
                "aws.auth#sigv4": config.credentials,
            }),
        }));
        this.middlewareStack.use((0,getHttpSigningMiddleware.getHttpSigningPlugin)(this.config));
    }
    destroy() {
        super.destroy();
    }
}

// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/create-aggregated-client.js
var create_aggregated_client = __webpack_require__(2098);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/command.js + 1 modules
var command = __webpack_require__(2043);
;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/commands/CreateTokenCommand.js





class CreateTokenCommand extends command.Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [(0,endpoints.getEndpointPlugin)(config, Command.getEndpointParameterInstructions())];
})
    .s("AWSSSOOIDCService", "CreateToken", {})
    .n("SSOOIDCClient", "CreateTokenCommand")
    .sc(CreateToken$)
    .build() {
}

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/SSOOIDC.js



const commands = {
    CreateTokenCommand: CreateTokenCommand,
};
class SSOOIDC extends SSOOIDCClient {
}
(0,create_aggregated_client.createAggregatedClient)(commands, SSOOIDC);

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/commands/index.js


;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/models/enums.js
const AccessDeniedExceptionReason = {
    KMS_ACCESS_DENIED: "KMS_AccessDeniedException",
};
const InvalidRequestExceptionReason = {
    KMS_DISABLED_KEY: "KMS_DisabledException",
    KMS_INVALID_KEY_USAGE: "KMS_InvalidKeyUsageException",
    KMS_INVALID_STATE: "KMS_InvalidStateException",
    KMS_KEY_NOT_FOUND: "KMS_NotFoundException",
};

;// ../../node_modules/.pnpm/@aws-sdk+nested-clients@3.997.10/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso-oidc/index.js










/***/ }

};
;
//# sourceMappingURL=13.js.map