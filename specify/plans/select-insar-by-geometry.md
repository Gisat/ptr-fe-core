# Plan: Select InSAR Points by Drawn Geometry

## Summary

Enable users to select InSAR points that fall within a user-drawn polygon or circle geometry^ After the user closes the drawing, a "Select points" button triggers a post request to the backend.

## Steps

1. Created Next.js API proxy route (`/api/(data-service)/query-by-geometry/route.ts`).
2. Updated state definition to include `selections` and `selectionKey`.
3. Created constants.ps and helpers.ts
4. Extended MapSelectionByGeometryClient to use selections.
