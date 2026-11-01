# API Standards

**Status:** Draft · **Version:** 0.1 · **Date:** 2026-10-24 · **Changes:** Appendix E

> **This draft includes suggested content, and suggested changes are welcome.** Anything marked
> **[Suggested]** is a proposal rather than a settled rule. It's marked so it can be argued with
> in writing. Open an issue or a pull request.

---

## Part I — What this is

### 1. Purpose and scope

This document states the standards for HTTP APIs: what an API must do to be acceptable. It
covers the *interface*, not the implementation. How a team builds behind the contract is the
team's business.

It's written for APIs with more than one consumer and more than one **tenant**, meaning an
organization, account or customer whose data must stay separate from every other tenant's. A
single-tenant API can ignore the tenant-scoping rules and keep the rest.

**In scope:** every API an organization adopting this standard exposes, and every API its
applications consume.

### 2. How to read it

This document is **the only required reading**. The standards it references are for reviewers and
for anyone who wants the origin of a rule. A developer building to this document doesn't need to
read them.

Requirement keywords follow [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html):

| Keyword | Meaning |
|---|---|
| **MUST** / **MUST NOT** | An absolute requirement. An API that doesn't satisfy it isn't acceptable. |
| **SHOULD** / **SHOULD NOT** | A strong recommendation. Departing from it requires a recorded reason (§19). |
| **MAY** | Genuinely optional. |

Two conventions keep the document usable:

- **Rules are cited specifically.** Where this document adopts a rule from a published standard,
  it names the rule or section, never just "see Zalando." A developer should never have to read
  another document to learn what's required of them.
- **Where two referenced standards disagree, this document decides.** Versioning is the example.
  Zalando rule 115 forbids the version in the URI and asks for content negotiation instead. This
  document puts the major version in the path (§12, with the reasoning recorded in §19). No
  developer should have to settle a conflict between external standards.

**The linter.** The rules that can be checked mechanically are enforced by the Spectral ruleset
in this repository ([`spectral/api-standards.yaml`](spectral/api-standards.yaml)). Each lint rule
names the section it enforces. Appendix B has the list.

### 3. What this is built on

This document doesn't invent conventions where good public ones exist. It stands on the following,
each cited for a specific purpose. Licence and maintenance status for each are in Appendix A.

| Standard | Cited for |
|---|---|
| **OpenAPI Specification 3.1.2** | The contract format. Every API has a specification. |
| **Zalando RESTful API Guidelines** | Design rules (naming, JSON, errors, pagination, compatibility), cited by rule number. |
| **OWASP API Security Top 10** | The security review, mapped in §14 to tenant scoping, restricted fields and roles. |
| **Pact** | Consumer-driven contracts, verified in a pipeline. |
| **NLGov API Design Rules** | A normative API standard with a published linter, which is the closest precedent for what this document is. Cited for specific rules. |

### 4. Consumer access is designed in from the start

Consumer access **MUST** be part of an API's design from the beginning, not added once the
internal use case works. Retrofitting external access onto an interface designed for one
internal caller is where scoping and authorization defects come from.

**This is the efficient path, not just the principled one.** Designing access in from the start
is the cheapest way to deliver it, for four reasons:

- **One interface instead of two.** Access added later means either a second interface built
  beside the existing one, or a rework of the first while consumers depend on it. Both cost more
  than designing one interface once.
- **Authorization is structural, not a feature.** Tenant scoping and restricted-field filtering
  determine how requests are shaped and how the queries behind them are written (§14, §15). An
  interface designed for a single trusted internal caller has nowhere to put them, so adding them
  later means changing the shape, not adding a layer.
- **The design artifact is the deliverable.** Designing for a consumer means writing the contract
  down. That specification is the documentation, the mock, the test target and the lint target
  all at once. The work isn't additional. It's the same work, done in an order that produces
  something reusable.
- **It's cheapest before the first endpoint.** Every argument above is cheapest before anything
  is built, and gets more expensive with each endpoint built without a contract.

Supporting guidance and measured evidence for this section are in **Appendix D**.

---

## Part II — The standards

### 5. API-first and the contract

- An API **MUST** have a written OpenAPI specification, and the specification **MUST** be agreed
  before implementation begins.
- The specification **MUST** be published where consumers can reach it, not just held in a team's
  repository.
- The specification **MUST** be validated automatically (Appendix B). A specification nobody
  checks drifts from the implementation within one release.
- Every specification **MUST** declare `openapi: 3.1.2`.

**Why 3.1.2.** 3.1 aligns schemas with JSON Schema 2020-12, so the same definitions work in
ordinary validators and code generators. 3.1 is also the newest version the lint tooling fully
supports: OpenAPI 3.2 is published, but the linter can't validate 3.2 documents in a released
version yet. 3.2 is backward-compatible with 3.1, so adopting it later is a version bump rather
than a migration.

If you're used to 3.0, two changes matter. `nullable: true` is gone (use
`type: [string, "null"]`), and `example` gives way to `examples`.

> **[Suggested]** If more than one backend framework is in use, prefer **one hand-written
> specification that every backend is tested against** over generating a specification per
> framework. Generated specifications diverge in exactly the details consumers depend on.

### 6. Architecture

APIs **MUST** be REST over HTTP, and **MUST** be:

- **Stateless.** A request carries everything needed to serve it, and no client session state is
  held between requests.
