export interface IEmbeddedSignupEventData {
  phone_number_id?: string;
  waba_id?: string;
  current_step?: string;
}

export interface IEmbeddedSignupMessageEvent {
  type: string;
  event: "FINISH" | "CANCEL" | "ERROR";
  data?: IEmbeddedSignupEventData;
  error_message?: string;
}

export interface IFacebookAuthResponse {
  accessToken?: string;
  code?: string;
  expiresIn?: number;
  signedRequest?: string;
  userID?: string;
  status?: "connected" | "not_authorized" | "unknown";
}

export interface IFacebookLoginResponse {
  authResponse?: IFacebookAuthResponse;
  status: "connected" | "not_authorized" | "unknown";
}

export interface IEmbeddedSignupPayload {
  code?: string;
  accessToken?: string;
  phoneNumberId?: string;
  wabaId?: string;
  displayPhoneNumber?: string;
}

export interface IEmbeddedSignupActionResult {
  success: boolean;
  phoneNumber?: string;
  error?: string;
}
