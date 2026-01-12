import { useState } from "react";

export default function LoginEmail({ step, onNext }) {
  const emailCallback = step.getCallbackOfType("StringAttributeInputCallback");
  const stageMetadata = step
    .getCallbackOfType("MetadataCallback")
    .getOutputByName("data");

  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault(); // prevent page reload
    emailCallback.setValue(email);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="panel-header">
        <div className="panel-title">{step.getHeader()}</div>
        <div className="panel-description">{step.getDescription()}</div>
      </div>
      <div className="input-with-action">
        <input
          className="form-control"
          type="email"
          name="email"
          placeholder={emailCallback.getPrompt()}
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="input-action-button"
          aria-label="Next"
          disabled={!email.trim()}
        >
          &gt;
        </button>
      </div>
      <div className="input-error-message">{stageMetadata.errorMessage}</div>
      <div className="panel-link-row">
        <button type="button" className="button-link" onClick={handleSubmit}>
          Not registered?
        </button>
      </div>
    </form>
  );
}
