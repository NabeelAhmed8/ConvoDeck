export interface IEmbeddedSignupPayload {
  code?: string;
  phoneNumberId?: string;
  wabaId?: string;
}

export interface IEmbeddedSignupActionResult {
  success: boolean;
  phoneNumber?: string;
  error?: string;
}
