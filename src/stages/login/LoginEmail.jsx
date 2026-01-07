export default function LoginEmail({ step, onNext }) {
  const emailCallback = step.getCallbackOfType("StringAttributeInputCallback");

  function callbackHandler() {
    emailCallback.setValue(
      document.querySelector('input[name="email"]')?.value || ""
    );
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
          type="text"
          name="email"
          placeholder={emailCallback.getPrompt()}
          autoFocus
        />
        <button
          type="button"
          className="input-action-button"
          onClick={callbackHandler}
          aria-label="Next"
        >
          &gt;
        </button>
      </div>
      <div className="panel-link-row">
        <button type="button" className="button-link" onClick={callbackHandler}>
          Not registered?
        </button>
      </div>
    </div>
  );
}
