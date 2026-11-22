"use client";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (params: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: {
            code?: string;
            accessToken?: string;
          };
        }) => void,
        options?: Record<string, unknown>
      ) => void;
    };
  }
}

let sdkPromise: Promise<typeof window.FB> | null = null;

export function loadFacebookSdk(appId: string): Promise<typeof window.FB> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Facebook SDK cannot load on server"));
  }

  if (window.FB) {
    return Promise.resolve(window.FB);
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: true,
          version: "v21.0",
        });
        resolve(window.FB);
      } else {
        reject(new Error("Facebook SDK failed to initialize"));
      }
    };

    const id = "facebook-jssdk";
    if (document.getElementById(id)) return;

    const js = document.createElement("script");
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    js.async = true;
    js.defer = true;
    js.onerror = () => reject(new Error("Failed to load Facebook SDK script"));

    document.body.appendChild(js);
  });

  return sdkPromise;
}
