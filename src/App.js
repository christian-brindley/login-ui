import { useEffect, useState } from "react";
import { Config, FRAuth } from "@forgerock/javascript-sdk";

import LoginEmail from "./stages/login/LoginEmail";
import LoginPassword from "./stages/login/LoginPassword";
import LoginEmailOTP from "./stages/login/LoginEmailOTP";

const StageHandlers = { LoginEmail, LoginPassword, LoginEmailOTP };
const FATAL = "Fatal";

const DEFAULT_WELLKNOWN =
  "https://openam-demo.forgeblocks.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration";

export default function App() {
  const [activeStageName, setActiveStageName] = useState(null);
  const [step, setStep] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [wellknownUrl, setWellknownUrl] = useState(
    () => localStorage.getItem("wellknownUrl") || DEFAULT_WELLKNOWN
  );

  // Initialize ForgeRock whenever well-known URL changes
  useEffect(() => {
    async function initConfigAndStart() {
      try {
        await Config.setAsync({
          serverConfig: { wellknown: wellknownUrl },
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
