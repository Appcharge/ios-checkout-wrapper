import { AppchargeCheckout } from "appcharge-checkout-reactjs-sdk";
import { useEffect, useState } from "react";

interface Session {
  sessionToken: string;
  url: string;
  sdkV: string;
  checkoutToken: string;
  identifier: string;
  playerId: string;
  severity: string;
  logEndpoint: string;
  ppt: string;
  comType: string;
  redirect: string;
}

interface Params {
  [key: string]: any;
}

declare global {
  interface Window { unityVersion: any; }
}

export default function CheckoutComponent() {
  const searchParams = new URLSearchParams(window.location.search.split('?')[1]);

  const session: Session = {
    sessionToken: searchParams.get("sessionToken") || "",
    url: searchParams.get("url") || '',
    checkoutToken: searchParams.get("checkoutToken") || '',
    ppt: searchParams.get("ppt") || '',
    identifier: searchParams.get("identifier") || '',
    playerId: searchParams.get("playerId") || '',
    severity: searchParams.get("severity") || '',
    sdkV: searchParams.get("sdkV") || '',
    logEndpoint: searchParams.get("logEndpoint") || '',
    comType: searchParams.get("comType") || '',
    redirect: searchParams.get("redirect") || ''
  }

  if (session.redirect == "false") {
    session.checkoutToken += '&redirect=false'
  }

  const body = document.querySelector('body')
  if (body) {
    if (session.comType != 'webgl') {
      body.classList.add('black')
    }
  }

  const sourceVersion = `native-${session.sdkV || ''}`;
  window.unityVersion = sourceVersion;

  const [focusResponse, setFocusResponse] = useState<{ params: Params, event: string } | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Window is focused via Visibility API!");
        if (focusResponse) {
          triggerMessage(focusResponse.event, focusResponse.params);
        }
      }
    };
  
    document.addEventListener("visibilitychange", handleVisibilityChange);
  
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [focusResponse]);

  function intentSuccess(_params: any) {}

  function intentFail(_params: any) {}

  function orderSuccess(params: Params) {
    setFocusResponse({ params, event: 'orderSuccess' });
    triggerMessage('orderSuccess', params);
  }

  function orderFail(params: any) {
    setFocusResponse({ params, event: 'orderFail' });
    triggerMessage('orderFail', params);
  }

  function close() {
    triggerMessage('close', {});
  }

  function triggerMessage(event: string, params: any) {
    const data = {
      event,
      data: params
    }

    if (session.comType === "webgl") {
      window.parent?.postMessage(JSON.stringify(data), "*");
    } else {
      const uri = `acnative-${session.identifier}://action?data=${btoa(JSON.stringify(data))}`;
      window.location.href = uri;
    }
  }

  return (
    <div>
      <AppchargeCheckout
        checkoutUrl={session.url}
        sessionToken={session.sessionToken}
        referrerUrl={window.location.protocol + "//" + window.location.host}
        onClose={close}
        onOrderCompletedFailed={orderFail}
        onOrderCompletedSuccessfully={orderSuccess}
        onPaymentIntentSuccess={intentSuccess}
        onPaymentIntentFailed={intentFail}
        sourceVersion={sourceVersion}
        checkoutStyle={{
          overlayBackgroundColor: session.comType === "webgl" ? "rgba(0,0,0,0.8)" : "black"
        }}
        checkoutToken={session.checkoutToken === '' ? session.ppt : session.checkoutToken}
      />
    </div>
  );
}