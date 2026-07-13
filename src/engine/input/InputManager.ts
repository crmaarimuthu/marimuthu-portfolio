export interface InputState {
  /** Normalized movement axes in [-1, 1]; x = strafe, y = forward. */
  moveX: number;
  moveY: number;
  running: boolean;
  interactPressed: boolean;
  sitTogglePressed: boolean;
  jumpPressed: boolean;
  /** Camera look delta since last consumeFrameState() call. */
  lookDeltaX: number;
  lookDeltaY: number;
}

function createEmptyState(): InputState {
  return {
    moveX: 0,
    moveY: 0,
    running: false,
    interactPressed: false,
    sitTogglePressed: false,
    jumpPressed: false,
    lookDeltaX: 0,
    lookDeltaY: 0,
  };
}

const KEY_TO_AXIS: Record<string, { axis: "moveX" | "moveY"; sign: 1 | -1 }> = {
  KeyW: { axis: "moveY", sign: 1 },
  ArrowUp: { axis: "moveY", sign: 1 },
  KeyS: { axis: "moveY", sign: -1 },
  ArrowDown: { axis: "moveY", sign: -1 },
  KeyD: { axis: "moveX", sign: 1 },
  ArrowRight: { axis: "moveX", sign: 1 },
  KeyA: { axis: "moveX", sign: -1 },
  ArrowLeft: { axis: "moveX", sign: -1 },
};

/**
 * Framework-agnostic input aggregator. Both desktop keyboard/mouse
 * listeners and the mobile virtual joystick/touch-look write into the
 * same instance so PlayerController never branches on device type.
 */
export class InputManager {
  private keysDown = new Set<string>();
  private joystick = { x: 0, y: 0 };
  private running = false;
  private interactPressed = false;
  private sitTogglePressed = false;
  private jumpPressed = false;
  private lookDeltaX = 0;
  private lookDeltaY = 0;

  handleKeyDown(code: string): void {
    // Ignore OS auto-repeat: without this, holding Space/E/F re-fires
    // the one-shot flags every repeat tick until consumeFrameState()
    // happens to run, which reads as a stutter/multi-trigger glitch on
    // slower frame rates. keysDown is a Set so held movement keys are
    // unaffected (re-adding an existing member is a no-op).
    const alreadyDown = this.keysDown.has(code);
    this.keysDown.add(code);
    if (code === "ShiftLeft" || code === "ShiftRight") this.running = true;
    if (alreadyDown) return;
    if (code === "KeyE") this.interactPressed = true;
    if (code === "KeyF") this.sitTogglePressed = true;
    if (code === "Space") this.jumpPressed = true;
  }

  handleKeyUp(code: string): void {
    this.keysDown.delete(code);
    if (code === "ShiftLeft" || code === "ShiftRight") this.running = false;
  }

  setJoystick(x: number, y: number): void {
    this.joystick.x = clamp(x, -1, 1);
    this.joystick.y = clamp(y, -1, 1);
  }

  setMobileRunning(running: boolean): void {
    this.running = running;
  }

  triggerInteract(): void {
    this.interactPressed = true;
  }

  triggerSitToggle(): void {
    this.sitTogglePressed = true;
  }

  triggerJump(): void {
    this.jumpPressed = true;
  }

  addLookDelta(dx: number, dy: number): void {
    this.lookDeltaX += dx;
    this.lookDeltaY += dy;
  }

  /**
   * Returns the current frame's InputState and clears one-shot flags
   * (interactPressed, sitTogglePressed, jumpPressed, lookDelta). Call
   * once per frame.
   */
  consumeFrameState(): InputState {
    let moveX = this.joystick.x;
    let moveY = this.joystick.y;

    for (const code of this.keysDown) {
      const mapping = KEY_TO_AXIS[code];
      if (!mapping) continue;
      if (mapping.axis === "moveX") moveX += mapping.sign;
      else moveY += mapping.sign;
    }

    const state: InputState = {
      moveX: clamp(moveX, -1, 1),
      moveY: clamp(moveY, -1, 1),
      running: this.running,
      interactPressed: this.interactPressed,
      sitTogglePressed: this.sitTogglePressed,
      jumpPressed: this.jumpPressed,
      lookDeltaX: this.lookDeltaX,
      lookDeltaY: this.lookDeltaY,
    };

    this.interactPressed = false;
    this.sitTogglePressed = false;
    this.jumpPressed = false;
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;

    return state;
  }

  reset(): void {
    this.keysDown.clear();
    this.joystick = { x: 0, y: 0 };
    this.running = false;
    this.interactPressed = false;
    this.sitTogglePressed = false;
    this.jumpPressed = false;
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function emptyInputState(): InputState {
  return createEmptyState();
}
