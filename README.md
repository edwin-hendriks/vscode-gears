# vscode-gears README

Support for the GEARS L4 specification language.

To publish, see https://code.visualstudio.com/docs/extensions/publish-extension.

## Requirements

The environment variable "PAGEN\_SERVER\_JAR" must point to the GEARS Language Server JAR. The value must be the full path of the jar file, and can contain spaces.

## Release Notes

### 0.0.1

Initial release of vscode-gears.

### 0.1.0

Automatically start the language server, using a batch file.

### 0.1.1

Directly start the language server using java -jar %PAGEN\_SERVER\_JAR%.

### 0.1.2

Add a color theme and update the syntax highlighter.

### 0.1.3

Add log output highlighting. 

### 0.1.4

Start from port 9542 instead of 8000.

### 0.1.5

Fix an issue with connecting to the language server at startup.

### 0.1.6

Add keywords and extend syntax highlighter.

### 0.1.7

Improve logging.

### 0.1.8

Add snippets. Thanks to Edwin Hendriks! Use control+shift+alt+s to open and select snippets. 

### 0.1.9

Update dependencies and allow quotes around the value of the "PAGEN\_SERVER\_JAR" environment variable.

### 0.2.0

Improve parsing of floating-point literals.

### 0.2.1

Add highlighting for "sorted by", "ascending", "descending".
Wait a couple of seconds before trying to connect to the language server.

### 0.2.2

Add highlighting for "startable by".

### 0.2.3

Add highlighting for "autovalue".
