import { at, defineMigration, set } from "sanity/migrate";

type Slide = { _key: string; _type: string };

export default defineMigration({
  title: "Retype carousel video slides as carouselVideo",
  migrate: {
    object(node) {
      if (node._type !== "carousel") return;

      const slides = node.slides as Slide[] | undefined;

      if (!slides?.some((slide) => slide._type === "video")) return;

      return at(
        "slides",
        set(
          slides.map((slide) =>
            slide._type === "video"
              ? { ...slide, _type: "carouselVideo" }
              : slide,
          ),
        ),
      );
    },
  },
});
