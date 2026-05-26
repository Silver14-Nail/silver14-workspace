"use strict";
exports.id = 11;
exports.ids = [11];
exports.modules = {

/***/ 2469
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  AwsRestJsonProtocol: () => (/* binding */ AwsRestJsonProtocol)
});

// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/protocols/HttpBindingProtocol.js
var HttpBindingProtocol = __webpack_require__(2077);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/protocols/serde/HttpInterceptingShapeSerializer.js + 1 modules
var HttpInterceptingShapeSerializer = __webpack_require__(2085);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/protocols/serde/HttpInterceptingShapeDeserializer.js
var HttpInterceptingShapeDeserializer = __webpack_require__(2082);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/schema/schemas/NormalizedSchema.js
var NormalizedSchema = __webpack_require__(2042);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/ProtocolLib.js
var ProtocolLib = __webpack_require__(2086);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/ConfigurableSerdeContext.js
var ConfigurableSerdeContext = __webpack_require__(2090);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/protocols/serde/determineTimestampFormat.js
var determineTimestampFormat = __webpack_require__(2084);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/lazy-json.js
var lazy_json = __webpack_require__(2008);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/date-utils.js
var date_utils = __webpack_require__(2006);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/value/NumericValue.js
var NumericValue = __webpack_require__(2013);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/fromBase64.js
var fromBase64 = __webpack_require__(2000);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/UnionSerde.js
var UnionSerde = __webpack_require__(2092);
;// ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/jsonReviver.js

function jsonReviver(key, value, context) {
    if (context?.source) {
        const numericString = context.source;
        if (typeof value === "number") {
            if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER || numericString !== String(value)) {
                const isFractional = numericString.includes(".");
                if (isFractional) {
                    return new NumericValue.NumericValue(numericString, "bigDecimal");
                }
                else {
                    return BigInt(numericString);
                }
            }
        }
    }
    return value;
}

// EXTERNAL MODULE: ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/common.js
var common = __webpack_require__(2089);
;// ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/parseJsonBody.js

const parseJsonBody = (streamBody, context) => (0,common.collectBodyString)(streamBody, context).then((encoded) => {
    if (encoded.length) {
        try {
            return JSON.parse(encoded);
        }
        catch (e) {
            if (e?.name === "SyntaxError") {
                Object.defineProperty(e, "$responseBodyText", {
                    value: encoded,
                });
            }
            throw e;
        }
    }
    return {};
});
const parseJsonErrorBody = async (errorBody, context) => {
    const value = await parseJsonBody(errorBody, context);
    value.message = value.message ?? value.Message;
    return value;
};
const findKey = (object, key) => Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase());
const sanitizeErrorCode = (rawValue) => {
    let cleanValue = rawValue;
    if (typeof cleanValue === "number") {
        cleanValue = cleanValue.toString();
    }
    if (cleanValue.indexOf(",") >= 0) {
        cleanValue = cleanValue.split(",")[0];
    }
    if (cleanValue.indexOf(":") >= 0) {
        cleanValue = cleanValue.split(":")[0];
    }
    if (cleanValue.indexOf("#") >= 0) {
        cleanValue = cleanValue.split("#")[1];
    }
    return cleanValue;
};
const loadRestJsonErrorCode = (output, data) => {
    return loadErrorCode(output, data, ["header", "code", "type"]);
};
const loadJsonRpcErrorCode = (output, data, queryCompat = false) => {
    return loadErrorCode(output, data, queryCompat ? ["code", "header", "type"] : ["type", "code", "header"]);
};
const loadErrorCode = ({ headers }, data, order) => {
    while (order.length > 0) {
        const location = order.shift();
        switch (location) {
            case "header":
                const headerKey = findKey(headers ?? {}, "x-amzn-errortype");
                if (headerKey !== undefined) {
                    return sanitizeErrorCode(headers[headerKey]);
                }
                break;
            case "code":
                const codeKey = findKey(data ?? {}, "code");
                if (codeKey && data[codeKey] !== undefined) {
                    return sanitizeErrorCode(data[codeKey]);
                }
                break;
            case "type":
                if (data?.__type !== undefined) {
                    return sanitizeErrorCode(data.__type);
                }
                break;
        }
    }
};

;// ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/JsonShapeDeserializer.js








class JsonShapeDeserializer extends ConfigurableSerdeContext.SerdeContextConfig {
    settings;
    constructor(settings) {
        super();
        this.settings = settings;
    }
    async read(schema, data) {
        return this._read(schema, typeof data === "string" ? JSON.parse(data, jsonReviver) : await parseJsonBody(data, this.serdeContext));
    }
    readObject(schema, data) {
        return this._read(schema, data);
    }
    _read(schema, value) {
        const isObject = value !== null && typeof value === "object";
        const ns = NormalizedSchema.NormalizedSchema.of(schema);
        if (isObject) {
            if (ns.isStructSchema()) {
                const record = value;
                const union = ns.isUnionSchema();
                const out = {};
                let nameMap = void 0;
                const { jsonName } = this.settings;
                if (jsonName) {
                    nameMap = {};
                }
                let unionSerde;
                if (union) {
                    unionSerde = new UnionSerde.UnionSerde(record, out);
                }
                for (const [memberName, memberSchema] of ns.structIterator()) {
                    let fromKey = memberName;
                    if (jsonName) {
                        fromKey = memberSchema.getMergedTraits().jsonName ?? fromKey;
                        nameMap[fromKey] = memberName;
                    }
                    if (union) {
                        unionSerde.mark(fromKey);
                    }
                    if (record[fromKey] != null) {
                        out[memberName] = this._read(memberSchema, record[fromKey]);
                    }
                }
                if (union) {
                    unionSerde.writeUnknown();
                }
                else if (typeof record.__type === "string") {
                    for (const k in record) {
                        const v = record[k];
                        const t = jsonName ? nameMap[k] ?? k : k;
                        if (!(t in out)) {
                            out[t] = v;
                        }
                    }
                }
                return out;
            }
            if (Array.isArray(value) && ns.isListSchema()) {
                const listMember = ns.getValueSchema();
                const out = [];
                for (const item of value) {
                    out.push(this._read(listMember, item));
                }
                return out;
            }
            if (ns.isMapSchema()) {
                const mapMember = ns.getValueSchema();
                const out = {};
                for (const _k in value) {
                    out[_k] = this._read(mapMember, value[_k]);
                }
                return out;
            }
        }
        if (ns.isBlobSchema() && typeof value === "string") {
            return (0,fromBase64.fromBase64)(value);
        }
        const mediaType = ns.getMergedTraits().mediaType;
        if (ns.isStringSchema() && typeof value === "string" && mediaType) {
            const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
            if (isJson) {
                return lazy_json.LazyJsonString.from(value);
            }
            return value;
        }
        if (ns.isTimestampSchema() && value != null) {
            const format = (0,determineTimestampFormat.determineTimestampFormat)(ns, this.settings);
            switch (format) {
                case 5:
                    return (0,date_utils.parseRfc3339DateTimeWithOffset)(value);
                case 6:
                    return (0,date_utils.parseRfc7231DateTime)(value);
                case 7:
                    return (0,date_utils.parseEpochTimestamp)(value);
                default:
                    console.warn("Missing timestamp format, parsing value with Date constructor:", value);
                    return new Date(value);
            }
        }
        if (ns.isBigIntegerSchema() && (typeof value === "number" || typeof value === "string")) {
            return BigInt(value);
        }
        if (ns.isBigDecimalSchema() && value != undefined) {
            if (value instanceof NumericValue.NumericValue) {
                return value;
            }
            const untyped = value;
            if (untyped.type === "bigDecimal" && "string" in untyped) {
                return new NumericValue.NumericValue(untyped.string, untyped.type);
            }
            return new NumericValue.NumericValue(String(value), "bigDecimal");
        }
        if (ns.isNumericSchema() && typeof value === "string") {
            switch (value) {
                case "Infinity":
                    return Infinity;
                case "-Infinity":
                    return -Infinity;
                case "NaN":
                    return NaN;
            }
            return value;
        }
        if (ns.isDocumentSchema()) {
            if (isObject) {
                const out = Array.isArray(value) ? [] : {};
                for (const k in value) {
                    const v = value[k];
                    if (v instanceof NumericValue.NumericValue) {
                        out[k] = v;
                    }
                    else {
                        out[k] = this._read(ns, v);
                    }
                }
                return out;
            }
            else {
                return structuredClone(value);
            }
        }
        return value;
    }
}

// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.js
var toBase64 = __webpack_require__(2003);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/index.js + 10 modules
var serde = __webpack_require__(1998);
;// ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/jsonReplacer.js

const NUMERIC_CONTROL_CHAR = String.fromCharCode(925);
class JsonReplacer {
    values = new Map();
    counter = 0;
    stage = 0;
    createReplacer() {
        if (this.stage === 1) {
            throw new Error("@aws-sdk/core/protocols - JsonReplacer already created.");
        }
        if (this.stage === 2) {
            throw new Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
        }
        this.stage = 1;
        return (key, value) => {
            if (value instanceof NumericValue.NumericValue) {
                const v = `${NUMERIC_CONTROL_CHAR + "nv" + this.counter++}_` + value.string;
                this.values.set(`"${v}"`, value.string);
                return v;
            }
            if (typeof value === "bigint") {
                const s = value.toString();
                const v = `${NUMERIC_CONTROL_CHAR + "b" + this.counter++}_` + s;
                this.values.set(`"${v}"`, s);
                return v;
            }
            return value;
        };
    }
    replaceInJson(json) {
        if (this.stage === 0) {
            throw new Error("@aws-sdk/core/protocols - JsonReplacer not created yet.");
        }
        if (this.stage === 2) {
            throw new Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
        }
        this.stage = 2;
        if (this.counter === 0) {
            return json;
        }
        for (const [key, value] of this.values) {
            json = json.replace(key, value);
        }
        return json;
    }
}

;// ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/JsonShapeSerializer.js





