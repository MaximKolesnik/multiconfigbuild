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
	"buildCommands": [
		{
			"commandType": "build",
			"command": ""
		},
		{
			"commandType": "buildCurrentFile",
			"command": ""
		},
		{
			"commandType": "debug",
			"command": ""
		},
		{
			"commandType": "run",
			"command": ""
		},
		{
			"commandType": "clean",
			"command": ""
		}
	]
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

Note that there is built in parameter currentFile. which is the path for active file relative to your worspace directory

```
"buildCommands": [
{
	"commandType": "build",
	"command": "clang++ $mcb{Optimization}$"
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

Right now buildCurrentFile command works only with .c and .cpp file. As the extension was developed mainly for c/c++, it is not clear if this functionality has any uses in other languages. This can be fixed if there is any need.

## Release Notes

### 1.0.0

Initial release of MCB

-----------------------------------------------------------------------------------------------------------

### For more information

Visit https://github.com/MaximKolesnik/multiconfigbuild

**Enjoy!**
