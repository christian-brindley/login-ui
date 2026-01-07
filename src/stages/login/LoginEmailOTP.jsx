import { useRef } from "react";

export default function LoginEmailOTP({ step, onNext }) {
  const otpCallback = step.getCallbackOfType("StringAttributeInputCallback");
  const actionCallback = step.getCallbackOfType("ChoiceCallback");

  const inputsRef = useRef([]);

  function callbackHandler(action) {
    const otp = inputsRef.current.map((i) => i.value).join("") || ".";
    otpCallback.setValue(otp);
    actionCallback.setChoiceValue(action);
    onNext();
  }

  // function submitOtp() {
  //   const otp = inputsRef.current.map((i) => i.value).join("");
  //   if (otp.length !== 6) return;

  //   passwordCallback.setPassword(otp);
  //   actionCallback.setChoiceValue("SUBMIT");
  //   onNext();
  // }

  function handleChange(e, index) {
    const value = e.target.value.replace(/\D/g, ""); // numbers only
    e.target.value = value;

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }

    const otp = inputsRef.current.map((i) => i.value).join("");
    if (otp.length === 6) {
      callbackHandler("SUBMIT");
    }
  }

  function handleKeyDown(e, index) {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  }

  function handlePaste(e) {
    const paste = e.clipboardData
      .getData("Text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!paste) return;

    paste.split("").forEach((char, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = char;
      }
    });

    // Focus last input and submit if 6 digits
    const lastIndex = Math.min(paste.length - 1, 5);
    inputsRef.current[lastIndex].focus();

    if (paste.length === 6) {
      callbackHandler("SUBMIT");
    }

    e.preventDefault(); // prevent default paste behavior
  }

  return (
    <div>
      <div className="panel-header">
        <div className="panel-title">{step.getHeader()}</div>
        <div className="panel-description">{step.getDescription()}</div>
      </div>
      <div className="field-row otp-row">
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            className="form-control otp-input"
            type="text"
            inputMode="numeric"
            maxLength={1}
            autoFocus={i === 0}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste} // <-- added paste support
          />
        ))}
      </div>
      <div className="panel-link-row">
        <button
          type="button"
          className="button-link"
          onClick={() => callbackHandler("RESEND")}
        >
          Resend Email
        </button>
      </div>
    </div>
  );
}
