# vscode-gears README

Support for SMART notation (requirements specification language).

To publish, see https://code.visualstudio.com/docs/extensions/publish-extension.

## Requirements

The environment variable "GEARS\_HOME" must point to the GEARS installation folder.

## Release Notes

### 0.1.0

Initial release of vscode-gears.

### 0.1.1

Fixed some minor issues. Added actual syntax highlighting. Prevented Language server error (not that language server is not yet working).

### 0.2.0

- security update for package "hoek" (2.16.3 -> 4.2.1)
- functional changes on language syntax
- file extension from gears and sr3 to just sn (which stands for SMART notation)

### 0.2.1

- fix for updating file extension to .sn.
- disabled language server
- minor improvements in README.md

### 0.2.2

- all keywords in lower case