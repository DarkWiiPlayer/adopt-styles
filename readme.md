# Pull-Styles

A simple proof-of-concept implementation of a mechanism to pull outside styles
into a Shadow-DOM.

## Rationale

This is primarily meant as a simple proof-of-concept to show how this mechanism
could work as a solution to the [use-case](https://github.com/WICG/webcomponents/issues/909)
of authors wanting to let outside styling rules affect content inside a shadow
DOM.

The aim of this project is not to provide a full solution to the problem, but to
showcase how one possible solution could work and to allow playing around with
the concept in real-world projects.

## Notes

Due to this being a relatively "simple" javascript implementation, outside
selectors will simply be mirrored into the shadow DOM, but more complex
selectors like child selectors won't match elements across shadow DOM
boundaries.

## Planned Features:

- [x] Import `<link>` tags
- [x] Import `<style>` tags
- [x] Import into layer
- [x] Automatic updating
- [ ] Import from layer
