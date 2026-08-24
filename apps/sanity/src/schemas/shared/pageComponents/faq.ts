import { defineArrayMember, defineField, defineType } from "sanity";

type LocalizedEntry = { _key?: string; value?: string };

function frenchValue(entries?: LocalizedEntry[]) {
  return (
    entries?.find((entry) => entry._key === "fr")?.value ?? entries?.[0]?.value
  );
}

export const faqQuestionType = defineType({
  name: "faqQuestion",
  title: "Question",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      description:
        "Paragraphs, bold and links. The first question of the section is open when the page loads; the others open one at a time.",
      type: "internationalizedArrayRichText",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      question: "question",
    },
    prepare({ question }: { question?: LocalizedEntry[] }) {
      return {
        title: frenchValue(question) ?? "Question",
      };
    },
  },
});

export const faqType = defineType({
  name: "faq",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "questions",
      title: "Questions",
      description: "Between 3 and 8.",
      type: "array",
      of: [defineArrayMember({ type: "faqQuestion" })],
      validation: (rule) => rule.required().min(3).max(8),
    }),
    defineField({
      name: "images",
      title: "Images",
      description:
        "Between 6 and 12, shown beside the questions on a big screen only, in two columns drifting past each other. Each one is cropped hard to a tall portrait from its centre, so pick photos whose subject sits in the middle.",
      type: "array",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (rule) => rule.required().min(6).max(12),
      // deliberately NOT `options: { layout: "grid" }`
      // this makes the alt un-authorable
      // because internationalizedArrayString (array) is rendered as grid cells as well
    }),
  ],
  preview: {
    select: {
      title: "title",
      questions: "questions",
      images: "images",
    },
    prepare({
      title,
      questions,
      images,
    }: {
      title?: LocalizedEntry[];
      questions?: unknown[];
      images?: unknown[];
    }) {
      const questionCount = questions?.length ?? 0;
      const imageCount = images?.length ?? 0;

      return {
        title: frenchValue(title) ?? "FAQ",
        subtitle: `FAQ · ${questionCount} question${questionCount === 1 ? "" : "s"} · ${imageCount} image${imageCount === 1 ? "" : "s"}`,
      };
    },
  },
});
