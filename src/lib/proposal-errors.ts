/**
 * Typed proposal errors with stable codes.
 * Use these instead of throwing raw Error with Portuguese messages for machine-readable error handling.
 */

export type ProposalErrorCode =
  | "NO_SERVICES"
  | "SERVICES_UNAVAILABLE"
  | "LEAD_INCOMPLETE"
  | "MISSING_PAYLOAD"
  | "INVALID_PAYLOAD"
  | "PROPOSAL_NOT_FOUND"
  | "INVALID_STATUS_FOR_PUBLISH"
  | "INVALID_STATUS_FOR_CANCEL"
  | "INVALID_STATUS_FOR_ACCEPT"
  | "INVALID_STATUS_FOR_REJECT"
  | "TOKEN_NOT_FOUND"
  | "TOKEN_EXPIRED"
  | "CHECKLIST_NOT_AVAILABLE"
  | "CHECKLIST_ITEM_NOT_FOUND"
  | "PROPOSAL_ID_REQUIRED";

export class ProposalError extends Error {
  readonly code: ProposalErrorCode;

  constructor(code: ProposalErrorCode, message: string) {
    super(message);
    this.name = "ProposalError";
    this.code = code;
  }
}

export function isProposalError(error: unknown): error is ProposalError {
  return error instanceof ProposalError;
}

export function getProposalErrorCode(error: unknown): ProposalErrorCode | null {
  if (isProposalError(error)) {
    return error.code;
  }
  return null;
}