- **Cache-compatible.** A response says whether it may be stored and reused, and for how long.
- **Layered.** A client knows only the server it addresses, not the systems behind it.
- **Uniform.** Clients work with resources and their state through standard HTTP methods.

Code-on-demand (the server sending executable code to the client) **MUST NOT** be used.

### 7. Data interchange

- Request and response payloads **MUST** be JSON.
- Binary responses **MAY** be returned for files, such as documents, images and PDFs.
- XML **MUST NOT** be used, except when interfacing with a legacy system that requires it.

**Binary requests. [Suggested]** Files move in as well as out, so a file upload is an ordinary
operation and has to be specified like one.

- The specification **MUST** state the accepted media types and the **maximum size** of a file.
- A request over the limit **MUST** receive `413` (RFC 9110, Content Too Large) as `problem+json`
  (§10). A file of an unaccepted type **MUST** receive `415`.
- The server **MUST** check the content against the declared type rather than trusting the
  `Content-Type` header, since the caller supplies that header.
- Metadata that travels with a file (a classification, a source identifier) **MUST** be a named
  field of the request. It must not be part of the path (§15) or folded into the file name.
- An uploaded file **MUST NOT** be served to any reader until it has passed the checks the
  environment requires.

### 8. Paths, operations and headers

- Resource paths **MUST** use the plural noun: `/documents`, not `/document`.
- Path segments **MUST** be kebab-case. Query parameter keys **MUST** be camelCase.
- Standard operations **MUST** use the standard methods: `POST` to create, `GET` to read, `PUT` or
  `PATCH` to update, `DELETE` to remove.
- An action that isn't one of the standard methods **MUST** be modeled as described under
  *Actions* below.
