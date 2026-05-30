"use strict";
exports.id = 9;
exports.ids = [9];
exports.modules = {

/***/ 2463
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  EventStreamCodec: () => (/* reexport */ EventStreamCodec.EventStreamCodec),
  EventStreamMarshaller: () => (/* reexport */ EventStreamMarshaller.EventStreamMarshaller),
  EventStreamSerde: () => (/* reexport */ EventStreamSerde),
  HeaderMarshaller: () => (/* reexport */ HeaderMarshaller.HeaderMarshaller),
  Int64: () => (/* reexport */ Int64.Int64),
  MessageDecoderStream: () => (/* reexport */ MessageDecoderStream.MessageDecoderStream),
  MessageEncoderStream: () => (/* reexport */ MessageEncoderStream.MessageEncoderStream),
  SmithyMessageDecoderStream: () => (/* reexport */ SmithyMessageDecoderStream.SmithyMessageDecoderStream),
  SmithyMessageEncoderStream: () => (/* reexport */ SmithyMessageEncoderStream.SmithyMessageEncoderStream),
  UniversalEventStreamMarshaller: () => (/* reexport */ eventstream_serde_universal_EventStreamMarshaller.EventStreamMarshaller),
  eventStreamSerdeProvider: () => (/* reexport */ EventStreamMarshaller.eventStreamSerdeProvider),
  getChunkedStream: () => (/* reexport */ getChunkedStream.getChunkedStream),
  getMessageUnmarshaller: () => (/* reexport */ getUnmarshalledStream.getMessageUnmarshaller),
  getUnmarshalledStream: () => (/* reexport */ getUnmarshalledStream.getUnmarshalledStream),
  iterableToReadableStream: () => (/* reexport */ iterableToReadableStream),
  readableStreamToIterable: () => (/* reexport */ readableStreamToIterable),
  resolveEventStreamSerdeConfig: () => (/* reexport */ EventStreamSerdeConfig.resolveEventStreamSerdeConfig),
  universalEventStreamSerdeProvider: () => (/* reexport */ eventstream_serde_universal_EventStreamMarshaller.eventStreamSerdeProvider)
});

// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/EventStreamCodec.js + 1 modules
var EventStreamCodec = __webpack_require__(2051);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/HeaderMarshaller.js
var HeaderMarshaller = __webpack_require__(2054);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/Int64.js
var Int64 = __webpack_require__(2055);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/MessageDecoderStream.js
var MessageDecoderStream = __webpack_require__(2056);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/MessageEncoderStream.js
var MessageEncoderStream = __webpack_require__(2057);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/SmithyMessageDecoderStream.js
var SmithyMessageDecoderStream = __webpack_require__(2058);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-codec/SmithyMessageEncoderStream.js
var SmithyMessageEncoderStream = __webpack_require__(2059);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde/EventStreamMarshaller.js
var EventStreamMarshaller = __webpack_require__(2049);
;// ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde/utils.js
const readableStreamToIterable = (readableStream) => ({
    [Symbol.asyncIterator]: async function* () {
        const reader = readableStream.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    return;
                yield value;
            }
        }
        finally {
            reader.releaseLock();
        }
    },
});
const iterableToReadableStream = (asyncIterable) => {
    const iterator = asyncIterable[Symbol.asyncIterator]();
    return new ReadableStream({
        async pull(controller) {
            const { done, value } = await iterator.next();
            if (done) {
                return controller.close();
            }
            controller.enqueue(value);
        },
    });
};

// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/EventStreamMarshaller.js
var eventstream_serde_universal_EventStreamMarshaller = __webpack_require__(2050);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/getChunkedStream.js
var getChunkedStream = __webpack_require__(2060);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-universal/getUnmarshalledStream.js
var getUnmarshalledStream = __webpack_require__(2061);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/eventstream-serde-config-resolver/EventStreamSerdeConfig.js
var EventStreamSerdeConfig = __webpack_require__(1985);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.js
var toUtf8 = __webpack_require__(1996);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.js
var fromUtf8 = __webpack_require__(1995);
;// ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/EventStreamSerde.js

