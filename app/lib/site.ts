const configuredSiteURL = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

export const SITE_URL = configuredSiteURL || "http://localhost:3000";