- Paths **MUST** follow [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986.html).
- Paths **MUST** begin with the major version, `/v1/...` (§12), and **MUST NOT** carry an `/api`
  prefix. The base path is deployment configuration and belongs in the specification's `servers`
  entry ([Zalando rule 135](https://opensource.zalando.com/restful-api-guidelines/#135), NLGov
  `/core/uri-version`). Where a UI and an API share a host, the gateway routes on the version
  segment.

Paths follow Zalando rules 129 (lowercase, kebab-case) and 134 (plural resource names), and NLGov
`/core/path-segments-kebab-case`. Query keys are camelCase, which follows NLGov
`/core/query-keys-camel-case` and **departs from Zalando rule 130**, which requires snake_case. The
departure is recorded in §19, and the reasons are in §9.

**Actions.** An action that changes state is modeled as a **resource of its own**: the client
`POST`s a noun that names the event, and the server creates a record of it. Paths stay verb-free
([Zalando rules 138 and 141](https://opensource.zalando.com/restful-api-guidelines/#138)).

- An action that changes state **MUST** be a `POST` that creates a resource named for the event,
  under the resource it acts on. The created resource **MUST** have an identifier and a
  `Location`, and **SHOULD** record who requested it, when, and why.
- An action **MUST NOT** be a verb in the path (`POST /accounts/{id}/deactivate`).
- A change that carries business rules, or has consequences beyond the field itself, **MUST NOT**
  be made with `PATCH` on a status field. `PATCH` **MAY** be used for state with no such rules,
  such as a user's own preferences.
- Each action **SHOULD** have its own scope (§14), so that permission to take one action isn't
  permission to set any state.
- Action resources are creates, so the retry rule below applies to them unchanged.
- An action that takes time **SHOULD** return `202` with the `Location` of the action resource,
  which the client reads to see progress and outcome.

| Action | Not this | This |
|---|---|---|
| Deactivate a user account | `POST /accounts/{id}/deactivate` | `POST /accounts/{id}/deactivations` |
| Approve an access request | `POST /access-requests/{id}/approve` | `POST /access-requests/{id}/approvals` |
| Revoke a machine client's credential | `PATCH /clients/{id}` `{"revoked": true}` | `POST /clients/{id}/revocations` |
| Restore a deleted document | `POST /documents/{id}/restore` | `POST /documents/{id}/restorations` |
| Resend a notification | `POST /notifications/{id}/resend` | `POST /notifications/{id}/deliveries` |
| Produce a large export | `POST /documents/export` | `POST /exports` → `202`, then `GET /exports/{id}` |
| Change a user's digest frequency | — | `PATCH /accounts/{id}/preferences` `{"emailDigest": "weekly"}` (no business rules, so `PATCH` is fine) |

Modeling the action as a record means the audit trail, the identifier a support ticket can quote,
and the scope all come with the design rather than being added later.

**The exception: computations that change nothing. [Suggested]** Some operations are neither a
read of a stored resource nor a change of state. They take input, compute an answer, and store
nothing. Forcing them into a noun produces a resource that doesn't exist.

- Such an operation **MAY** be a `POST` to a verb segment, but only if **all** of these hold:
  1. it creates, changes and deletes nothing (writing its own log lines isn't a change);
  2. its input needs a request body (if the input fits in query parameters, it **MUST** be a
     `GET` on a noun instead);
  3. calling it twice with the same input gives the same answer;
  4. the specification describes it as a computation, states that it stores nothing, and marks
     the operation `x-computation: true`.
- The verb segment **MUST NOT** be able to collide with an identifier in the same position.
- If the operation is later changed to store anything, it **MUST** become a resource under the
  rules above, which is a breaking change (§12).
- It's subject to the same tenant scoping and visibility rules as any other operation (§14, §15).

| Computation | Path |
|---|---|
| Check whether a postal address is deliverable | `POST /addresses/validate` |
| Work out a deadline from a start date and a rule | `POST /deadlines/calculate` |
| Check a file against the upload rules before sending it | `POST /documents/validate` |
| Preview what a notification will look like | `POST /notifications/preview` |

**Retries and idempotency. [Suggested]** A client that times out doesn't know whether its request
arrived, so unattended clients retry, and a retried `POST` can create a second resource.

- An operation that creates a resource and is called by an unattended client **SHOULD** be safe
  to retry. There are two ways to make it so, and the specification **MUST** say which one applies:
  1. **A secondary key** in the request body, such as the identifier the sender already has for
     the thing (`sourceId`). The server enforces uniqueness on it. A retry returns `409` with the
     existing resource's `Location`, and the client treats that as success. Use this whenever a
     natural key exists, because it needs no cache and survives restarts.
  2. **An `Idempotency-Key` header** carrying a random value the client generates. The server
     stores the key with the first response for at least 24 hours and replays that response to a
     retry. A retry whose body differs from the original **MUST** be rejected with `400`.
- **Either key MUST be unique within the tenant the credential belongs to, never across tenants.**
  A key checked globally would answer one tenant's retry with a conflict caused by another
  tenant's record, which tells the first tenant something about the second tenant's data (§14,
  §15).
- A consumer **MUST NOT** retry a request that failed with a `4xx` other than `429`.

**Correlation. [Suggested]** One identifier **MUST** follow a request through every service it
touches. That way a failure a consumer reports can be found in logs written by teams that never
spoke to each other.

- A request **MAY** carry `X-Correlation-Id`. If it doesn't, the first API to receive the request
  **MUST** create one. Every API **MUST** pass it unchanged to each downstream call, write it in
  every log line for that request, and return it both in the response header and as a
  `correlationId` member of a `problem+json` body (§10).
- A valid value is a UUID, or a string of up to 128 characters from `A–Z a–z 0–9 - _ = / +`. An
  API **MUST** replace a value that doesn't match, because the caller supplies the header and it
  ends up in log files.
- The identifier **MUST NOT** encode a person, a record or a tenant, and **MUST NOT** be used for
  any authorization decision.
- `traceparent` and `tracestate` ([W3C Trace Context](https://www.w3.org/TR/trace-context/)) are
  passed through untouched for the tracing tools. They're separate from the correlation
  identifier and don't replace it.

### 9. Naming and field vocabulary

- Dates and timestamps **MUST** follow [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html)
  (`2026-09-17T14:05:00Z`). Timestamps **MUST** carry an offset, and UTC is preferred.
- Property names **MUST** be camelCase. Query keys follow the same rule (§8).
- Enumerated values **MUST** be documented in the specification, with their meanings.
- Countries **MUST** use ISO 3166-1 alpha-2 codes, subdivisions ISO 3166-2, currencies ISO 4217,
  and languages BCP 47 tags.

**Why camelCase.** Zalando rules 118 and 130 require snake_case, and this document departs from
them (§19). camelCase is the native property style of the JavaScript and TypeScript clients most
APIs end up serving. It's also the convention of the Google JSON Style Guide and the Microsoft
REST API Guidelines, and NLGov requires it for query keys (`/core/query-keys-camel-case`). One
convention for both properties and query keys means a field keeps the same name whether it's
filtered on or read back.

**Common fields.** Where an API expresses one of these concepts, it **MUST** use these names:

| Name | Type | Meaning |
|---|---|---|
| `createDate` | datetime | When the resource was created |
| `updateDate` | datetime | When the resource was last updated |
| `deleteDate` | datetime | When the resource was soft-deleted |
| `startDate` / `endDate` | datetime | Bounds of a datetime range |
| `cursor` | string | Opaque position in a collection, taken from a pagination link (§11) |
| `limit` | integer | Maximum items to return in one page |
| `self` / `first` / `prev` / `next` | string | Pagination links (§11) |
| `filter` | string | How a list is filtered |
| `sort` | string | How a list is sorted |

**Domain vocabulary. [Suggested]** Beyond the common fields, a domain needs a shared vocabulary
for its own nouns, so that the same concept doesn't arrive under three names from three teams.
That vocabulary **SHOULD** be owned by whoever owns the organization's data model, and **SHOULD**
reuse names already established in production interfaces rather than minting new ones. Until it's
settled, teams **SHOULD** record each name they choose for a domain concept so that the choices
can be reconciled later.

### 10. Errors

- Error responses **MUST** use `application/problem+json`, per
  [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html).
- Every error **MUST** carry a `type`, `title` and `status`, and **SHOULD** carry `detail` and
  `instance`.
- Error messages **MUST NOT** leak information the caller isn't entitled to. In particular, an
  error **MUST NOT** reveal that a restricted record exists. Where a caller isn't entitled to know
  a record exists, the API **MUST** respond as though it doesn't.
- Standard status codes: `400` bad request · `401` unauthorized · `403` forbidden · `404` not found
  · `429` too many requests · `500` internal error · `502` bad gateway · `503` unavailable ·
  `504` gateway timeout.

The distinction between `403` and `404` is a privacy decision, not a technical one. See §15.

### 11. Pagination

- Collection endpoints **MUST** paginate, and **MUST** have a default `limit`.
- Pagination **MUST** be cursor-based ([Zalando rule 160](https://opensource.zalando.com/restful-api-guidelines/#160)),
  using the field names in §9. A response carries `self` and `next` links, plus `first` and `prev`
  where they mean something. A client follows the links rather than building cursors itself.
- A cursor **MUST** be opaque to the client. It **MUST** be bound to the caller's tenant and to the
  query that produced it, and a cursor presented with a different credential or a different query
  **MUST** be rejected with `400`. A cursor **MUST NOT** encode a record identifier the caller
  could read back out of it.
- The maximum `limit` **MUST** be documented, and a request that exceeds it **MUST** be clamped
  rather than rejected.
- A collection response **MUST NOT** include a total count of matching records
  ([Zalando rule 254](https://opensource.zalando.com/restful-api-guidelines/#254)).

**Why no total count.** A total is a second answer to the same query, and it's only safe if it's
computed under exactly the same visibility rules as the page. Suppose a count were taken before the
restriction filters were applied, for example by a separate count query that didn't read through
the same views as the page (§15). Then the total could be larger than the number of records the
caller can ever page through. The difference would tell the caller that restricted records match
their filter, and with a narrow enough filter (one person, one identifier, one day) it could point
at a specific record. Counting only over visible records would close that hole, but it depends on
two code paths staying identical for the life of the API, and that kind of agreement drifts
without anyone noticing. Omitting the total removes the question. A screen that needs a count can
ask a purpose-built endpoint whose visibility rules are reviewed on their own.

**Why cursors.** Many collections are append-heavy: activity feeds, audit logs, message
histories. With offset paging, an item added while a client is reading shifts every later page by
one, so the client sees an item twice or misses one. A cursor marks a position in the data, not a
count of rows, so it holds still as items arrive. The cost is that a client can't jump to page
*n*. It pages forward and back.

### 12. Versioning

- The **major version MUST appear in the path**: `/v1/documents`. The path **MUST NOT** carry an
  `/api` prefix (§8).
- Minor and patch versions **MUST NOT** appear in the path. They're recorded in the specification.
- A breaking change **MUST** increment the major version.

**What counts as breaking:**

- Removing or renaming a field, endpoint or enumerated value.
- Adding a required request field or parameter.
- Narrowing a type, or changing the meaning of an existing field.
- **Adding a required scope to an existing operation.** This breaks every consumer whose token
  doesn't already carry the scope, and it's the case teams most often miss. A change that looks
  like a security improvement is a breaking change to a consumer who has no contract on file.

Additive changes (new optional fields, new endpoints, new optional parameters) aren't breaking,
and consumers **MUST** tolerate them. A consumer that breaks on an unexpected field is defective.

> **Recorded deviation (§19): this conflicts with Zalando rule 115**, which forbids the version in
> the URI in favor of content negotiation. Path versioning is chosen for three reasons: the
> version is visible in logs, in a browser and in a support ticket; it's what most public APIs
> already do; and content negotiation shifts the burden onto every client. NLGov also places the
> major version in the URI.

### 13. Lifecycle

Every API version is in exactly one state:

| State | Meaning |
|---|---|
| **ACTIVE** | Available in production and fully supported. |
| **DEPRECATED** | Available for a fixed period. Fully supported for existing consumers, and closed to new ones. `Deprecation` and `Sunset` headers are set. |
| **DEACTIVATED** | Unpublished and unavailable. The deployed footprint is removed from production, sandbox and lower environments. |

**Deprecation.** A deprecated version **MUST** return the
[`Deprecation`](https://www.rfc-editor.org/rfc/rfc9745.html) header, and **MUST** return
[`Sunset`](https://www.rfc-editor.org/rfc/rfc8594.html) with the date it becomes unavailable.
Deprecated elements **MUST** be marked `deprecated` in the specification.

**Partial deprecation.** A single endpoint, parameter or field **MAY** be deprecated without
deprecating the version. The same headers and specification markers apply.

**Version deprecation.** Deprecating a whole version **MUST** be announced to every known consumer
directly, not only through headers. Headers reach code, not people.

**Notice periods. [Suggested]**

| Change | Minimum notice before deactivation |
|---|---|
| Whole version | **12 months** |
| Single endpoint or field | **6 months** |
| Security-driven change that can't wait | As much as safety allows, with the reason stated |

> **[Suggested]** These numbers are a starting point, chosen to be survivable by a consumer with
> one developer and an annual budget cycle. They're the item in this document most likely to need
> adjusting, and the one consumers will care most about.

**Deactivation** removes the footprint from all environments. **Decomposition**, meaning splitting
an API into several, **MUST** be treated as deprecation of the original, and the documentation
**MUST** explain the split and how to migrate.

### 14. Security

- Authentication **MUST** use OAuth 2.0, with the flow chosen to fit the use.
- Tokens **MUST** be scoped to the least privilege the consumer needs.
- Every operation **MUST** declare its required scopes in the specification.
- Authorization **MUST** be enforced at the API, not in the client. A client-side check is a
  usability feature, not a control.

**Tenant scoping is an authorization rule, not a filter.** Every request **MUST** be evaluated
against the tenant the credential belongs to. An API **MUST NOT** rely on the caller to supply a
tenant identifier correctly. The tenant comes from the credential, so an operation **MUST NOT**
take a tenant identifier as a path, query or header parameter.

> **[Suggested] Enforce scoping in both layers.** Tenant filtering is usually implemented first in
> the API layer, because adding a tenant condition to a query is the quickest route. Where the
> data store supports row-level security (RLS), add it behind the API check rather than instead of
> it. Each layer separates data logically, each has to be coded, and each can have bugs. Together
> they're defense in depth.

**Unattended consumers. [Suggested]** An integration, a scheduled job or another service has no
person to log in, so it authenticates as itself.

- It **MUST** use the OAuth 2.0 client credentials grant
  ([RFC 6749 §4.4](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.4)).
- There **MUST** be one client **per tenant per application**. A credential shared between tenants,
  or between applications, can't be scoped and can't be revoked without breaking the others.
- **The tenant is a claim in the token, issued by the authorization server.** It's never taken
  from the request, and a client can't assert its own.
- Client secrets **MUST** come from a secret store or the environment, never from source or from
  configuration committed to a repository. They **MUST** be rotatable without a code change.
- A client **MAY** prove its identity to the authorization server with a certificate
  ([RFC 8705](https://www.rfc-editor.org/rfc/rfc8705.html)). The token it receives still carries
  the tenant and the scopes, and that token, not the certificate, is what the API checks.
- A cloud workload identity (a cloud IAM role, for example) **MUST NOT** be the sole basis for
  tenant scoping. A role says which workload is calling. It doesn't say which tenant's data the
  workload may reach, unless the authorization server holds that mapping and issues it as a claim.

**Browser applications. [Suggested]** A front end that holds a cookie session through a
backend-for-frontend is acceptable where it fits the use. The cookie **MUST** be `Secure`,
`HttpOnly` and `SameSite`. The access token **MUST NOT** be reachable from script, and every
request that changes state **MUST** be protected against cross-site request forgery. `SameSite`
alone isn't that protection.

**OWASP API Security Top 10, mapped to what it means here:**

| OWASP | What it means here |
|---|---|
| **API1** Broken object level authorization | Tenant scoping. Can a caller reach another tenant's record by changing an identifier? |
| **API3** Broken object property level authorization | Restricted fields. Does the response include a field this role may not see? |
| **API5** Broken function level authorization | Roles. Can a caller invoke an operation their role doesn't permit? |
| **API9** Improper inventory management | Undocumented and forgotten endpoints. Everything deployed is in the specification and the catalog. |

Every pull request that changes an API surface **MUST** answer three questions. Is it
tenant-scoped? Are restricted fields handled? Are the role checks right?

### 15. Privacy and restricted records

Some records carry confidentiality obligations beyond ordinary authorization: their *existence*
is confidential, not just their content. This document calls them **restricted records**. The
rules below are the minimum. Data subject to a legal regime (health, financial or children's data,
for example) needs that regime's own review on top of them.

- An API **MUST NOT** disclose the existence of a restricted record to a caller who isn't
  entitled to know it exists. Where entitlement is absent, respond `404`, not `403`.
- Restricted fields **MUST** be filtered server-side, by role, before serialization. Filtering in
  a client or a view layer isn't enough.
- Personal identifiers (national identity numbers, taxpayer identifiers, birth dates, financial
  account numbers) **MUST** be minimized, and **MUST** be masked or redacted wherever the
  applicable rules require it.
- Records about minors **MUST** be treated as restricted by default.
- Queries backing an API **MUST** read from views (or an equivalent layer) that enforce the
  visibility rules, never from the underlying base tables. This is a design rule, not a
  convention: base tables carry restricted rows and can't safely be exposed.
- Access to restricted material **MUST** be logged with the identity that requested it.

> **[Suggested]** Treat this section as needing review from whoever owns privacy and compliance
> for your data. Ask for their substantive input, not just a sign-off.

### 16. Environments and test data

Three environments **MUST** exist:

| Environment | Purpose |
|---|---|
| **Development** | The provider team's own. |
| **Consumer integration (sandbox)** | Where consumers build and test. Its **behavior MUST match production**: same contract, same validation, same error shapes, same authorization. |
| **Production** | Live. |

- Test data **MUST** be realistic in shape and volume, and **MUST NOT** be real customer data.
- Test data **MUST** include the hard cases: restricted records, users who belong to more than one
  tenant, records with many related parties, and records near every validation boundary.
- A consumer **MUST NOT** need production credentials to develop against the API.

A sandbox that behaves differently from production is worse than no sandbox. It produces consumers
that pass their tests and fail on release.

### 17. Performance, availability and SLOs

Every API **MUST** publish service level objectives and **MUST** measure against them.

| Metric | Objective |
|---|---|
| **Availability (production)** | 99.9% over a rolling 30-day window, with no exclusion for planned downtime or holidays |
| **Availability (test environments)** | 99.0% over a rolling 30-day window, same basis |
| **Latency (production)** | Over a rolling 30-day window: 50% of requests under 500 ms, 90% under 1000 ms, 99% under 5000 ms |
| **5xx error rate** | 0.5% or less over a rolling 30-day window |

- Measurement **MUST** use a rolling window, not a calendar month. A calendar window lets a bad week
  disappear at month end.
- Latency **MUST** be reported as percentiles, never as an average. An average hides exactly the
  requests that make people complain.
- Every API **MUST** expose a health check endpoint.
- **Rate limits MUST be published**, and a throttled request **MUST** return `429` with a
  `Retry-After` header. A consumer discovers an unpublished rate limit in production.

> **[Suggested]** These figures are a starting point. The one worth arguing about is the
> 99%-under-5000 ms latency objective, because five seconds is a long time for an interactive
> screen.

### 18. Production management and consumer support

- Breaking changes **MUST** follow §12 and §13. Everything else **SHOULD** ship as often as the
  team can ship it safely.
- Documentation **MUST** be updated in the same change as the code. A specification updated later
  was wrong in the meantime.
- Every release **MUST** have release notes, written for consumers rather than for the team.
- Every API **MUST** have a support channel and a named contact, and **MUST** state how quickly it
  responds.
- Consumers **SHOULD** be told about a deprecation directly, not left to discover it in a header.

---

## Part III — Governance

### 19. Ownership, deviations and the decisions register

- **This document has maintainers.** Changes go through them, as pull requests against this
  repository.
- A team departing from a **SHOULD** **MUST** record the reason. A team that needs to depart from
  a **MUST** raises it with the maintainers. If the departure is granted, it becomes an entry in the
  register below, not a local exception. In a specification, a departure from a lint rule is
  recorded as a Spectral `overrides` entry carrying the reason (Appendix B).
- **Every referenced standard MUST be re-checked annually.** Is it still maintained? Has the rule
  we cite changed? Is there a better reference now?

That last rule isn't bureaucracy. Public API standards go unmaintained when the organization that
kept them moves on. Some are frozen, and some no longer resolve at all, and in each case nobody
owned the job of checking. A standard without a named maintainer has a shelf life measured in
staff turnover.

**Every API MUST be registered in a catalog**, with its owner, status, specification link and
support contact. An endpoint that's deployed but not in the catalog is an OWASP API9 finding
(§14), not an oversight.

**Decisions register:** deliberate departures from a referenced public standard, and the reasons
for them.

| Decision | Departs from | Reason |
|---|---|---|
| Major version in the URI path | Zalando rule 115 (content negotiation) | Visible in logs, browsers and support tickets; it's common practice in public APIs; NLGov does the same. §12 |
| RFC 9457 `problem+json` | RFC 7807 (obsoleted) | 9457 supersedes 7807. There's no practical difference in the payload. §10 |
| camelCase property names | Zalando rule 118 (snake_case) | Native style for JavaScript and TypeScript consumers; matches the Google JSON Style Guide and Microsoft REST API Guidelines. §9 |
| camelCase query keys | Zalando rule 130 (snake_case) | One convention for properties and query keys, and NLGov `/core/query-keys-camel-case` requires it. §8 |
| Retry safety required for unattended creates | Zalando rules 229 and 230 (consider it; MAY) | Unattended clients will retry, and a duplicate record costs more than a key. This is stronger than Zalando, not contrary to it. §8 |
| `X-Correlation-Id`, not `X-Flow-ID` | Zalando rule 233 | Same purpose and rules. `X-Correlation-Id` is the more widely recognized name outside Zalando. §8 |
| Verb segments for computations that change nothing | Zalando rules 138 and 141 (verb-free URLs) | A narrow exception only: no state change, the input needs a body, the same input gives the same answer, and the operation is marked `x-computation: true`. Every state-changing action is still a resource. NLGov `/core/resource-operations` permits operations. §8 |
| OpenAPI 3.1.2, not 3.2 | Latest published OpenAPI | Linter support for 3.2 isn't in a release yet. Revisit when it lands, since 3.2 is backward-compatible. §5 |

---

## Appendix A — Referenced standards

| Standard | Cited for | Licence | Maintenance |
|---|---|---|---|
| [OpenAPI 3.1.2](https://spec.openapis.org/oas/v3.1.2.html) | Contract format | Apache-2.0 | Active |
| [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/) | Design rules, by number | CC-BY-4.0 | Active, and the most comprehensive maintained rulebook of the set |
| [OWASP API Security Top 10](https://owasp.org/API-Security/) | Security review | CC-BY-SA-4.0 | Active. Cite it; don't adapt it, since the share-alike term makes adaptation awkward |
| [Pact](https://docs.pact.io/) | Consumer-driven contracts | MIT | Active |
| [NLGov API Design Rules](https://github.com/Logius-standaarden/API-Design-Rules) | Specific rules, and the precedent of a standard with a published linter | CC-BY-4.0 | Active, with versioned releases |
| [Spectral](https://github.com/stoplightio/spectral) | The linter the ruleset runs on | Apache-2.0 | Active |
| [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html), [3339](https://www.rfc-editor.org/rfc/rfc3339.html), [3986](https://www.rfc-editor.org/rfc/rfc3986.html), [6749](https://www.rfc-editor.org/rfc/rfc6749.html), [8594](https://www.rfc-editor.org/rfc/rfc8594.html), [8705](https://www.rfc-editor.org/rfc/rfc8705.html), [9110](https://www.rfc-editor.org/rfc/rfc9110.html), [9457](https://www.rfc-editor.org/rfc/rfc9457.html), [9745](https://www.rfc-editor.org/rfc/rfc9745.html) | Keywords, dates, URIs, OAuth 2.0, Sunset, mutual-TLS client auth, HTTP semantics, problem details, Deprecation | IETF | Standards track |

---

## Appendix B — Enforcement and tooling

**This appendix is offered, not mandated.** Part II is the requirement, and this is how teams can
satisfy it cheaply. A team meeting the standard another way is meeting the standard.

**Contract linting.** [Spectral](https://github.com/stoplightio/spectral) checks an OpenAPI
document against rules in CI and in the editor, so nobody has to memorize the rules in Part II.
This repository ships the ruleset:

```yaml
# .spectral.yaml in your API's repository
extends:
  - https://raw.githubusercontent.com/randallard/api-standards/v0.1.0/spectral/api-standards.yaml
```

Pin it to a tag, as shown, rather than to `main`. A ruleset that changes underneath a pipeline
breaks builds nobody touched. The ruleset extends `spectral:oas` (OpenAPI validity) and adds:

| Rule | Severity | Enforces |
|---|---|---|
| `as-openapi-3-1-2` | error | §5: `openapi: 3.1.2` |
| `as-path-versioned` | error | §8, §12: path begins `/v{major}/` |
| `as-path-no-api-prefix` | error | §8: no `/api` segment |
| `as-path-no-minor-version` | error | §12: no `/v1.2/` |
| `as-path-kebab-case` | error | §8: lowercase kebab-case segments |
| `as-path-plural-resource` | warn | §8: the first resource segment is plural (a heuristic) |
| `as-path-no-action-verbs` | error | §8: no verb segments such as `/deactivate` |
| `as-computation-marked` | error | §8: a computation verb segment is POST-only and `x-computation: true` |
| `as-parameter-camel-case` | error | §8, §9: query and path parameter names |
| `as-property-camel-case` | error | §9: schema property names |
| `as-no-tenant-parameter` | error | §14: no `tenantId`-style parameters |
| `as-no-offset-pagination` | error | §11: no `offset`, `page` or `pageSize` parameters |
| `as-no-total-count` | error | §11: no `total`, `totalCount` and similar properties |
| `as-problem-json` | error | §10: 4xx and 5xx responses use `application/problem+json` |
| `as-no-xml` | error | §7: no XML media types |
| `as-upload-limits` | error | §7: file uploads declare `413` and `415` |
| `as-operation-scopes` | error | §14: every operation declares security with scopes |
| `as-oauth2-only` | error | §14: security schemes are OAuth 2.0 or OpenID Connect |
| `as-enum-described` | error | §9: enumerations have a description |
| `as-deprecation-headers` | error | §13: deprecated operations declare `Deprecation` and `Sunset` |
| `as-429-retry-after` | error | §17: a `429` response declares `Retry-After` |
| `as-datetime-format` | warn | §9: `...Date` properties use `format: date-time` or `date` |

Rules that can't be checked from a contract (tenant scoping in queries, restricted-field
filtering, cursor binding) are enforced by review and by the negative tests in Appendix C.

**Recording a departure.** A deviation granted under §19 goes in the API's own `.spectral.yaml` as
an `overrides` entry, with the reason in a comment. That way the exception is visible in review,
not buried in a disabled rule:

```yaml
overrides:
  - files: ["openapi.yaml#/paths/~1v1~1legacy-feed/get/responses/200/content"]
    rules:
      as-no-xml: off   # §7 legacy exception: the downstream system only accepts XML. Granted 2026-11-02.
```

**Also worth adding:** the [OWASP Spectral ruleset](https://github.com/stoplightio/spectral-owasp-ruleset),
pinned (it hasn't had a release since 2024), and `spectral-documentation` for documentation
completeness. They aren't extended by default, so the core ruleset stays dependency-free.

**Alongside, not instead of:** static analysis (SAST) and dependency scanning (SCA) check code and
dependencies. Spectral checks the contract. They do different jobs.

**Contract testing.** Pact verifies that a provider still satisfies its consumers, and runs in CI
on every change. A consumer contract expresses *need*, not *shape*: the provider owns the shape.
That distinction keeps consumer-driven contracts from turning into a custom endpoint per request.

**Considered and not chosen:** TypeSpec, which generates OpenAPI from a purpose-built language.
It's good, but it adds a source of truth above the specification, and the direction here is a
specification everyone can read.

> **None of this enforces anything without a pipeline.** Lint rules, contract verification and
> scanning are only documents until something runs them on every change. Adding specification
> linting to the build is cheap while there's nothing to retrofit, and expensive later.

---

## Appendix C — Worked example

**The situation.** A tenant runs an integration that pulls documents from its old system. It needs
to deliver each document to a document storage API, with a classification, using its own
credentials, with no person logged in. This is a tenant-scoped **write** by a **machine**
consumer.

### Step 1 — Write the contract before the code (§5)

The operation is a resource creation, so it's a `POST` on a plural noun (§8), under a path with
the major version in it (§12). The tenant is **not** a parameter (§14), and the classification is a
field in the body rather than a path segment, so it doesn't end up in access logs (§15).

The complete, lint-clean specification is
[`examples/document-storage.yaml`](examples/document-storage.yaml). The operation at its center:

```yaml
paths:
  /v1/documents:
    post:
      operationId: createDocument
      summary: Deliver a document to the caller's own tenant
      security:
        - oauth: [documents:write]
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [file, classification]
              properties:
                file:
                  type: string
                  contentMediaType: application/pdf
                classification:
                  $ref: '#/components/schemas/Classification'
                sourceId:
                  type: string
                  description: >
                    The document's identifier in the sending system. Unique within the
                    caller's tenant. A repeat returns 409 with the original Location (§8).
      responses:
        '201':
          description: Created
          headers:
            Location: { $ref: '#/components/headers/Location' }
        '400': { $ref: '#/components/responses/Problem' }
        '401': { $ref: '#/components/responses/Problem' }
        '403': { $ref: '#/components/responses/Problem' }
        '409': { $ref: '#/components/responses/Problem' }
        '413': { $ref: '#/components/responses/Problem' }
        '415': { $ref: '#/components/responses/Problem' }
        '429': { $ref: '#/components/responses/TooManyRequests' }
```

The contract has no `tenantId`. A document is created in the tenant the credential belongs to, or
not at all. `Classification` is an enumerated value, so §9 requires its values and meanings to be
documented, and which values mean *restricted* is the contract's most important content.

### Step 2 — Tenant scoping comes from the credential (§14)

The integration authenticates as a machine client that carries a tenant claim. The API reads the
tenant from that claim, never from the request. A `tenantId` sent in the body isn't accepted,
because a field the caller can set is a field the caller can get wrong or abuse.

### Step 3 — The three review questions (§14)

| Question | Answer for this operation |
|---|---|
| Is it tenant-scoped? | Yes. The tenant comes from the credential, and the request carries no tenant identifier. |
| Are restricted fields handled? | Classification is an input here. Reads of the created document filter by role (§15). A caller who isn't entitled to know a restricted document exists gets `404` on read, not `403`. |
| Are the role checks right? | Creation needs `documents:write`. A caller without it gets `403`, which is safe on a write because it reveals nothing about any record. |

### Step 4 — Lint and verify (Appendix B)

- **Lint.** The pipeline checks the specification against the ruleset. A singular path, an
  unversioned path or a non-`problem+json` error fails the build before review.
- **Contract test.** The integration is the consumer. Its contract states what it needs: a valid
  PDF with a valid classification returns `201` and a `Location`. The provider verifies against
  that contract on every change.
- **The negative tests that matter most.** Tenant A's credential can't read, list or overwrite
  tenant B's documents, and each attempt returns `404`. A restricted document isn't visible to a
  role that may not see it, and can't be told apart from a document that doesn't exist.

---

## Appendix D — Evidence for designing access in from the start

Supporting material for §4, split into published guidance that says to do it and measured
evidence about whether it pays. Links checked 2026-09-17.

### Guidance

| Source | What it says |
|---|---|
| [Zalando RESTful API Guidelines, "API First"](https://opensource.zalando.com/restful-api-guidelines/#api-first) | A named principle: *"define APIs first, before coding its implementation, using a standard specification language,"* to get *"early review feedback from peers and client developers"* and a *"clear separation of WHAT vs. HOW concerns."* That separation is the one this document is built on (§1). |
| [GOV.UK API technical and data standards](https://www.gov.uk/guidance/gds-api-technical-and-data-standards) | *"API first is the practice of designing software starting with an API, before designing your web or mobile user interface."* It names the benefits as reuse by other services, internal stress-testing, modularity, and fitness for purpose. |
| [NLGov API Design Rules](https://github.com/Logius-standaarden/API-Design-Rules) | Requires a published OpenAPI document, enforced by an official linter. That's evidence that "write the contract first, check it automatically" works at scale, not just in theory. |

### Measured: what the numbers actually support

| Source | Finding | How far it can be pushed |
|---|---|---|
| [Postman, State of the API 2025](https://www.postman.com/state-of-api/2025/) (5,700+ respondents) | 82% of organizations have adopted some level of API-first, and 25% are fully API-first. On revenue, there's a clean comparison across maturity tiers: **43%** of fully API-first organizations earn more than 25% of their revenue from APIs, against **23%** of somewhat-API-first and **16%** of non-API-first organizations | The revenue comparison is a genuine tiered contrast, but it shows correlation, not the result of a controlled trial |
| Postman, State of the API 2024 | 74% API-first, up from 66% in 2023. 63% of developers could produce an API within a week, up from 47% the year before | ⚠️ **Don't quote the 63%/47% figure as an API-first result.** It compares years across all respondents, not API-first against not |
| Boehm & Basili, *Software Defect Reduction Top 10 List*, IEEE Computer, January 2001 | Peer-reviewed: fixing a problem after delivery is often far more expensive than fixing it during requirements and design | The **direction** is well supported, and it's the claim §4 relies on |
| [Menzies et al., *Are Delayed Issues Harder to Resolve?*](https://arxiv.org/pdf/1609.04886) | Re-examines the delayed-issue effect on real project data and doesn't find the dramatic escalation the folklore claims | Cite this alongside Boehm. It's the honest counter-evidence |
| Bossavit, *The Leprechauns of Software Engineering* | Traces the familiar 1x/6.5x/15x/100x "cost of a late defect" table back to internal course notes with no published dataset behind them | **Don't use the 100x multiplier or that table.** It won't survive a knowledgeable reader |

> **How to argue this.** The defensible claim is directional: late change costs more than early
> change, and every published standard in this space says to design the interface first. The
> indefensible claim is any specific multiplier. §4 is written to the first claim and avoids the
> second.

---

## Appendix E — Document history

Each published version gets one row. A change to a rule is listed here, and a departure from a
referenced standard is also recorded in §19.

| Version | Date | Summary |
|---|---|---|
| 0.1 | 2026-10-24 | First public draft, with the Spectral ruleset |

---

*Suggestions on any part of this document are welcome, and the **[Suggested]** items are expected
to change. Open an issue or a pull request.*
