import type { TechStackItem } from "@/portfolio/portfolioTypes";

/**
 * Tech stack categories and items as supplied directly by the user
 * (their real specialization list) — not invented. See
 * docs/PORTFOLIO_CONTENT.md. "Vercel" under `cloud` is corroborated by
 * this repo's own deployment history (.agent/STATUS.md "Vercel deploy
 * fix"), not an invented claim.
 */
export const TECH_STACK: TechStackItem[] = [
  // Firmware & platforms
  { id: "stm32", name: "STM32", category: "embedded" },
  { id: "xmc4800", name: "Infineon XMC4800", category: "embedded" },
  { id: "raspberry-pi", name: "Raspberry Pi", category: "embedded" },
  { id: "mcu-development", name: "MCU Development", category: "embedded" },

  // Programming
  { id: "embedded-c", name: "Embedded C", category: "programming" },
  { id: "modern-cpp", name: "Modern C++", category: "programming" },
  { id: "python", name: "Python", category: "programming" },

  // Communication protocols
  { id: "can", name: "CAN", category: "communication" },
  { id: "can-fd", name: "CAN FD", category: "communication" },
  { id: "rs485", name: "RS485", category: "communication" },
  { id: "rs232", name: "RS232", category: "communication" },
  { id: "uart", name: "UART", category: "communication" },
  { id: "modbus-rtu", name: "Modbus RTU", category: "communication" },
  { id: "modbus-tcp", name: "Modbus TCP", category: "communication" },
  { id: "mqtt", name: "MQTT", category: "communication" },

  // Energy systems
  { id: "bms", name: "Battery Management System (BMS)", category: "energy-systems" },
  { id: "bess", name: "Battery Energy Storage System (BESS)", category: "energy-systems" },
  { id: "ems", name: "Energy Management System (EMS)", category: "energy-systems" },

  // SCADA & industrial standards
  { id: "scada", name: "SCADA", category: "scada" },
  { id: "iec61850", name: "IEC 61850", category: "scada" },
  { id: "iec60870-5-104", name: "IEC 60870-5-104", category: "scada" },

  // Linux
  { id: "linux", name: "Linux", category: "linux-tooling" },
  { id: "embedded-linux", name: "Embedded Linux", category: "linux-tooling" },
  { id: "systemd", name: "Systemd", category: "linux-tooling" },

  // Tools
  { id: "cmake", name: "CMake", category: "tools" },
  { id: "ninja", name: "Ninja", category: "tools" },
  { id: "gcc", name: "GCC", category: "tools" },
  { id: "clang", name: "Clang", category: "tools" },
  { id: "git", name: "Git", category: "tools" },

  // Cloud / deployment
  { id: "vercel", name: "Vercel", category: "cloud" },
];
