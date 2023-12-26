import { TForm } from "@fastform/types/forms";
import { useEffect, useRef, useState } from "preact/hooks";
import Progress from "../general/Progress";

interface AutoCloseProps {
  form: TForm;
  onClose: () => void;
  children: any;
}

export function AutoCloseWrapper({ form, onClose, children }: AutoCloseProps) {
  const [countdownProgress, setCountdownProgress] = useState(100);
  const [countdownStop, setCountdownStop] = useState(false);
  const startRef = useRef(performance.now());
  const frameRef = useRef<number | null>(null);

  const handleStopCountdown = () => {
    if (frameRef.current !== null) {
      setCountdownStop(true);
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  };

  useEffect(() => {
    if (!form.autoClose) return;

    const updateCountdown = () => {
      const timeout = form.autoClose! * 1000;
      const elapsed = performance.now() - startRef.current;
      const remaining = Math.max(0, timeout - elapsed);

      setCountdownProgress(remaining / timeout);

      if (remaining > 0) {
        frameRef.current = requestAnimationFrame(updateCountdown);
      } else {
        handleStopCountdown();
        onClose();
      }
    };

    setCountdownProgress(1);
    frameRef.current = requestAnimationFrame(updateCountdown);

    return () => handleStopCountdown();
  }, [form.autoClose, onClose]);

  return (
    <>
      {!countdownStop && form.autoClose && <Progress progress={countdownProgress} />}
      <div onClick={handleStopCountdown} onMouseOver={handleStopCountdown} className="h-full w-full">
        {children}
      </div>
    </>
  );
}
