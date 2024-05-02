import type { LinguiConfig } from "@lingui/conf"

const config: LinguiConfig = {
  sourceLocale: "en",
  locales: ["en", "es"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}",
      include: ["src"],
    },
  ],
};

export default config
