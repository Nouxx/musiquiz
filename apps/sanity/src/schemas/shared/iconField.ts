import { defineField } from "sanity";
import { IconInput } from "../../components/IconInput";
import { contentIcons } from "./pageComponents/contentIcons";

export function iconField({
  name = "icon",
  title = "Icon",
  description,
  initialValue,
}: {
  name?: string;
  title?: string;
  description?: string;
  initialValue?: string;
}) {
  return defineField({
    name,
    title,
    description,
    type: "string",
    options: { list: contentIcons },
    initialValue,
    components: { input: IconInput },
    validation: (rule) => rule.required(),
  });
}
