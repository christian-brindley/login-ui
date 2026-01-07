import { useEffect, useState } from "react";
import { Config, FRAuth } from "@forgerock/javascript-sdk";

import LoginEmail from "./stages/login/LoginEmail";
import LoginPassword from "./stages/login/LoginPassword";
import LoginEmailOTP from "./stages/login/LoginEmailOTP";

const StageHandlers = { LoginEmail, LoginPassword, LoginEmailOTP };
const FATAL = "Fatal";

const wellknownUrl =
  "https://openam-brindley.forgeblocks.com/am/oauth2/realms/root/realms/alpha/.well-known/openid-configuration";

export default function App() {
  const [activeStageName, setActiveStageName] = useState(null);
  const [step, setStep] = useState(null); // ForgeRock step object

  useEffect(() => {
    async function initConfigAndStart() {
      await Config.setAsync({
        serverConfig: { wellknown: wellknownUrl },
      });
      startJourney();
    }
    initConfigAndStart();
  }, []);

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

  const ActiveStage = StageHandlers[activeStageName];

  return (
    <div className="App">
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
