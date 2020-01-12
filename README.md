# multiconfigbuild README

MultiConfigBuild(MCB) provides an ability to customize/switch your build chain on the fly

## Features

With the help of MCB you can issue build, buildCurrentFile, debug, run commands. When workspace is opened, Multi Configuration Build command must be issued to initialize the extension. This will create mcb.config.json file the user need to modify in order to customized build, buildCurrentFile, debug, run and clean commands.

```
{
	"version": "1.0.0",
	"configTypes": [
		{
			"name": "undefined",
			"options": [
				{
					"name": "default",
					"flags": "your flags"
				}
			]
		}
	],
	"build": {
		"command": ""
	},
	"buildCurrentFile": {
		"command": "",
		"extensions": ".c;.cpp"
	},
	"debug": {},
	"run": {
		"command": ""
	},
	"clean": {
		"command": ""
	}
}
```

In the config file the user should replace initial configType entry, for example, with Optimization.

```
"configTypes": [
	{
		"name": "Optimization",
		"options": [
			{
				"name": "Debug",
				"flags": "-g"
			},
			{
				"name": "Release",
				"flags": "-O2"
			}
		]
	}
]
```

This will create MCB Optimization button in the status bar, which when clicked opens quick pick to choose options. Flags can be provided for each options to be inserted to the command.

In the build command configTypes must be inserted in the command starting with $mcb{ and ending with }$

To be able to run debug command the user must fill out "debug", just if it is one of launch.json configurations. That means the user has to install one of the debugger extension. Basically, MCB constructs config for the debugger extension and launches it. Also it supports vscode variables like ${workspaceFolder}.

Note that there is built in parameter currentFile. which is the path for active file relative to your worspace directory

```
"build": {
		"command": "./build/linux_build build $mcb{Project}$"
	},
	"buildCurrentFile": {
		"command": "./build/linux_build buildCurrentFile $mcb{Project}$ $mcb{currentFile}$",
		"extensions": ".c;.cpp"
	},
	"debug": {
		"name": "mcb debug",
		"type": "cppdbg",
		"request": "launch",
		"program": "${workspaceFolder}/binaries/bin/$mcb{Project}$",
		"stopAtEntry": false,
		"cwd": "${workspaceFolder}",
		"setupCommands": [
			{
				"description": "Enable pretty-printing for gdb",
				"text": "-enable-pretty-printing",
				"ignoreFailures": false
			}
		]
	},
	"run": {
		"command": "./build/linux_build build $mcb{Project}$ && ./build/linux_build run $mcb{Project}$"
	},
	"clean": {
		"command": "./build/linux_build clean $mcb{Project}$"
	}
```

## Requirements

* At this time extension only works with workspaces
* The extension does not do any additional work under the hood to enhance build chain. For example, when run command is issued, the extension does not check if the executable is actually built. If the user requires such functionality he has to consider incorporating it into the command
* Reserved name: $mcb{currentFile}$

## Extension Settings

MCB contributes following commands:

* `multiConfigBuild.multiConfigurationBuild`: initialize extension
* `multiConfigBuild.build`
* `multiConfigBuild.debug`
* `multiConfigBuild.run`
* `multiConfigBuild.buildCurrentFile`
* `multiConfigBuild.clean`

By default MCB contributes following keybindings:

* `multiConfigBuild.build`: 					 `ctrl+shift+b`
* `multiConfigBuild.debug`: 					 `ctrl+shift+d`
* `multiConfigBuild.run`: 						 `ctrl+shift+r`
* `multiConfigBuild.buildCurrentFile`: `ctrl+shift+f7`
* `multiConfigBuild.clean`:						 `ctrl+shift+f9`

## Known Issues

## Release Notes

### 1.0.0

Initial release of MCB

-----------------------------------------------------------------------------------------------------------

### For more information

Visit https://github.com/MaximKolesnik/multiconfigbuild

**Enjoy!**
