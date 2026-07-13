export interface TaskSuccessInputs {
  buildSuccess: boolean;
  flashSuccess: boolean;
  boardRunning: boolean;
  /** The configured LED pin was actually configured as OUTPUT. */
  gpioDirectionCorrect: boolean;
  /** The LED was observed HIGH at least once. */
  observedHigh: boolean;
  /** The LED was observed LOW at least once (i.e. it actually blinked, not just latched HIGH). */
  observedLow: boolean;
  /** The runtime is driving the project's actual configured behaviour (not some other/default one). */
  usingExpectedBehaviour: boolean;
}

/**
 * Deterministic success gate for the embedded firmware task. Every
 * condition must hold — in particular, success is never granted just
 * because BUILD started (see Milestone 4 brief section 19): it requires
 * a completed build+flash, a running board, correct GPIO configuration,
 * and *both* HIGH and LOW having actually been observed (proof the LED
 * is genuinely blinking, not stuck).
 */
export function evaluateTaskSuccess(inputs: TaskSuccessInputs): boolean {
  return (
    inputs.buildSuccess &&
    inputs.flashSuccess &&
    inputs.boardRunning &&
    inputs.gpioDirectionCorrect &&
    inputs.observedHigh &&
    inputs.observedLow &&
    inputs.usingExpectedBehaviour
  );
}
