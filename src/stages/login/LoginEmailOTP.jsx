import { useState, useRef, useEffect } from "react";

export default function LoginEmailOTP({ step, onNext }) {
  const otpCallback = step.getCallbackOfType("StringAttributeInputCallback");
  const actionCallback = step.getCallbackOfType("ChoiceCallback");
  const stageMetadata = step
    .getCallbackOfType("MetadataCallback")
    .getOutputByName("data");

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputsRef = useRef([]);

  // ✅ Reset OTP and focus first digit on load / step change
  useEffect(() => {
    const emptyOtp = Array(6).fill("");
    setOtp(emptyOtp);
    otpCallback.setValue("."); // ForgeRock-safe empty value

    requestAnimationFrame(() => {
      inputsRef.current[0]?.focus();
    });
  }, [step, otpCallback]);

  function submit(action = "SUBMIT", otpValue) {
    const value = otpValue || otp.join("") || ".";
    otpCallback.setValue(value);
    actionCallback.setChoiceValue(action);

    if (action === "SUBMIT") {
      setIsSubmitting(true);

      setTimeout(() => {
        setIsSubmitting(false);
        onNext();
      }, 500);

      return;
    }

    onNext();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (otp.join("").length === 6) {
      submit("SUBMIT", otp.join(""));
    }
  }

  function handleChange(e, index) {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) return;

    const next = [...otp];
    next[index] = value[0];
    setOtp(next);

    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // ✅ Submit using computed value (not stale state)
    if (next.join("").length === 6) {
      submit("SUBMIT", next.join(""));
    }
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace") {
      e.preventDefault();

      const next = [...otp];
      if (next[index]) {
        next[index] = "";
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        next[index - 1] = "";
      }
      setOtp(next);
    }
  }

  function handlePaste(e) {
    const paste = e.clipboardData
      .getData("Text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!paste) return;

    const next = Array(6).fill("");
    paste.split("").forEach((char, i) => {
      next[i] = char;
    });

    setOtp(next);
    inputsRef.current[Math.min(paste.length, 6) - 1]?.focus();

    if (paste.length === 6) {
      submit("SUBMIT", next.join(""));
    }

    e.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="panel-header">
        <div className="panel-title">{step.getHeader()}</div>
        <div className="panel-description">{step.getDescription()}</div>
      </div>

      <div className="field-row otp-row">
        {otp.map((value, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            className="form-control otp-input"
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            aria-label={`OTP digit ${i + 1}`}
            autoComplete="one-time-code"
            required
          />
        ))}
      </div>

      <div className="input-error-message">{stageMetadata.errorMessage}</div>

      <div
        className={`otp-spinner ${isSubmitting ? "visible" : ""}`}
        aria-hidden={!isSubmitting}
      >
        <div className="spinner" />
      </div>

      <div className="panel-link-row">
        <button
          type="button"
          className="button-link"
          onClick={() => submit("RESEND")}
        >
          Resend Email
        </button>
      </div>
    </form>
  );
}