class JsonShapeSerializer extends ConfigurableSerdeContext.SerdeContextConfig {
    settings;
    buffer;
    useReplacer = false;
    rootSchema;
    constructor(settings) {
        super();
        this.settings = settings;
    }
    write(schema, value) {
        this.rootSchema = NormalizedSchema.NormalizedSchema.of(schema);
        this.buffer = this._write(this.rootSchema, value);
    }
    flush() {
        const { rootSchema, useReplacer } = this;
        this.rootSchema = undefined;
        this.useReplacer = false;
        if (rootSchema?.isStructSchema() || rootSchema?.isDocumentSchema()) {
            if (!useReplacer) {
                return JSON.stringify(this.buffer);
            }
            const replacer = new JsonReplacer();
            return replacer.replaceInJson(JSON.stringify(this.buffer, replacer.createReplacer(), 0));
        }
        return this.buffer;
    }
    writeDiscriminatedDocument(schema, value) {
        this.write(schema, value);
        if (typeof this.buffer === "object") {
            this.buffer.__type = NormalizedSchema.NormalizedSchema.of(schema).getName(true);
        }
    }
    _write(schema, value, container) {
        const isObject = value !== null && typeof value === "object";
        const ns = NormalizedSchema.NormalizedSchema.of(schema);
        if (isObject) {
            if (ns.isStructSchema()) {
                const record = value;
                const out = {};
                const { jsonName } = this.settings;
                let nameMap = void 0;
                if (jsonName) {
                    nameMap = {};
                }
                let outCount = 0;
                for (const [memberName, memberSchema] of ns.structIterator()) {
                    const serializableValue = this._write(memberSchema, record[memberName], ns);
                    if (serializableValue !== undefined) {
                        let targetKey = memberName;
                        if (jsonName) {
                            targetKey = memberSchema.getMergedTraits().jsonName ?? memberName;
                            nameMap[memberName] = targetKey;
                        }
                        out[targetKey] = serializableValue;
                        outCount++;
                    }
                }
                if (ns.isUnionSchema() && outCount === 0) {
                    const { $unknown } = record;
                    if (Array.isArray($unknown)) {
                        const [k, v] = $unknown;
                        out[k] = this._write(15, v);
                    }
                }
                else if (typeof record.__type === "string") {
                    for (const k in record) {
                        const v = record[k];
                        const targetKey = jsonName ? nameMap[k] ?? k : k;
                        if (!(targetKey in out)) {
                            out[targetKey] = this._write(15, v);
                        }
                    }
                }
                return out;
            }
            if (Array.isArray(value) && ns.isListSchema()) {
                const listMember = ns.getValueSchema();
                const out = [];
                const sparse = !!ns.getMergedTraits().sparse;
                for (const item of value) {
                    if (sparse || item != null) {
                        out.push(this._write(listMember, item));
                    }
                }
                return out;
            }
            if (ns.isMapSchema()) {
                const mapMember = ns.getValueSchema();
                const out = {};
                const sparse = !!ns.getMergedTraits().sparse;
                for (const _k in value) {
                    const _v = value[_k];
                    if (sparse || _v != null) {
                        out[_k] = this._write(mapMember, _v);
                    }
                }
                return out;
            }
            if (value instanceof Uint8Array && (ns.isBlobSchema() || ns.isDocumentSchema())) {
                if (ns === this.rootSchema) {
                    return value;
                }
                return (this.serdeContext?.base64Encoder ?? toBase64.toBase64)(value);
            }
            if (value instanceof Date && (ns.isTimestampSchema() || ns.isDocumentSchema())) {
                const format = (0,determineTimestampFormat.determineTimestampFormat)(ns, this.settings);
                switch (format) {
                    case 5:
                        return value.toISOString().replace(".000Z", "Z");
                    case 6:
                        return (0,date_utils.dateToUtcString)(value);
                    case 7:
                        return value.getTime() / 1000;
                    default:
                        console.warn("Missing timestamp format, using epoch seconds", value);
                        return value.getTime() / 1000;
                }
            }
            if (value instanceof NumericValue.NumericValue) {
                this.useReplacer = true;
            }
        }
        if (value === null && container?.isStructSchema()) {
            return void 0;
        }
        if (ns.isStringSchema()) {
            if (typeof value === "undefined" && ns.isIdempotencyToken()) {
                return (0,serde.generateIdempotencyToken)();
            }
            const mediaType = ns.getMergedTraits().mediaType;
            if (value != null && mediaType) {
                const isJson = mediaType === "application/json" || mediaType.endsWith("+json");
                if (isJson) {
                    return lazy_json.LazyJsonString.from(value);
                }
            }
            return value;
        }
        if (typeof value === "number" && ns.isNumericSchema()) {
            if (Math.abs(value) === Infinity || isNaN(value)) {
                return String(value);
            }
            return value;
        }
        if (typeof value === "string" && ns.isBlobSchema()) {
            if (ns === this.rootSchema) {
                return value;
            }
            return (this.serdeContext?.base64Encoder ?? toBase64.toBase64)(value);
        }
        if (typeof value === "bigint") {
            this.useReplacer = true;
        }
        if (ns.isDocumentSchema()) {
            if (isObject) {
                const out = Array.isArray(value) ? [] : {};
                for (const k in value) {
                    const v = value[k];
                    if (v instanceof NumericValue.NumericValue) {
                        this.useReplacer = true;
                        out[k] = v;
                    }
                    else {
                        out[k] = this._write(ns, v);
                    }
                }
                return out;
            }
            else {
                return structuredClone(value);
            }
        }
        return value;
    }
}

;// ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/JsonCodec.js



class JsonCodec extends ConfigurableSerdeContext.SerdeContextConfig {
    settings;
    constructor(settings) {
        super();
        this.settings = settings;
    }
    createSerializer() {
        const serializer = new JsonShapeSerializer(this.settings);
        serializer.setSerdeContext(this.serdeContext);
        return serializer;
    }
    createDeserializer() {
        const deserializer = new JsonShapeDeserializer(this.settings);
        deserializer.setSerdeContext(this.serdeContext);
        return deserializer;
    }
}

;// ../../node_modules/.pnpm/@aws-sdk+core@3.974.12/node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsRestJsonProtocol.js





