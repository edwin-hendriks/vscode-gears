# Changelog

## 0.11.0

- Many configuration properties are now configured using gears.json instead of VSCode's configuration mechanism (i.e. .vscode/settings.json). See README.md for more info.

  | Old                       | New              |
  | ------------------------- | ---------------- |
  | gears.project.name        | projectName      |
  | gears.project.version     | projectVersion   |
  | gears.generator.version   | generatorVersion |
  | gears.runner.version      | runnerVersion    |
  | gears.runtime.version     | runtimeVersion   |

## 0.10.1

- Fixed errors in this CHANGELOG.md at version 0.10.0
- Added documentation on how to use `gears.json`.

## 0.10.0

- If `gears.json` exists in the root of the workspace, pass it to the Generator using 
  its new `--config` command line argument (requires Generator version 0.64 or higher).

## 0.9.0

- Update tasks for new Runtime architecture.
  The Start/Stop Runtime and Deploy/Undeploy tasks have been replaced by Run Application. 
- Related settings have been removed: `gears.docker`, `gears.deploy.mode`, `gears.runtime.management.mode`.
- Fix inconsistency in invocation of the Generator vs the Runner.

## 0.8.1

- Extra arguments can be configured for the GEARS Generator and Runner.
- Configurable endpoint for the GEARS Runner.
- Minor fix in start runtime task.

## 0.8.0

- Configurable file pattern for SN specifications (`*.sn` by default).
- Add tasks for managing (starting and stopping) the GEARS Runtime.
- The new configuration property 'gears.runtime.management.mode' controls whether Runtime management is done using Docker, Docker Compose or GEARS CLI.

## 0.7.9

- Configurable file pattern for loading data files (`data/*.sql` by default) and running scenarios (`scenarios/*.scenario` by default).

## 0.7.8

- Pass the gears.project.version to the Generator.
- Add Undeploy task.

## 0.7.7

- Add task for loading data.

## 0.7.6

- Deploy now also works on Windows
- Improved documentation

## 0.7.5

- The deploy task now indicates when deployment is completed.
- The new configuration property 'gears.docker' indicates which command should be used to invoke Docker.

## 0.7.4

- Activate extension on presence of *.sn files in the workspace.
- Configuration properties are now declared as extension contributions.
- Configuration properties 'project.name' and 'project.version' have been renamed to 'gears.project.name' and 'gears.project.version'.
- The new configuration property 'gears.browser' indicates which browser is used to display diagrams.
- The new configuration property 'gears.deploy.mode' controls whether deployment is done using Docker, Maven or GEARS CLI.

## 0.7.3

- Add problem matcher 'sn' for the GEARS Generator output

## 0.7.2

- Add gears task #5 for executing scenarios

## 0.7.1

- Replaced instance_id with process_instance_id
- Updated How to use

## 0.7.0

- Added 1st version of standard gears tasks (generate, diagrams, build, deploy)
- Added snippets (attribute type, process simple, user attributes)
- Updated snippets to new default_entities.sn
- Improved other snippets
- Added simple process snippet
- Updated to resolve security issues
- Excluded node modules

## 0.6.2

- Now all current and future functions are highlighted.

## 0.6.1

- Fixed issue that new snake_eyes functions are not hightlighted.

## 0.6.0

- Applied snake_case to all functions. This will make this extension only suitable for GEARS v0.13.0 and up.

## 0.5.3

- Moved demo animated gif to github (where it should have been in the first place).

## 0.5.2

- Improved README and included demo animated gif.

## 0.5.1

- Added snippets: input from (short and long version), entity definitions, attribute definitions, traits for attributes.
- Snippet titles to lower case
- Used international yyyy-m-d format in snippet documentation.

## 0.5.0

- Fixed snippets and added some. You can also press CTRL+SHIFT+P and type 'snip' and select 'Insert snippet'. This produces a searchable list of snippets incl. documentation in which you van search and select your snippet. The 'todef' snippet must be triggered using this CTRL+SHIFT+P approach because it takes in the selected text and transforms it to a definition. Other snippets are also triggered by start typing the first keyword. E.g. type 'process', 'one', 'for each' or some function.

## 0.4.7

- Multiline string the right way (thanks to Marcus)

## 0.4.6

- Multiline string (but for now temporarily at the expense of placeholders, which are now highlighted as strings when inside of strings)

## 0.4.5

- Fixed security vulnerabilities by upgrading devDependency `vscode` to version `^1.1.35`

## 0.4.4

- Added keyword current

## 0.4.3

- Added icon
- Added .gears filename extension

## 0.4.2

- Added `contains` operator

## 0.4.1

- Fixed keyword `each` in `for each`
- Added function `now()`

## 0.4.0

- Update keywords to latest language specs.

## 0.2.2/0.3.0

- All keywords in lower case

## 0.2.1

- Fix for updating file extension to .sn.
- Disabled language server
- Minor improvements in README.md

## 0.2.0

- Security update for package "hoek" (2.16.3 -> 4.2.1)
- Functional changes on language syntax
- File extension from gears and sr3 to just sn (which stands for SMART notation)

## 0.1.1

- Fixed some minor issues. Added actual syntax highlighting. Prevented Language server error (not that language server is not yet working).

## 0.1.0

- Initial release of vscode-gears.
