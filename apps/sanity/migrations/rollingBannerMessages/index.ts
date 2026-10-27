import { randomBytes } from "node:crypto";
import { at, defineMigration, set, unset } from "sanity/migrate";

export default defineMigration({
  title: "Move the rolling banner message into a list of messages",
  migrate: {
    object(node) {
      if (node._type !== "rollingBanner" || !("message" in node)) return;

      return [
        at(
          "messages",
          set([
            {
              _key: randomBytes(6).toString("hex"),
              _type: "rollingBannerMessage",
              text: node.message,
            },
          ]),
        ),
        at("message", unset()),
      ];
    },
  },
});
