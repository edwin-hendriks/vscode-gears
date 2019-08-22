# vscode-gears README

Support for SMART notation v3.0 (requirements specification language) as supported by GEARS (see www.xlrit.com).

To publish, see https://code.visualstudio.com/docs/extensions/publish-extension.

# Prerequisites

The environment variable "GEARS\_HOME" must point to the GEARS installation folder.

# How to use

For now only syntax highlighting and snippets. 

For snippets either press CTRL+SHIFT+P, type 'snip', choose 'Insert snippet' before choosing the snippet you want. Each snippet is documented explaining what it is for and how to use it. All snippets can also be selected after typing the first characters except the 'todef' snippet. This snippet requires you to select text first and choose snippet using CTRL+SHIFT+P as shown below:
![todef snippet demo](https://github.com/edwin-hendriks/vscode-gears/blob/master/img/snippet_todef.gif?raw=true)