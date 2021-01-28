# vscode-gears README

Support for SMART notation v3.0 (requirements specification language) as supported by GEARS (see www.xlrit.com).

To publish, adjust version number in package.json and use command `vsce publish` (for more details see https://code.visualstudio.com/docs/extensions/publish-extension).

# Prerequisites

- GEARS must be installed (to be able to generate)
- OpenJDK 1.8 or higher must be installed (to be able to compile)
- Docker must be installed (to be able to deploy)
- The environment variable "GEARS\_RELEASES" must point to the GEARS installation folder.
- A docker-compose.yml file must be somewhere in the workspace (to be able to start the right docker container).

Example content docker-compose-yml:

    version: '3'
    services:
    runtime:
        image: "xlrit/gears-runtime:v0.10"
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

Press `CTRL+SHIFT+P`, choose `Tasks: Run Task`, then choose `GEARS`, then choose which task. They are already ordered in a preferred order 1. Generate, 2. Diagrams, 3. Build, 4. Deploy, 5. Load data, 6. Run (test) scenarios. You need a `settings.json` in the `.vscode` folder of your workspace to make this work. Below is example of the content of this `settings.json` file.

    {
        "gears.project.name":      "leave_of_absence",
        "gears.project.version":   "0.1-SNAPSHOT",
        "gears.generator.version": "0.31",
        "gears.runner.version":    "0.3",
    }

Below is an example demo of how to call the task `GEARS: 1. Generate`:

![Run task gears generate demo](https://github.com/edwin-hendriks/vscode-gears/blob/master/img/task_gears_generate.gif?raw=true)

## Commands

We probably will move the tasks to commands which can be activated with CTRL+SHIP+P as most users of VS Code are used to. For now (as a test) we have only duplicated the task `GEARS 2. Diagrams` as the command `GEARS: Show Diagrams`. This is also an improved version of Diagrams because it will work on all platforms and you can choose the browser of you own liking. 
