/**
 * White-label merchant configuration.
 * Re-theme or re-brand a site by editing ONE entry here (or loading it from
 * the Durpalla merchant API by hostname - see proxy.ts / getMerchant()).
 */
export interface MerchantConfig {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  domain: string;
  logo: { text: string; src?: string };
  colors: {
    primary: string; // deep blue
    primaryDark: string;
    primaryLight: string;
    accent: string; // orange CTA
    accentDark: string;
  };
  contact: { phone: string; email: string; address: string; hotline: string };
  social: { facebook?: string; youtube?: string };
  apps: { appStore: string; googlePlay: string };
  heroImage: string;
}

export const merchants: Record<string, MerchantConfig> = {
  seapearl: {
    id: "seapearl",
    name: "Sea Pearl Resort",
    shortName: "Sea Pearl",
    tagline: "Wake up to the world's longest sea beach",
    domain: "seapearl.example.com",
    logo: { text: "SP" },
    colors: {
      primary: "#0F766E",
      primaryDark: "#0B4F4A",
      primaryLight: "#E6F4F1",
      accent: "#C9A227",
      accentDark: "#A8851B",
    },
    contact: {
      phone: "+880 1800-000000",
      hotline: "09612-000000",
      email: "reservations@seapearl.example.com",
      address: "Marine Drive, Kolatoli, Cox's Bazar 4700, Bangladesh",
    },
    social: { facebook: "#", youtube: "#" },
    apps: { appStore: "#", googlePlay: "#" },
    heroImage: "/img/resort.jpg",
  },
};

export const DEFAULT_MERCHANT_ID = process.env.NEXT_PUBLIC_MERCHANT_ID ?? "seapearl";

/** Hostname -> merchant id. In production this comes from Durpalla's backend. */
export const hostMap: Record<string, string> = {
  "seapearl.example.com": "seapearl",
  localhost: "seapearl",
};

export function getMerchant(id: string = DEFAULT_MERCHANT_ID): MerchantConfig {
  return merchants[id] ?? merchants.seapearl;
}

export const merchant = getMerchant();

export function merchantCssVars(m: MerchantConfig = merchant): Record<string, string> {
  return {
    "--brand": m.colors.primary,
    "--brand-dark": m.colors.primaryDark,
    "--brand-light": m.colors.primaryLight,
    "--accent": m.colors.accent,
    "--accent-dark": m.colors.accentDark,
  };
}

export const taka = (n: number) => `৳${n.toLocaleString("en-IN")}`;
