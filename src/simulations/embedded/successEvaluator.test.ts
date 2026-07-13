import { describe, expect, it } from "vitest";
import { evaluateTaskSuccess, type TaskSuccessInputs } from "./successEvaluator";

const complete: TaskSuccessInputs = {
  buildSuccess: true,
  flashSuccess: true,
  boardRunning: true,
  gpioDirectionCorrect: true,
  observedHigh: true,
  observedLow: true,
  usingExpectedBehaviour: true,
};

describe("evaluateTaskSuccess", () => {
  it("succeeds when every condition holds", () => {
    expect(evaluateTaskSuccess(complete)).toBe(true);
  });

  it("rejects success immediately after a build starts (build not yet successful)", () => {
    expect(evaluateTaskSuccess({ ...complete, buildSuccess: false, flashSuccess: false, boardRunning: false, observedHigh: false, observedLow: false })).toBe(false);
  });

  it("requires flash success even if build succeeded", () => {
    expect(evaluateTaskSuccess({ ...complete, flashSuccess: false })).toBe(false);
  });

  it("requires the board to be running", () => {
    expect(evaluateTaskSuccess({ ...complete, boardRunning: false })).toBe(false);
  });

  it("requires correct GPIO direction configuration", () => {
    expect(evaluateTaskSuccess({ ...complete, gpioDirectionCorrect: false })).toBe(false);
  });

  it("requires an observed HIGH", () => {
    expect(evaluateTaskSuccess({ ...complete, observedHigh: false })).toBe(false);
  });

  it("requires an observed LOW (rejects a LED stuck HIGH)", () => {
    expect(evaluateTaskSuccess({ ...complete, observedLow: false })).toBe(false);
  });

  it("requires the runtime to be using the expected behaviour descriptor", () => {
    expect(evaluateTaskSuccess({ ...complete, usingExpectedBehaviour: false })).toBe(false);
  });
});
