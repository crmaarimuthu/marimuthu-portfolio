/**
 * Public site-level links and contact shown on the 2D portfolio page.
 * Only public information: the GitHub profile is the public repo
 * owner; taglines default to TODO_USER_INPUT rather than invented
 * claims (see docs/PRIVACY_REVIEW.md).
 */
export interface SiteConfig {
  githubUrl: string;
  email: string;
  /** One-line hero tagline under the professional title. */
  tagline: string;
  /** Short "about me" paragraph. */
  about: string;
}

export const siteConfig: SiteConfig = {
  githubUrl: "https://github.com/crmaarimuthu",
  email: "crmari21052000@gmail.com",
  tagline:
    "Building firmware for battery energy storage — from MCU registers to Modbus networks.",
  about:
    "I work on embedded firmware for energy systems: microcontroller development on XMC4800 and STM32, communication stacks across CAN, RS485, and Modbus, and EMS/BMS control logic for battery storage. This site doubles as a playable 3D office — step into the city to explore my work in person.",
};
