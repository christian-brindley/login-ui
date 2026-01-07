export default function LoginPassword({ step, onNext }) {
  const passwordCallback = step.getCallbackOfType("PasswordCallback");

  const actionCallback = step.getCallbackOfType("ChoiceCallback");

  function callbackHandler(action) {
    passwordCallback.setPassword(
      document.querySelector('input[name="password"]')?.value || "."
    );
    actionCallback.setChoiceValue(action);
    onNext();
  }

  return (
    <div>
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
        />
        <button
          type="button"
          className="input-action-button"
          onClick={() => callbackHandler("SUBMIT")}
          aria-label="Next"
        >
          &gt;
        </button>
      </div>
      <div className="panel-link-row">
        <button
          type="button"
          className="button-link"
          onClick={() => callbackHandler("EMAIL_OTP")}
        >
          Email me a code instead
        </button>
      </div>
    </div>
  );
}
