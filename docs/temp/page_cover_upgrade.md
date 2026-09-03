# Name of the component

## Goal

- Design a new page component in apps/sanity/src/schemas/shared/pageComponents/name_of_component.ts
- Wire it up to the cms layers (apps/sanity -> api -> services -> web)

## Assets

- docs/temp/file.png -> variant desc
- docs/temp/file.css -> (CSS exported layers from Figma)

## Notes

## Steps

1. we grill for front end and front end ONLY
2. design the front-end component in zz-scratch page with stub data, I QA, we tight things up
3. we grill for backend (sanity -> api -> services...)
4. you implement the backend and feed the data with the one from Figma (see "Assets" section), I QA, we tight things up

## To ignore

- migration scripts: data are not production yet, fully local. don't migrate anything. edit the schema following our decisions
