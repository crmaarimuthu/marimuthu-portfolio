/**
 * Trusted, structured firmware project content. This is NOT arbitrary
 * visitor-supplied code — it is a fixed portfolio demonstration project
 * shipped with the application. Nothing here is ever compiled or
 * executed for real; see docs/EMBEDDED_SIMULATION.md "Simulation
 * boundary".
 */
export interface FirmwareSourceFile {
  path: string;
  content: string;
}

export interface GpioBlinkBehaviour {
  type: "GPIO_BLINK";
  pin: number;
  intervalMs: number;
}

export type FirmwareBehaviourDescriptor = GpioBlinkBehaviour;

export interface FirmwareProject {
  id: string;
  name: string;
  language: "C";
  standard: "C17";
  sourceFiles: FirmwareSourceFile[];
  targetBoardId: string;
  buildProfile: string;
  expectedBehaviour: FirmwareBehaviourDescriptor;
}

const MAIN_C_SOURCE = `#include <stdint.h>
#include <stdbool.h>

#define LED_PIN 5U
#define BLINK_INTERVAL_MS 500U

static bool led_state = false;

static void gpio_init(void);
static void gpio_write(uint32_t pin, bool state);
static void delay_ms(uint32_t milliseconds);

int main(void)
{
    gpio_init();

    while (true)
    {
        led_state = !led_state;
        gpio_write(LED_PIN, led_state);
        delay_ms(BLINK_INTERVAL_MS);
    }
}
`;

export const DEMO_FIRMWARE_PROJECT: FirmwareProject = {
  id: "virtual-gpio-led-blink",
  name: "Virtual GPIO LED Blink",
  language: "C",
  standard: "C17",
  sourceFiles: [{ path: "main.c", content: MAIN_C_SOURCE }],
  targetBoardId: "virtual-embedded-board",
  buildProfile: "simulated-toolchain-release",
  expectedBehaviour: { type: "GPIO_BLINK", pin: 5, intervalMs: 500 },
};
