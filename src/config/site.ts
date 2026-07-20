/**
 * Public site-level links and contact shown on the 2D portfolio page.
 * Only public information: the GitHub/LinkedIn profiles are the user's
 * own public accounts; taglines default to TODO_USER_INPUT rather than
 * invented claims (see docs/PRIVACY_REVIEW.md). No resume file or
 * Instagram handle is set — neither was supplied, so neither is
 * fabricated; the Contact UI only renders a link when the field is set.
 */
export interface SiteConfig {
  githubUrl: string;
  linkedinUrl: string;
  email: string;
  /** Optional resume file under /public, e.g. "/resume.pdf" — unset until a real file is supplied. */
  resumeUrl?: string;
  /** Optional public Instagram profile — unset until a real handle is supplied. */
  instagramUrl?: string;
  /** One-line hero tagline under the professional title. */
  tagline: string;
  /** Short "about me" paragraph. */
  about: string;
}

export const siteConfig: SiteConfig = {
  githubUrl: "https://github.com/crmaarimuthu",
  linkedinUrl: "https://www.linkedin.com/in/r-marimuthu21052000/",
  email: "crmari21052000@gmail.com",
  tagline:
    "Senior embedded firmware engineer building BMS, BESS, EMS and SCADA systems — from MCU registers to IEC 61850 substations.",
  about:
    "I build embedded firmware and industrial communication systems for battery energy storage: microcontroller development on STM32 and Infineon XMC4800, communication stacks across CAN/CAN FD, RS485/RS232/UART, Modbus RTU/TCP and MQTT, SCADA integration over IEC 61850 and IEC 60870-5-104, and BMS/BESS/EMS control logic in Embedded C, Modern C++ and Python on embedded Linux and Raspberry Pi. This site doubles as a playable 3D office — step into the city to explore my work in person.",
};