class AwsRestJsonProtocol extends HttpBindingProtocol.HttpBindingProtocol {
    serializer;
    deserializer;
    codec;
    mixin = new ProtocolLib.ProtocolLib();
    constructor({ defaultNamespace, errorTypeRegistries, }) {
        super({
            defaultNamespace,
            errorTypeRegistries,
        });
        const settings = {
            timestampFormat: {
                useTrait: true,
                default: 7,
            },
            httpBindings: true,
            jsonName: true,
        };
        this.codec = new JsonCodec(settings);
        this.serializer = new HttpInterceptingShapeSerializer.HttpInterceptingShapeSerializer(this.codec.createSerializer(), settings);
        this.deserializer = new HttpInterceptingShapeDeserializer.HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), settings);
    }
    getShapeId() {
        return "aws.protocols#restJson1";
    }
    getPayloadCodec() {
        return this.codec;
    }
    setSerdeContext(serdeContext) {
        this.codec.setSerdeContext(serdeContext);
        super.setSerdeContext(serdeContext);
    }
    async serializeRequest(operationSchema, input, context) {
        const request = await super.serializeRequest(operationSchema, input, context);
        const inputSchema = NormalizedSchema.NormalizedSchema.of(operationSchema.input);
        if (!request.headers["content-type"]) {
            const contentType = this.mixin.resolveRestContentType(this.getDefaultContentType(), inputSchema);
            if (contentType) {
                request.headers["content-type"] = contentType;
            }
        }
        if (request.body == null && request.headers["content-type"] === this.getDefaultContentType()) {
            request.body = "{}";
        }
        return request;
    }
    async deserializeResponse(operationSchema, context, response) {
        const output = await super.deserializeResponse(operationSchema, context, response);
        const outputSchema = NormalizedSchema.NormalizedSchema.of(operationSchema.output);
        for (const [name, member] of outputSchema.structIterator()) {
            if (member.getMemberTraits().httpPayload && !(name in output)) {
                output[name] = null;
            }
        }
        return output;
    }
    async handleError(operationSchema, context, response, dataObject, metadata) {
        const errorIdentifier = loadRestJsonErrorCode(response, dataObject) ?? "Unknown";
        this.mixin.compose(this.compositeErrorRegistry, errorIdentifier, this.options.defaultNamespace);
        const { errorSchema, errorMetadata } = await this.mixin.getErrorSchemaOrThrowBaseException(errorIdentifier, this.options.defaultNamespace, response, dataObject, metadata);
        const ns = NormalizedSchema.NormalizedSchema.of(errorSchema);
        const message = dataObject.message ?? dataObject.Message ?? "UnknownError";
        const ErrorCtor = this.compositeErrorRegistry.getErrorCtor(errorSchema) ?? Error;
        const exception = new ErrorCtor({});
        await this.deserializeHttpMessage(errorSchema, context, response, dataObject);
        const output = {};
        const errorDeserializer = this.codec.createDeserializer();
        for (const [name, member] of ns.structIterator()) {
            const target = member.getMergedTraits().jsonName ?? name;
            output[name] = errorDeserializer.readObject(member, dataObject[target]);
        }
        throw this.mixin.decorateServiceException(Object.assign(exception, errorMetadata, {
            $fault: ns.getMergedTraits().error,
            message,
        }, output), dataObject);
    }
    getDefaultContentType() {
        return "application/json";
    }
}


/***/ },

/***/ 2470
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NoAuthSigner: () => (/* binding */ NoAuthSigner)
/* harmony export */ });
class NoAuthSigner {
    async sign(httpRequest, identity, signingProperties) {
        return httpRequest;
    }
}


/***/ },