class EventStreamSerde {
    marshaller;
    serializer;
    deserializer;
    serdeContext;
    defaultContentType;
    constructor({ marshaller, serializer, deserializer, serdeContext, defaultContentType, }) {
        this.marshaller = marshaller;
        this.serializer = serializer;
        this.deserializer = deserializer;
        this.serdeContext = serdeContext;
        this.defaultContentType = defaultContentType;
    }
    async serializeEventStream({ eventStream, requestSchema, initialRequest, }) {
        const marshaller = this.marshaller;
        const eventStreamMember = requestSchema.getEventStreamMember();
        const unionSchema = requestSchema.getMemberSchema(eventStreamMember);
        const serializer = this.serializer;
        const defaultContentType = this.defaultContentType;
        const initialRequestMarker = Symbol("initialRequestMarker");
        const eventStreamIterable = {
            async *[Symbol.asyncIterator]() {
                if (initialRequest) {
                    const headers = {
                        ":event-type": { type: "string", value: "initial-request" },
                        ":message-type": { type: "string", value: "event" },
                        ":content-type": { type: "string", value: defaultContentType },
                    };
                    serializer.write(requestSchema, initialRequest);
                    const body = serializer.flush();
                    yield {
                        [initialRequestMarker]: true,
                        headers,
                        body,
                    };
                }
                for await (const page of eventStream) {
                    yield page;
                }
            },
        };
        return marshaller.serialize(eventStreamIterable, (event) => {
            if (event[initialRequestMarker]) {
                return {
                    headers: event.headers,
                    body: event.body,
                };
            }
            let unionMember = "";
            for (const key in event) {
                if (key !== "__type") {
                    unionMember = key;
                    break;
                }
            }
            const { additionalHeaders, body, eventType, explicitPayloadContentType } = this.writeEventBody(unionMember, unionSchema, event);
            const headers = {
                ":event-type": { type: "string", value: eventType },
                ":message-type": { type: "string", value: "event" },
                ":content-type": { type: "string", value: explicitPayloadContentType ?? defaultContentType },
                ...additionalHeaders,
            };
            return {
                headers,
                body,
            };
        });
    }
    async deserializeEventStream({ response, responseSchema, initialResponseContainer, }) {
        const marshaller = this.marshaller;
        const eventStreamMember = responseSchema.getEventStreamMember();
        const unionSchema = responseSchema.getMemberSchema(eventStreamMember);
        const memberSchemas = unionSchema.getMemberSchemas();
        const initialResponseMarker = Symbol("initialResponseMarker");
        const asyncIterable = marshaller.deserialize(response.body, async (event) => {
            let unionMember = "";
            for (const key in event) {
                if (key !== "__type") {
                    unionMember = key;
                    break;
                }
            }
            const body = event[unionMember].body;
            if (unionMember === "initial-response") {
                const dataObject = await this.deserializer.read(responseSchema, body);
                delete dataObject[eventStreamMember];
                return {
                    [initialResponseMarker]: true,
                    ...dataObject,
                };
            }
            else if (unionMember in memberSchemas) {
                const eventStreamSchema = memberSchemas[unionMember];
                if (eventStreamSchema.isStructSchema()) {
                    const out = {};
                    let hasBindings = false;
                    for (const [name, member] of eventStreamSchema.structIterator()) {
                        const { eventHeader, eventPayload } = member.getMergedTraits();
                        hasBindings = hasBindings || Boolean(eventHeader || eventPayload);
                        if (eventPayload) {
                            if (member.isBlobSchema()) {
                                out[name] = body;
                            }
                            else if (member.isStringSchema()) {
                                out[name] = (this.serdeContext?.utf8Encoder ?? toUtf8.toUtf8)(body);
                            }
                            else if (member.isStructSchema()) {
                                out[name] = await this.deserializer.read(member, body);
                            }
                        }
                        else if (eventHeader) {
                            const value = event[unionMember].headers[name]?.value;
                            if (value != null) {
                                if (member.isNumericSchema()) {
                                    if (value && typeof value === "object" && "bytes" in value) {
                                        out[name] = BigInt(value.toString());
                                    }
                                    else {
                                        out[name] = Number(value);
                                    }
                                }
                                else {
                                    out[name] = value;
                                }
                            }
                        }
                    }
                    if (hasBindings) {
                        return {
                            [unionMember]: out,
                        };
                    }
                    if (body.byteLength === 0) {
                        return {
                            [unionMember]: {},
                        };
                    }
                }
                return {
                    [unionMember]: await this.deserializer.read(eventStreamSchema, body),
                };
            }
            else {
                return {
                    $unknown: event,
                };
            }
        });
        const asyncIterator = asyncIterable[Symbol.asyncIterator]();
        const firstEvent = await asyncIterator.next();
        if (firstEvent.done) {
            return asyncIterable;
        }
        if (firstEvent.value?.[initialResponseMarker]) {
            if (!responseSchema) {
                throw new Error("@smithy::core/protocols - initial-response event encountered in event stream but no response schema given.");
            }
            for (const key in firstEvent.value) {
                initialResponseContainer[key] = firstEvent.value[key];
            }
        }
        return {
            async *[Symbol.asyncIterator]() {
                if (!firstEvent?.value?.[initialResponseMarker]) {
                    yield firstEvent.value;
                }
                while (true) {
                    const { done, value } = await asyncIterator.next();
                    if (done) {
                        break;
                    }
                    yield value;
                }
            },
        };
    }
    writeEventBody(unionMember, unionSchema, event) {
        const serializer = this.serializer;
        let eventType = unionMember;
        let explicitPayloadMember = null;
        let explicitPayloadContentType;
        const isKnownSchema = (() => {
            const struct = unionSchema.getSchema();
            return struct[4].includes(unionMember);
        })();
        const additionalHeaders = {};
        if (!isKnownSchema) {
            const [type, value] = event[unionMember];
            eventType = type;
            serializer.write(15, value);
        }
        else {
            const eventSchema = unionSchema.getMemberSchema(unionMember);
            if (eventSchema.isStructSchema()) {
                for (const [memberName, memberSchema] of eventSchema.structIterator()) {
                    const { eventHeader, eventPayload } = memberSchema.getMergedTraits();
                    if (eventPayload) {
                        explicitPayloadMember = memberName;
                    }
                    else if (eventHeader) {
                        const value = event[unionMember][memberName];
                        let type = "binary";
                        if (memberSchema.isNumericSchema()) {
                            if ((-2) ** 31 <= value && value <= 2 ** 31 - 1) {
                                type = "integer";
                            }
                            else {
                                type = "long";
                            }
                        }
                        else if (memberSchema.isTimestampSchema()) {
                            type = "timestamp";
                        }
                        else if (memberSchema.isStringSchema()) {
                            type = "string";
                        }
                        else if (memberSchema.isBooleanSchema()) {
                            type = "boolean";
                        }
                        if (value != null) {
                            additionalHeaders[memberName] = {
                                type,
                                value,
                            };
                            delete event[unionMember][memberName];
                        }
                    }
                }
                if (explicitPayloadMember !== null) {
                    const payloadSchema = eventSchema.getMemberSchema(explicitPayloadMember);
                    if (payloadSchema.isBlobSchema()) {
                        explicitPayloadContentType = "application/octet-stream";
                    }
                    else if (payloadSchema.isStringSchema()) {
                        explicitPayloadContentType = "text/plain";
                    }
                    serializer.write(payloadSchema, event[unionMember][explicitPayloadMember]);
                }
                else {
                    serializer.write(eventSchema, event[unionMember]);
                }
            }
            else if (eventSchema.isUnitSchema()) {
                serializer.write(eventSchema, {});
            }
            else {
                throw new Error("@smithy/core/event-streams - non-struct member not supported in event stream union.");
            }
        }
        const messageSerialization = serializer.flush() ?? new Uint8Array();
        const body = typeof messageSerialization === "string"
            ? (this.serdeContext?.utf8Decoder ?? fromUtf8.fromUtf8)(messageSerialization)
            : messageSerialization;
        return {
            body,
            eventType,
            explicitPayloadContentType,
            additionalHeaders,
        };
    }
}

;// ../../node_modules/.pnpm/@smithy+core@3.24.3/node_modules/@smithy/core/dist-es/submodules/event-streams/index.js
















/***/ }

};
;
//# sourceMappingURL=9.js.map