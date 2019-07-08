# Change Log

## 0.1.0

Initial release of vscode-gears.

## 0.1.1

Fixed some minor issues. Added actual syntax highlighting. Prevented Language server error (not that language server is not yet working).

## 0.2.0

- security update for package "hoek" (2.16.3 -> 4.2.1)
- functional changes on language syntax
- file extension from gears and sr3 to just sn (which stands for SMART notation)

## 0.2.1

- fix for updating file extension to .sn.
- disabled language server
- minor improvements in README.md

## 0.2.2/0.3.0

- all keywords in lower case

## 0.4.0

- update keywords to latest language specs.

## 0.4.1

- fixed keyword `each` in `for each`
- added function `now()`

## 0.4.2

- added `contains` operator

## 0.4.3

- added icon
- added .gears filename extension

## 0.4.4

- added keyword current

## 0.4.5

- fixed security vulnerabilities by upgrading devDependency `vscode` to version `^1.1.35`

## 0.4.6

- multiline string (but for now temporarily at the expense of placeholders, which are now highlighted as strings when inside of strings)

## 0.4.7

- multiline string the right way (thanks to Marcus)