/***/ 2468
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"name":"@aws-sdk/nested-clients","version":"3.997.10","description":"Nested clients for AWS SDK packages.","main":"./dist-cjs/index.js","module":"./dist-es/index.js","types":"./dist-types/index.d.ts","scripts":{"build":"yarn lint && concurrently \'yarn:build:types\' \'yarn:build:es\' && yarn build:cjs","build:cjs":"node ../../scripts/compilation/inline nested-clients","build:es":"tsc -p tsconfig.es.json","build:include:deps":"yarn g:turbo run build -F=\\"$npm_package_name\\"","build:types":"tsc -p tsconfig.types.json","build:types:downlevel":"downlevel-dts dist-types dist-types/ts3.4","clean":"premove dist-cjs dist-es dist-types tsconfig.cjs.tsbuildinfo tsconfig.es.tsbuildinfo tsconfig.types.tsbuildinfo","lint":"node ../../scripts/validation/submodules-linter.js --pkg nested-clients","test":"yarn g:vitest run","test:watch":"yarn g:vitest watch"},"engines":{"node":">=20.0.0"},"sideEffects":false,"author":{"name":"AWS SDK for JavaScript Team","url":"https://aws.amazon.com/javascript/"},"license":"Apache-2.0","dependencies":{"@aws-crypto/sha256-browser":"5.2.0","@aws-crypto/sha256-js":"5.2.0","@aws-sdk/core":"^3.974.12","@aws-sdk/signature-v4-multi-region":"^3.996.27","@aws-sdk/types":"^3.973.8","@smithy/core":"^3.24.2","@smithy/fetch-http-handler":"^5.4.2","@smithy/node-http-handler":"^4.7.2","@smithy/types":"^4.14.1","tslib":"^2.6.2"},"devDependencies":{"concurrently":"7.0.0","downlevel-dts":"0.10.1","premove":"4.0.0","typescript":"~5.8.3"},"typesVersions":{"<4.5":{"dist-types/*":["dist-types/ts3.4/*"]}},"files":["./cognito-identity.d.ts","./cognito-identity.js","./signin.d.ts","./signin.js","./sso-oidc.d.ts","./sso-oidc.js","./sso.d.ts","./sso.js","./sts.d.ts","./sts.js","dist-*/**"],"browser":{"./dist-es/submodules/cognito-identity/runtimeConfig":"./dist-es/submodules/cognito-identity/runtimeConfig.browser","./dist-es/submodules/signin/runtimeConfig":"./dist-es/submodules/signin/runtimeConfig.browser","./dist-es/submodules/sso-oidc/runtimeConfig":"./dist-es/submodules/sso-oidc/runtimeConfig.browser","./dist-es/submodules/sso/runtimeConfig":"./dist-es/submodules/sso/runtimeConfig.browser","./dist-es/submodules/sts/runtimeConfig":"./dist-es/submodules/sts/runtimeConfig.browser"},"react-native":{},"homepage":"https://github.com/aws/aws-sdk-js-v3/tree/main/packages/nested-clients","repository":{"type":"git","url":"https://github.com/aws/aws-sdk-js-v3.git","directory":"packages/nested-clients"},"exports":{"./package.json":"./package.json","./sso-oidc":{"types":"./dist-types/submodules/sso-oidc/index.d.ts","module":"./dist-es/submodules/sso-oidc/index.js","node":"./dist-cjs/submodules/sso-oidc/index.js","import":"./dist-es/submodules/sso-oidc/index.js","require":"./dist-cjs/submodules/sso-oidc/index.js"},"./sts":{"types":"./dist-types/submodules/sts/index.d.ts","module":"./dist-es/submodules/sts/index.js","node":"./dist-cjs/submodules/sts/index.js","import":"./dist-es/submodules/sts/index.js","require":"./dist-cjs/submodules/sts/index.js"},"./signin":{"types":"./dist-types/submodules/signin/index.d.ts","module":"./dist-es/submodules/signin/index.js","node":"./dist-cjs/submodules/signin/index.js","import":"./dist-es/submodules/signin/index.js","require":"./dist-cjs/submodules/signin/index.js"},"./cognito-identity":{"types":"./dist-types/submodules/cognito-identity/index.d.ts","module":"./dist-es/submodules/cognito-identity/index.js","node":"./dist-cjs/submodules/cognito-identity/index.js","import":"./dist-es/submodules/cognito-identity/index.js","require":"./dist-cjs/submodules/cognito-identity/index.js"},"./sso":{"types":"./dist-types/submodules/sso/index.d.ts","module":"./dist-es/submodules/sso/index.js","node":"./dist-cjs/submodules/sso/index.js","import":"./dist-es/submodules/sso/index.js","require":"./dist-cjs/submodules/sso/index.js"}}}');

/***/ }

};
;
//# sourceMappingURL=11.js.map