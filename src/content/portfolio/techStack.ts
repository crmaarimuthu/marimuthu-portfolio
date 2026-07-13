import type { TechStackItem } from "@/portfolio/portfolioTypes";

/**
 * Tech stack categories and items as specified by the user in the
 * original project brief's "Professional Portfolio Integration"
 * section (embedded lab / communication lab / energy control room /
 * Linux workstation groupings) — real user-supplied information, not
 * invented. See docs/PORTFOLIO_CONTENT.md.
 */
export const TECH_STACK: TechStackItem[] = [
  { id: "c", name: "C", category: "embedded" },
  { id: "embedded-c", name: "Embedded C", category: "embedded" },
  { id: "cpp", name: "C++", category: "embedded" },
  { id: "mcu-development", name: "MCU Development", category: "embedded" },
  { id: "xmc4800", name: "XMC4800", category: "embedded" },
  { id: "stm32", name: "STM32", category: "embedded" },

  { id: "can", name: "CAN", category: "communication" },
  { id: "rs485", name: "RS485", category: "communication" },
  { id: "uart", name: "UART", category: "communication" },
  { id: "modbus-rtu", name: "Modbus RTU", category: "communication" },
  { id: "modbus-tcp", name: "Modbus TCP", category: "communication" },
  { id: "mqtt", name: "MQTT", category: "communication" },

  { id: "ems", name: "EMS", category: "energy-systems" },
  { id: "bms", name: "BMS", category: "energy-systems" },
  { id: "pcs", name: "PCS", category: "energy-systems" },
  { id: "grid-integration", name: "Grid Integration", category: "energy-systems" },
  { id: "battery-systems", name: "Battery Systems", category: "energy-systems" },
  { id: "charge-discharge-control", name: "Charge/Discharge Control", category: "energy-systems" },

  { id: "linux", name: "Linux", category: "linux-tooling" },
  { id: "cmake", name: "CMake", category: "linux-tooling" },
  { id: "ninja", name: "Ninja", category: "linux-tooling" },
  { id: "gcc", name: "GCC", category: "linux-tooling" },
  { id: "clang", name: "Clang", category: "linux-tooling" },
  { id: "git", name: "Git", category: "linux-tooling" },
  { id: "systemd", name: "Systemd", category: "linux-tooling" },
];
