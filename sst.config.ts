/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "webdeeds-wallet",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          profile:
            input.stage === "production"
              ? "webdeeds-production"
              : "webdeeds-dev",
          region: "us-east-1",
        },
        cloudflare: "5.49.0",
      },
    };
  },
  async run() {
    const domain =
      {
        production: "wallet.webdeeds.org",
        dev: "dev.wallet.webdeeds.org",
      }[$app.stage] || $app.stage + ".dev.wallet.webdeeds.org";

    const web = new sst.aws.StaticSite("Web", {
      path: ".",
      build: {
        command: "pnpm run build",
        output: "build/client",
      },
      dev: {
        command: "pnpm run dev",
      },
      domain: {
        name: domain,
        dns: sst.cloudflare.dns(),
      },
    });

    return {
      web: web.url,
    };
  },
});
