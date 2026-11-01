// One mutation per rule. The baseline lints with no results, and each case's document must
// report its rule. Every `as-` rule in the ruleset must have a case here, so a new rule can't
// ship without a test that shows it fires.

import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { ruleNames } from "../src/results.ts";
import {
  baseline,
  cleanGet,
  withBaselineGet,
  withExtraPath,
  withParameter,
  withPaths,
  withThingProperty,
  type JsonObject,
} from "../src/spec.ts";
import { lintDocuments, rulesetPath } from "../src/spectral.ts";

const base = baseline();
const query = (name: string): JsonObject => ({ name, in: "query", description: "q", schema: { type: "string" } });

const cases: Record<string, JsonObject> = {
  "as-openapi-3-1-2": { ...base, openapi: "3.1.0" },
  "as-path-versioned": withExtraPath(base, "/things"),
  "as-path-no-api-prefix": withExtraPath(base, "/v1/api/things"),
  "as-path-no-minor-version": withExtraPath(base, "/v1.2/things"),
  "as-path-kebab-case": withExtraPath(base, "/v1/thing_items"),
  "as-path-plural-resource": withExtraPath(base, "/v1/thing"),
  "as-path-no-action-verbs": withExtraPath(base, "/v1/things/{thingId}/deactivate"),
  "as-computation-marked": withExtraPath(base, "/v1/things/calculate"),
  "as-parameter-camel-case": withParameter(base, query("page_size")),
  "as-property-camel-case": withThingProperty(base, "thing_name", { type: "string", description: "x" }),
  "as-enum-described": withThingProperty(base, "kind", { type: "string", enum: ["a", "b"] }),
  "as-datetime-format": withThingProperty(base, "createDate", { type: "string", description: "x" }),
  "as-no-offset-pagination": withParameter(base, query("offset")),
  "as-no-total-count": withThingProperty(base, "totalCount", { type: "integer", description: "x" }),
  "as-problem-json": withBaselineGet(base, (get) => {
    get["responses"] = { ...(get["responses"] as JsonObject), "404": { description: "Not found." } };
  }),
  "as-no-xml": withBaselineGet(base, (get) => {
    get["responses"] = {
      "200": { description: "x", content: { "application/xml": { schema: { type: "object" } } } },
    };
  }),
  "as-upload-limits": withPaths(base, {
    "/v1/things": {
      post: {
        ...cleanGet("createThing"),
        requestBody: { content: { "multipart/form-data": { schema: { type: "object" } } } },
      },
    },
  }),
  "as-operation-scopes": withBaselineGet(base, (get) => {
    get["security"] = [{ oauth: [] }];
  }),
  "as-oauth2-only": {
    ...base,
    components: {
      ...(base["components"] as JsonObject),
      securitySchemes: { key: { type: "apiKey", in: "header", name: "X-Key", description: "x" } },
    },
  },
  "as-no-tenant-parameter": withParameter(base, { ...query("tenantId") }),
  "as-deprecation-headers": withBaselineGet(base, (get) => {
    get["deprecated"] = true;
  }),
  "as-429-retry-after": withBaselineGet(base, (get) => {
    get["responses"] = {
      ...(get["responses"] as JsonObject),
      "429": { $ref: "#/components/responses/Problem" },
    };
  }),
};

let results: Map<string, Set<string>>;

beforeAll(() => {
  results = lintDocuments(new Map<string, JsonObject>([["baseline", base], ...Object.entries(cases)]));
});

describe("ruleset", () => {
  it("has a test case for every as- rule, and no case for a rule that doesn't exist", () => {
    const defined = ruleNames(readFileSync(rulesetPath, "utf8")).sort();
    expect(defined.length).toBeGreaterThan(0);
    expect(Object.keys(cases).sort()).toEqual(defined);
  });

  it("reports nothing on the baseline document", () => {
    expect([...(results.get("baseline") ?? ["missing"])]).toEqual([]);
  });

  for (const rule of Object.keys(cases)) {
    it(`${rule} fires on its mutation`, () => {
      expect([...(results.get(rule) ?? [])]).toContain(rule);
    });
  }
});
