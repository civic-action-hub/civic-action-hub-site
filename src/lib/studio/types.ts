// Core domain model for the CCC Policy & Service Definition Studio.
//
// The top-level `ServiceDefinitionModel` intentionally contains exactly the ten
// keys named in the brief so it can be serialised to / from a governed policy
// JSON document:
//   policyPackage, sources, definitions, rules, dataRequirements, questionSets,
//   documentRequirements, validations, testCases, release
//
// Nothing here depends on React or the browser — it is pure data so the same
// model can be produced by a real extraction API later.

export type ReviewStatus = "draft" | "needs-review" | "approved" | "rejected";
export type Confidence = "high" | "medium" | "low";

export type SourceClassification =
  | "legislation"
  | "national-regulation"
  | "district-plan"
  | "council-policy"
  | "guidance"
  | "form"
  | "checklist"
  | "operational-rule";

export type SourceStatus = "uploaded" | "queued" | "analysed";

export interface SourceDocument {
  id: string;
  title: string;
  fileName: string;
  classification: SourceClassification;
  version: string;
  publishedDate: string; // ISO date
  effectiveDate: string; // ISO date
  owner: string;
  jurisdiction: string;
  sizeKb: number;
  pages: number;
  status: SourceStatus;
  summary: string;
}

export interface SourceCitation {
  id: string;
  sourceId: string;
  section: string; // e.g. "s40" or "Schedule 1, cl. 2"
  page?: number;
  quote: string; // excerpt from the source
}

/**
 * A configurable, source-backed threshold. The brief requires that regulatory
 * thresholds are never hard-coded as authoritative facts — they live here as
 * data, always carry a citation, and are flagged as illustrative until an
 * administrator confirms them against the current source.
 */
export interface ThresholdParam {
  key: string; // referenced from predicates as { threshold: key }
  label: string;
  value: number | string;
  unit?: string;
  sourceCitationId: string;
  confirmed: boolean; // false => shown as "illustrative – confirm against source"
  note?: string;
}

export type ComparisonOp =
  | ">"
  | ">="
  | "<"
  | "<="
  | "=="
  | "!="
  | "in"
  | "not-in"
  | "contains"
  | "not-contains"
  | "is-true"
  | "is-false";

/** A value a scenario fact can hold (arrays support e.g. "documents provided"). */
export type FactValue = string | number | boolean | string[];

export type Predicate =
  | { all: Predicate[] }
  | { any: Predicate[] }
  | { not: Predicate }
  | {
      fact: string; // a data-requirement key, e.g. "project.estimatedValue"
      op: ComparisonOp;
      value?: string | number | boolean | Array<string | number>;
      threshold?: string; // resolve value from a ThresholdParam.key instead
    };

export interface RuleCondition {
  plain: string; // plain-language rendering shown to administrators
  predicate: Predicate; // machine-evaluable form used by the engine
}

export type RuleActionType =
  | "require-consent"
  | "exempt"
  | "require-document"
  | "flag-review"
  | "activate-questions"
  | "set-pathway"
  | "route";

export interface RuleAction {
  type: RuleActionType;
  summary: string; // resulting action, plain language
  // Optional structured targets used by the engine / graph:
  activatesQuestionSetIds?: string[];
  requiresDocumentIds?: string[];
  pathway?: string;
}

export interface Rule {
  id: string;
  name: string; // plain-language name
  description: string;
  condition: RuleCondition;
  requiredInputs: string[]; // DataRequirement ids
  action: RuleAction;
  thresholds: ThresholdParam[];
  sourceCitationIds: string[];
  confidence: Confidence;
  reviewStatus: ReviewStatus;
  effectiveDate: string; // ISO date
  version: string;
  ambiguityIds?: string[];
  lastChangeNote?: string;
}

export type DataType =
  | "text"
  | "number"
  | "currency"
  | "boolean"
  | "enum"
  | "address"
  | "date";

export interface DataRequirement {
  id: string;
  key: string; // machine key used by predicates & facts, e.g. "project.type"
  label: string;
  type: DataType;
  options?: string[];
  unit?: string;
  required: boolean;
  serviceCaseField?: string; // mapping into a downstream Service Case
  sourceCitationIds: string[];
  reviewStatus: ReviewStatus;
}

