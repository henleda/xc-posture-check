import { z } from "zod";

// Loose IPv4/IPv6 string. The probes do their own resolution and we accept
// whatever they record; canonical-form validation is a job for the probe layer.
export const ipString = z.string().min(1);

// CIDR-style ASN identifier. Either "AS13335" or a bare number string. Probe
// code normalizes to "AS<number>".
export const asnString = z.string().regex(/^(AS)?\d+$/i);

// Two-letter ISO country code from MaxMind / IPinfo geolocation.
export const countryCode = z.string().length(2).toUpperCase();
