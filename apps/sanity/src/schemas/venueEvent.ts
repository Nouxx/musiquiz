import { defineField, defineType } from "sanity";
import { ConfettiIcon } from "@sanity/icons/Confetti";
import { findDuplicate, takenFormatIds } from "./shared/venueFormatUniqueness";

export const venueEventType = defineType({
  name: "venueEvent",
  title: "Venue Event",
  type: "document",
  icon: ConfettiIcon,
  validation: (rule) =>
    rule.custom(async (_value, context) => {
      const duplicate = await findDuplicate({
        documentType: "venueEvent",
        field: "event",
        document: context.document,
        getClient: context.getClient,
      });

      if (!duplicate) return true;

      const venue = duplicate.venueTitle ?? "This venue";
      const event = duplicate.formatName ?? "this event";

      return {
        // anchored to the field: a document-level message with no path is difficult to find
        path: ["event"],
        message: `${venue} already has a page for ${event}. Open that page instead — a venue has only one page per event.`,
      };
    }),
  fields: [
    defineField({
      name: "venue",
      title: "Venue",
      type: "reference",
      to: [{ type: "venue" }],
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "event",
      title: "Event",
      description: "Events this venue already has a page for are not listed.",
      type: "reference",
      to: [{ type: "eventFormat" }],
      validation: (rule) => rule.required(),
      options: {
        filter: async ({ document, getClient }) => {
          const taken = await takenFormatIds({
            documentType: "venueEvent",
            field: "event",
            document,
            getClient,
          });
          // with nothing taken this reads `!(_id in [])`, which is every event
          return { filter: "!(_id in $taken)", params: { taken } };
        },
      },
    }),
    defineField({
      name: "pageCover",
      title: "Page Cover",
      type: "pageCover",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pageComponents",
      type: "pageComponents",
    }),
  ],
  preview: {
    select: {
      eventName: "event.name",
      venueTitle: "venue.title",
    },
    prepare({
      eventName,
      venueTitle,
    }: {
      eventName?: string;
      venueTitle?: string;
    }) {
      return {
        title: eventName ?? "No event selected",
        subtitle: venueTitle,
      };
    },
  },
});
