// Builders for minimal OpenAPI documents that lint clean against the ruleset. A test starts from
// `baseline()` and applies one mutation, so any lint result it sees is caused by that mutation.
//
// Pure: documents are plain values, and every builder returns a new one.

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };

const problemResponse: JsonObject = { $ref: "#/components/responses/Problem" };

/** A GET operation that satisfies every rule: scoped, tagged, described, errors as problem+json. */
export function cleanGet(operationId: string): JsonObject {
  return {
    operationId,
    summary: "Read it",
    description: "Reads the thing.",
    tags: ["things"],
    security: [{ oauth: ["things:read"] }],
    responses: {
      "200": {
        description: "The thing.",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Thing" } } },
      },
      "401": problemResponse,
    },
  };
}

/** The smallest document that lints with no results at all. */
export function baseline(): JsonObject {
  return {
    openapi: "3.1.2",
    info: {
      title: "Baseline",
      version: "1.0.0",
      description: "A minimal clean document for rule tests.",
      contact: { name: "Maintainers", url: "https://example.com" },
    },
    servers: [{ url: "https://api.example.com" }],
    tags: [{ name: "things", description: "Things." }],
    paths: { "/v1/things": { get: cleanGet("listThings") } },
    components: {
      securitySchemes: {
        oauth: {
          type: "oauth2",
          description: "OAuth 2.0.",
          flows: {
            clientCredentials: {
              tokenUrl: "https://auth.example.com/token",
              scopes: { "things:read": "Read things." },
            },
          },
        },
      },
      responses: {
        Problem: {
          description: "A problem.",
          content: {
            "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } },
          },
        },
      },
      schemas: {
        Thing: {
          type: "object",
          properties: { thingId: { type: "string", description: "The id." } },
        },
        Problem: {
          type: "object",
          required: ["type", "title", "status"],
          properties: {
            type: { type: "string", description: "Problem type." },
            title: { type: "string", description: "Summary." },
            status: { type: "integer", description: "HTTP status." },
          },
        },
      },
    },
  };
}

function asObject(value: Json | undefined): JsonObject {
  if (value === undefined || value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("expected an object");
  }
  return value;
}

/** Deep copy, so a mutation never reaches the caller's document. */
export function clone<T extends Json>(doc: T): T {
  return structuredClone(doc);
}

/** Replace the paths map. */
export function withPaths(doc: JsonObject, paths: JsonObject): JsonObject {
  return { ...clone(doc), paths };
}

/** Add a clean GET at `path`, keeping the baseline path. */
export function withExtraPath(doc: JsonObject, path: string): JsonObject {
  const next = clone(doc);
  const paths = asObject(next["paths"]);
  paths[path] = { get: cleanGet("getExtra") };
  return next;
}

/** Add a property to the Thing schema. */
export function withThingProperty(doc: JsonObject, name: string, schema: JsonObject): JsonObject {
  const next = clone(doc);
  const thing = asObject(asObject(asObject(next["components"])["schemas"])["Thing"]);
  asObject(thing["properties"])[name] = schema;
  return next;
}

/** Add a parameter to the baseline GET. */
export function withParameter(doc: JsonObject, parameter: JsonObject): JsonObject {
  const next = clone(doc);
  const get = asObject(asObject(asObject(next["paths"])["/v1/things"])["get"]);
  get["parameters"] = [parameter];
  return next;
}

/** Edit the baseline GET in place on a copy. */
export function withBaselineGet(doc: JsonObject, edit: (get: JsonObject) => void): JsonObject {
  const next = clone(doc);
  edit(asObject(asObject(asObject(next["paths"])["/v1/things"])["get"]));
  return next;
}
