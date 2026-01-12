import { useState } from "react";

export default function LoginPassword({ step, onNext }) {
  const passwordCallback = step.getCallbackOfType("PasswordCallback");
  const stageMetadata = step
    .getCallbackOfType("MetadataCallback")
    .getOutputByName("data");
  const actionCallback = step.getCallbackOfType("ChoiceCallback");

  const [password, setPassword] = useState("");

  function handleSubmit(e, action = "SUBMIT") {
    e.preventDefault();

    passwordCallback.setPassword(password || ".");
    actionCallback.setChoiceValue(action);
    onNext();
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, "SUBMIT")}>
      <div className="panel-header">
        <div className="panel-title">{step.getHeader()}</div>
        <div className="panel-description">{step.getDescription()}</div>
      </div>

      <div className="input-with-action">
        <input
          className="form-control"
          type="password"
          name="password"
          placeholder={passwordCallback.getPrompt()}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="input-action-button"
          aria-label="Next"
          disabled={!password}
        >
          &gt;
        </button>
      </div>
      <div className="input-error-message">{stageMetadata.errorMessage}</div>

      <div className="panel-link-row">
        <button
          type="button"
          className="button-link"
          onClick={(e) => handleSubmit(e, "EMAIL_OTP")}
        >
          Email me a code instead
        </button>
      </div>
    </form>
  );
}