export interface Question {
  id: string;
  dataRequirementId: string;
  wording: string; // citizen-friendly question text
  helpText?: string;
}

export interface QuestionSet {
  id: string;
  name: string;
  purpose: string;
  showWhen?: RuleCondition; // conditional activation
  questions: Question[];
  reviewStatus: ReviewStatus;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
  requiredWhen?: RuleCondition;
  acceptedFormats: string[];
  sourceCitationIds: string[];
  reviewStatus: ReviewStatus;
}

export type ValidationSeverity = "error" | "warning";

export interface Validation {
  id: string;
  name: string;
  appliesTo: string; // data-requirement key or document id
  plain: string;
  predicate: Predicate; // passes when predicate is TRUE; failure otherwise
  severity: ValidationSeverity;
  message: string; // shown when validation fails
  sourceCitationIds: string[];
  reviewStatus: ReviewStatus;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  facts: Record<string, FactValue>;
  expectedOutcome: string;
}

export type AmbiguitySeverity = "high" | "medium" | "low";

export interface Ambiguity {
  id: string;
  title: string;
  detail: string;
  relatedRuleIds: string[];
  sourceCitationIds: string[];
  severity: AmbiguitySeverity;
  status: "open" | "resolved";
  recommendation: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  sourceCitationIds: string[];
}

export interface PolicyMetadata {
  domain: string;
  owner: string;
  ownerRole: string;
  jurisdiction: string;
  regulatoryBasis: string[];
  lastReviewed: string; // ISO date
  nextReviewDue: string; // ISO date
}

/**
 * The `definitions` block groups the descriptive, cross-cutting outputs of the
 * extraction: policy metadata, a glossary, the citation register, and the
 * ambiguities that require administrator review.
 */
export interface Definitions {
  metadata: PolicyMetadata;
  glossary: GlossaryTerm[];
  citations: SourceCitation[];
  ambiguities: Ambiguity[];
}

export type PackageStatus =
  | "draft"
  | "in-analysis"
  | "in-review"
  | "approved"
  | "published";

export interface PolicyPackage {
  id: string;
  name: string;
  reference: string; // e.g. "CCC-BC-RES-001"
  status: PackageStatus;
  version: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export type ReleaseStatus = "draft" | "in-review" | "approved" | "published";

export type TargetChannel =
  | "website-agent"
  | "application-data-collection"
  | "application-pre-vetting"
  | "service-case-creation";

export interface Release {
  version: string;
  status: ReleaseStatus;
  approver?: string;
  approverRole?: string;
  effectiveDate?: string;
  releaseNotes: string;
  targetChannels: TargetChannel[];
  publishedAt?: string;
}

export interface ServiceDefinitionModel {
  policyPackage: PolicyPackage;
  sources: SourceDocument[];
  definitions: Definitions;
  rules: Rule[];
  dataRequirements: DataRequirement[];
  questionSets: QuestionSet[];
  documentRequirements: DocumentRequirement[];
  validations: Validation[];
  testCases: TestCase[];
  release: Release;
}

// ---- Engine result types -------------------------------------------------

export interface RuleEvaluation {
  ruleId: string;
  ruleName: string;
  fired: boolean;
  reason: string; // why it did / didn't fire, in plain language
  actionSummary?: string;
  sourceCitationIds: string[];
}

export interface ValidationFailure {
  validationId: string;
  name: string;
  severity: ValidationSeverity;
  message: string;
  sourceCitationIds: string[];
}

export type ScenarioOutcome =
  | "consent-required"
  | "exempt"
  | "more-information-required"
  | "refer-to-officer";

export interface ScenarioResult {
  rulesEvaluated: RuleEvaluation[];
  activatedQuestionSetIds: string[];
  requiredDocumentIds: string[];
  validationFailures: ValidationFailure[];
  outcome: ScenarioOutcome;
  outcomeSummary: string;
  explanation: Array<{ text: string; sourceCitationIds: string[] }>;
  passed: boolean; // matches the test case's expectation (set by caller)
}
