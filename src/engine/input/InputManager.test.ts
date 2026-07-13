import { describe, expect, it } from "vitest";
import { InputManager } from "./InputManager";

describe("InputManager", () => {
  it("derives forward movement from KeyW", () => {
    const im = new InputManager();
    im.handleKeyDown("KeyW");
    const state = im.consumeFrameState();
    expect(state.moveY).toBe(1);
    expect(state.moveX).toBe(0);
  });

  it("combines opposing keys to zero", () => {
    const im = new InputManager();
    im.handleKeyDown("KeyW");
    im.handleKeyDown("KeyS");
    const state = im.consumeFrameState();
    expect(state.moveY).toBe(0);
  });

  it("clamps combined diagonal input to [-1, 1]", () => {
    const im = new InputManager();
    im.handleKeyDown("KeyW");
    im.handleKeyDown("KeyD");
    const state = im.consumeFrameState();
    expect(state.moveX).toBeLessThanOrEqual(1);
    expect(state.moveY).toBeLessThanOrEqual(1);
  });

  it("sets running while shift is held and clears on release", () => {
    const im = new InputManager();
    im.handleKeyDown("ShiftLeft");
    expect(im.consumeFrameState().running).toBe(true);
    im.handleKeyUp("ShiftLeft");
    expect(im.consumeFrameState().running).toBe(false);
  });

  it("interactPressed is a one-shot flag cleared after consumption", () => {
    const im = new InputManager();
    im.triggerInteract();
    expect(im.consumeFrameState().interactPressed).toBe(true);
    expect(im.consumeFrameState().interactPressed).toBe(false);
  });

  it("sitTogglePressed is a one-shot flag cleared after consumption", () => {
    const im = new InputManager();
    im.triggerSitToggle();
    expect(im.consumeFrameState().sitTogglePressed).toBe(true);
    expect(im.consumeFrameState().sitTogglePressed).toBe(false);
  });

  it("mobile joystick sets movement axes directly", () => {
    const im = new InputManager();
    im.setJoystick(0.5, -0.5);
    const state = im.consumeFrameState();
    expect(state.moveX).toBe(0.5);
    expect(state.moveY).toBe(-0.5);
  });

  it("clamps joystick input beyond [-1, 1]", () => {
    const im = new InputManager();
    im.setJoystick(2, -2);
    const state = im.consumeFrameState();
    expect(state.moveX).toBe(1);
    expect(state.moveY).toBe(-1);
  });

  it("jumpPressed is a one-shot flag cleared after consumption", () => {
    const im = new InputManager();
    im.triggerJump();
    expect(im.consumeFrameState().jumpPressed).toBe(true);
    expect(im.consumeFrameState().jumpPressed).toBe(false);
  });

  it("Space key triggers jumpPressed", () => {
    const im = new InputManager();
    im.handleKeyDown("Space");
    expect(im.consumeFrameState().jumpPressed).toBe(true);
  });

  it("does not re-trigger interactPressed on OS key auto-repeat (held key re-fires handleKeyDown without an intervening keyup)", () => {
    const im = new InputManager();
    im.handleKeyDown("KeyE");
    im.consumeFrameState(); // first frame sees it, clears the one-shot flag
    im.handleKeyDown("KeyE"); // OS auto-repeat while still held
    expect(im.consumeFrameState().interactPressed).toBe(false);
  });

  it("does re-trigger interactPressed after a genuine release and re-press", () => {
    const im = new InputManager();
    im.handleKeyDown("KeyE");
    im.consumeFrameState();
    im.handleKeyUp("KeyE");
    im.handleKeyDown("KeyE");
    expect(im.consumeFrameState().interactPressed).toBe(true);
  });

  it("auto-repeat does not affect held movement (moveY stays 1 while W is held)", () => {
    const im = new InputManager();
    im.handleKeyDown("KeyW");
    im.consumeFrameState();
    im.handleKeyDown("KeyW"); // auto-repeat
    expect(im.consumeFrameState().moveY).toBe(1);
  });

  it("reset clears all held state", () => {
    const im = new InputManager();
    im.handleKeyDown("KeyW");
    im.handleKeyDown("ShiftLeft");
    im.reset();
    const state = im.consumeFrameState();
    expect(state.moveY).toBe(0);
    expect(state.running).toBe(false);
  });
});
