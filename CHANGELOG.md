# Change Log

## 0.7.3

- add problem matcher 'sn' for the GEARS Generator output

## 0.7.2

- add gears task #5 for executing scenarios

## 0.7.1

- replaced instance_id with process_instance_id
- updated How to use

## 0.7.0

- added 1st version of standard gears tasks (generate, diagrams, build, deploy)
- added snippets (attribute type, process simple, user attributes)
- updated snippets to new default_entities.sn
- improved other snippets
- added simple process snippet
- updated to resolve security issues
- excluded node modules

## 0.6.2

- now all current and future functions are highlighted.

## 0.6.1

- fixed issue that new snake_eyes functions are not hightlighted.

## 0.6.0

- applied snake_case to all functions. This will make this extension only suitable for GEARS v0.13.0 and up.

## 0.5.3

- moved demo animated gif to github (where it should have been in the first place).

## 0.5.2

- improved README and included demo animated gif.

## 0.5.1

- added snippets: input from (short and long version), entity definitions, attribute definitions, traits for attributes.
- snippet titles to lower case
- used international yyyy-m-d format in snippet documentation.

## 0.5.0

- fixed snippets and added some. You can also press CTRL+SHIFT+P and type 'snip' and select 'Insert snippet'. This produces a searchable list of snippets incl. documentation in which you van search and select your snippet. The 'todef' snippet must be triggered using this CTRL+SHIFT+P approach because it takes in the selected text and transforms it to a definition. Other snippets are also triggered by start typing the first keyword. E.g. type 'process', 'one', 'for each' or some function.

## 0.4.7

- multiline string the right way (thanks to Marcus)

## 0.4.6

- multiline string (but for now temporarily at the expense of placeholders, which are now highlighted as strings when inside of strings)

## 0.4.5

- fixed security vulnerabilities by upgrading devDependency `vscode` to version `^1.1.35`

## 0.4.4

- added keyword current

## 0.4.3

- added icon
- added .gears filename extension

## 0.4.2

- added `contains` operator

## 0.4.1

- fixed keyword `each` in `for each`
- added function `now()`

## 0.4.0

- update keywords to latest language specs.

## 0.2.2/0.3.0

- all keywords in lower case

## 0.2.1

- fix for updating file extension to .sn.
- disabled language server
- minor improvements in README.md

## 0.2.0

- security update for package "hoek" (2.16.3 -> 4.2.1)
- functional changes on language syntax
- file extension from gears and sr3 to just sn (which stands for SMART notation)

## 0.1.1

Fixed some minor issues. Added actual syntax highlighting. Prevented Language server error (not that language server is not yet working).

## 0.1.0

Initial release of vscode-gears.
