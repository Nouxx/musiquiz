# Booking and gifting page change

## Context

- booking and gifting page currently have a booking widget
- some CMS authorable components can be added before and after these widgets in both pages
- both are array of the same shape than the existing pageComponents, can be empty array 

## Goal

- for theses page, replace the pageComponents field in Sanity with "before" and "after" widgets fields
- find the proper names for them
- seed the CMS data for "lille" venue for both pages

## Assets

- gifting section in Figma: https://www.figma.com/design/bgqQxyPslsq4c3NbphbVLl/Musi-Quiz?node-id=383-8702&t=9U8805zncKg6Ob0b-4
    - no after components, just before
- booking section in Figma https://www.figma.com/design/bgqQxyPslsq4c3NbphbVLl/Musi-Quiz?node-id=625-9741&t=9U8805zncKg6Ob0b-4
    - before and after filled


## To ignore

- migration scripts: data are not production yet, fully local. don't migrate anything. edit the schema following our decisions
