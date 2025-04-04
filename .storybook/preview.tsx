import * as React from "react";
import type { Preview } from "@storybook/react";
import { MemoryRouter } from "react-router";
import { HeroUIProvider } from "@heroui/react";
import { initialize, mswLoader } from "msw-storybook-addon";

import "../app/app.css";

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/"]}>
        <HeroUIProvider>
          <Story />
        </HeroUIProvider>
      </MemoryRouter>
    ),
  ],
};

export default preview;
