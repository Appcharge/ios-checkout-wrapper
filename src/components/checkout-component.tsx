import { AppchargeCheckout } from "appcharge-checkout-reactjs-sdk";
import { useEffect, useState } from "react";

interface Session {
  url: string;
  sessionToken: string;
  cot: string;
  sdkV: string;
  identifier: string;
}

interface Params {
  [key: string]: any;
}

export default function CheckoutComponent() {
  const searchParams = new URLSearchParams(window.location.search.split('?')[1]);

  const session: Session = {
    sessionToken: searchParams.get("sessionToken") || "",
    url: searchParams.get("url") || '',
    cot: searchParams.get("cot") || '',
    identifier: searchParams.get("identifier") || '',
    sdkV: searchParams.get("sdkV") || '',
  }

  const sourceVersion = `native-ios-${session.sdkV || ''}`;

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

    const uri = `acnative-${session.identifier}://action?data=${btoa(JSON.stringify(data))}`;
    window.location.href = uri;
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
        checkoutToken={session.cot}
        checkoutStyle={{
          overlayBackgroundColor: "black"
        }}
      />
    </div>
  );
}