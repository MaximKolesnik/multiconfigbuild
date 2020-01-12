import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigType } from './ConfigType';
import { MCBHistory } from './MCBHistory';
import { GenericCommand } from './GenericCommand';
import { DebugCommand } from './DebugCommand';
import { BuildCurrentFileCommand } from './BuildCurrentFileCommand';
import { stringify } from 'querystring';

export class MCBConfig
{
	constructor(context: vscode.ExtensionContext)
	{
		var extensionPath = path.join(context.extensionPath, "package.json");
		var packageFile = JSON.parse(fs.readFileSync(extensionPath, 'utf8'));

		if (packageFile)
		{
			this._version = packageFile.version;
		}
		else
		{
			this._version = 'undefined'
		}

		this._context = context;
		this._configTypes = new Array(new ConfigType);
		this._build = new GenericCommand;
		this._buildCurrentFile = new BuildCurrentFileCommand;
		this._debug = new DebugCommand;
		this._run = new GenericCommand;
		this._clean = new GenericCommand;
		this._history = new MCBHistory;
		this._commandDisposables = new Array;
	}

	toJSON()
	{
		var objects = new Array;
		for (let t of this._configTypes)
		{
			objects.push(t.toJSON());
		}

		var obj = 
			{
				version: this._version,
				configTypes: objects,
				build: this._build.toJSON(),
				buildCurrentFile: this._buildCurrentFile.toJSON(),
				debug: this._debug,
				run: this._run.toJSON(),
				clean: this._clean.toJSON()
			};
		
		return obj;
	}

	static fromJSON(json: MCBConfigJSON) : MCBConfig
	{
		let instance = Object.create(MCBConfig.prototype);
		let configTypes = new Array;

		for (let val of json.configTypes)
		{
			configTypes.push(ConfigType.fromJSON(val));
		}

		instance = Object.assign(instance, {},
			{
				_version: json.version,
				_configTypes: configTypes,
				_build: GenericCommand.reviver("", json.build),
				_buildCurrentFile: BuildCurrentFileCommand.reviver("", json.buildCurrentFile),
				_debug: DebugCommand.reviver("", json.debug),
				_run: GenericCommand.reviver("", json.run),
				_clean: GenericCommand.reviver("", json.clean)
			});

		return instance;
	}

	static reviver(key: string, value: any): any {
		return key === "" ? MCBConfig.fromJSON(value) : value;
	}

	get configTypes()
	{
		return this._configTypes;
	}

	get history()
	{
		return this._history;
	}

	prepare(context: vscode.ExtensionContext)
	{
		this.cleanup();
		this._context = context;
		this.prepareHistory();
		this.prepareCommands();
	}

	cleanup()
	{
		if (this._commandDisposables)
		{
			this._commandDisposables.forEach(value => {
				value.dispose();
			});
		}

		this._commandDisposables = new Array;
	}

	private prepareHistory()
	{
		if (!this._history)
		{
			this._history = new MCBHistory;
		}

		if (this._history.isEmpty)
		{
			for (let config of this._configTypes)
			{
				this._history.setLastOptionOfType(config.name, config.options[0].name);
			}
		}
		else
		{
			this._history.updateToNewConfig(this._configTypes);
		}

		this._history.save();
	}

	private prepareCommands()
	{
		this._commandDisposables = new Array;
		this._commandDisposables.push(vscode.commands.registerCommand('multiConfigBuild.build',
			() =>
			{
				try
				{
					this.createTerminal();
					this._build.executeCommand(this._terminal, this._configTypes, this._history);
				}
				catch(e)
				{
					vscode.window.showErrorMessage('Cannot execute command. ' + e);
				}
			}));
		this._commandDisposables.push(vscode.commands.registerCommand('multiConfigBuild.buildCurrentFile',
			() =>
			{
				try
				{
					this.createTerminal();
					this._buildCurrentFile.executeCommand(this._terminal, this._configTypes, this._history);
				}
				catch(e)
				{
					vscode.window.showErrorMessage('Cannot execute command. ' + e);
				}
			}));
		this._commandDisposables.push(vscode.commands.registerCommand('multiConfigBuild.debug',
			() =>
			{
				try
				{
					this._debug.executeCommand(this._configTypes, this._history);
				}
				catch(e)
				{
					vscode.window.showErrorMessage('Cannot execute command. ' + e);
				}
			}));
		this._commandDisposables.push(vscode.commands.registerCommand('multiConfigBuild.run',
			() =>
			{
				try
				{
					this.createTerminal();
					this._run.executeCommand(this._terminal, this._configTypes, this._history);
				}
				catch(e)
				{
					vscode.window.showErrorMessage('Cannot execute command. ' + e);
				}
			}));
		this._commandDisposables.push(vscode.commands.registerCommand('multiConfigBuild.clean',
			() =>
			{
				try
				{
					this.createTerminal();
					this._clean.executeCommand(this._terminal, this._configTypes, this._history);
				}
				catch(e)
				{
					vscode.window.showErrorMessage('Cannot execute command. ' + e);
				}
			}));

		this._commandDisposables.forEach((entry) =>
			{
				this._context.subscriptions.push(entry);
			});
	}

	private createTerminal()
	{
		if (this._terminal)
		{
			this._terminal.dispose();
		}
		this._terminal = vscode.window.createTerminal('MCB terminal');
	}

	private _context: vscode.ExtensionContext;
	private _version: string;
	private _configTypes: ConfigType[];
	private _build: GenericCommand;
	private _buildCurrentFile: BuildCurrentFileCommand;
	private _debug: DebugCommand;
	private _run: GenericCommand;
	private _clean: GenericCommand;
	private _history: MCBHistory;

	private _commandDisposables: vscode.Disposable[];
	private _terminal: vscode.Terminal | undefined;
}

interface MCBConfigJSON
{
	version: string;
	configTypes: ConfigType[];
	build: GenericCommand;
	buildCurrentFile: BuildCurrentFileCommand;
	debug: DebugCommand;
	run: GenericCommand;
	clean: GenericCommand;
}
