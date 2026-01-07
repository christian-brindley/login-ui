import { Config } from "@forgerock/javascript-sdk";

Config.set({
  serverConfig: {
    baseUrl: "https://openam-brindley.forgeblocks.com/am",
    timeout: 5000,
  },
  realmPath: "alpha",
});
