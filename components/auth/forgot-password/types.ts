export type ForgotPasswordStep = "request" | "verify" | "reset" | "success";
export type ResetMethod = "email" | "phone";

export interface ForgotPasswordFlowState {
  step: ForgotPasswordStep;
  method: ResetMethod;
  identifier: string;
  code: string;
  previewUrl?: string | null;
  devCode?: string | null;
}

