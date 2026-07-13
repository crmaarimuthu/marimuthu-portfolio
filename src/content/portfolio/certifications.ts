import type { CertificationEntry } from "@/portfolio/portfolioTypes";

/**
 * No certifications have been supplied yet. Left empty rather than
 * populated with a placeholder entry — an empty list renders as "no
 * certifications listed," which is honest, whereas a placeholder
 * certification entry could look like a real (fabricated) one at a
 * glance. See docs/PRIVACY_REVIEW.md.
 */
export const CERTIFICATIONS: CertificationEntry[] = [];
