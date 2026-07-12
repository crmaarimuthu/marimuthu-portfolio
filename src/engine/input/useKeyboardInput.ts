"use client";

import { useEffect } from "react";
import type { InputManager } from "./InputManager";

export function useKeyboardInput(inputManager: InputManager) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      inputManager.handleKeyDown(e.code);
    }
    function handleKeyUp(e: KeyboardEvent) {
      inputManager.handleKeyUp(e.code);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      inputManager.reset();
    };
  }, [inputManager]);
}
