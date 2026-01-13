import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Config, FRAuth } from "@forgerock/javascript-sdk";

import LoginEmail from "./stages/login/LoginEmail";
import LoginPassword from "./stages/login/LoginPassword";
import LoginEmailOTP from "./stages/login/LoginEmailOTP";

const StageHandlers = { LoginEmail, LoginPassword, LoginEmailOTP };
const FATAL = "Fatal";

const DEFAULT_WELLKNOWN =
  "https://openam-brindley.forgeblocks.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration";

export default function App() {
  const [activeStageName, setActiveStageName] = useState(null);
  const [step, setStep] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [wellknownUrl, setWellknownUrl] = useState(
    () => localStorage.getItem("wellknownUrl") || DEFAULT_WELLKNOWN
  );

  const url = new URL(document.location);
  const urlParams = url.searchParams;

  function getRootTransactionId() {
    return uuidv4();
  }

  const rootTransactionId = getRootTransactionId();
  let authRequestNumber = 0;

  // Initialize ForgeRock whenever well-known URL changes
  useEffect(() => {
    async function initConfigAndStart() {
      try {
        await Config.setAsync({
          serverConfig: { wellknown: wellknownUrl },
          middleware: [
            (req, action, next) => {
              if (req.init.headers) {
                // increment the request number
                authRequestNumber++;
                console.log("req", JSON.stringify(req));
                // Set a transaction ID that should identify this request of this auth session of this tree in logs

                req.init.headers.append(
                  "x-forgerock-transactionid",
                  `${rootTransactionId}-request-${authRequestNumber}`
                );
                req.url.search = urlParams;
              }
            },
          ],
        });
        startJourney();
      } catch (err) {
        handleFatalError(err);
      }
    }
    initConfigAndStart();
  }, [wellknownUrl]);

  async function startJourney() {
    try {
      const firstStep = await FRAuth.next();
      handleStep(firstStep);
    } catch (err) {
      handleFatalError(err);
    }
  }

  function handleStep(nextStep) {
    setStep(nextStep);
    if (nextStep.type === "LoginSuccess") {
      const successUrl = nextStep.payload.successUrl;
      //alert(successUrl);
      window.location.replace(successUrl);
      setActiveStageName("LoginSuccess");
      return;
    }

    setActiveStageName(nextStep.getStage());
  }

  async function handleNext() {
    try {
      const next = await FRAuth.next(step);
      handleStep(next);
    } catch (err) {
      handleFatalError(err);
    }
  }

  function handleFatalError(err) {
    console.error("Fatal error", err);
    setActiveStageName(FATAL);
  }

  function saveSettings() {
    localStorage.setItem("wellknownUrl", wellknownUrl);
    setShowSettings(false);
  }

  const ActiveStage = StageHandlers[activeStageName];

  return (
    <div className="App">
      {/* Settings icon */}
      <button
        className="settings-button"
        aria-label="Settings"
        onClick={() => setShowSettings(true)}
      >
        settings
      </button>

      {/* Settings dialog */}
      {showSettings && (
        <div className="settings-backdrop">
          <div className="settings-dialog">
            <h3>Settings</h3>
            <label>
              Well-Known URL
              <input
                type="text"
                value={wellknownUrl}
                onChange={(e) => setWellknownUrl(e.target.value)}
              />
            </label>

            <div className="settings-actions">
              <button onClick={() => setShowSettings(false)}>Cancel</button>
              <button onClick={saveSettings}>Save & Restart</button>
            </div>
          </div>
        </div>
      )}

      <div className="panel">
        {ActiveStage ? (
          <ActiveStage step={step} onNext={handleNext} />
        ) : (
          <div>Loading…</div>
        )}
      </div>
    </div>
  );
}
