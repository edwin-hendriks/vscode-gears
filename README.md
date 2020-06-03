# vscode-gears README

Support for SMART notation v3.0 (requirements specification language) as supported by GEARS (see www.xlrit.com).

To publish, see https://code.visualstudio.com/docs/extensions/publish-extension.

# Prerequisites

- GEARS must be installed (to be able to generate)
- OpenJDK 1.8 or higher must be installed (to be able to compile)
- Docker must be installed (to be able to deploy)
- The environment variable "GEARS\_HOME" must point to the GEARS installation folder.
- A docker-compose.yml file must be somewhere in the workspace (to be able to start the right docker container).

Example content docker-compose-yml:

    version: '3'
    services:
    runtime:
        image: "xlrit/gears-runtime:0.3.3"
        container_name: "gears-runtime"
        ports:
        - "8080:8080"
        - "9990:9990"
        - "110:110"
        - "25:25"


# How to use

## Snippets

For snippets either press CTRL+SHIFT+P, type 'snip', choose 'Insert snippet' before choosing the snippet you want. Each snippet is documented explaining what it is for and how to use it. All snippets can also be selected after typing the first characters except the 'todef' snippet. This snippet requires you to select text first and choose snippet using `CTRL+SHIFT+P` as shown below:

![todef snippet demo](https://github.com/edwin-hendriks/vscode-gears/blob/master/img/snippet_todef.gif?raw=true)

## Tasks

Press `CTRL+SHIFT+P`, choose `Run tasks`, then choose `gears`, then choose which task. They are already ordered in a preferred order first generate, then test, then build, then deploy. You need a `settings.json` in the `.vscode` folder of your workspace to make this work. Below is example of the content of this file.

    {
        "gears.generator.version": "0.24",
        "gears.runner.version": "0.1",
        "project.name": "LeaveOfAbsence",
        "project.version": "0.1-SNAPSHOT",
    }

Below is an example demo of how to call the task gears: Generate:

![Run task gears generate demo](https://github.com/edwin-hendriks/vscode-gears/blob/master/img/task_gears_generate.gif?raw=true)
