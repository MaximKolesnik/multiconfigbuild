import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigType } from './ConfigType';
import { BuildCommand } from './BuildCommand';
import { MCBHistory } from './MCBHistory';
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

		this._configTypes = new Array(new ConfigType);
		this._buildCommands = new Array(
			new BuildCommand('build'),
			new BuildCommand('buildCurrentFile'),
			new BuildCommand('debug'),
			new BuildCommand('run'),
			new BuildCommand('clean'));
		this._history = undefined;
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
				buildCommands: this._buildCommands
			};
		
		return obj;
	}

	static fromJSON(json: MCBConfigJSON) : MCBConfig
	{
		let instance = Object.create(MCBConfig.prototype);
		let configTypes = new Array;
		let buildCommands = new Array;

		for (let val of json.configTypes)
		{
			configTypes.push(ConfigType.fromJSON(val));
		}

		for (let val of json.buildCommands)
		{
			buildCommands.push(BuildCommand.fromJSON(val));
		}

		instance = Object.assign(instance, {},
			{
				_version: json.version,
				_configTypes: configTypes,
				_buildCommands: buildCommands
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

	get buildCommands()
	{
		return this._buildCommands;
	}

	get history()
	{
		return this._history;
	}

	prepareHistory()
	{
		if (!this._history)
		{
			this._history = new MCBHistory;
		}

		if (this._history.isEmpty)
		{
			for (let config of this.configTypes)
			{
				this._history.setLastOptionOfType(config.name, config.options[0].name);
			}
		}
		else
		{
			this._history.updateToNewConfig(this.configTypes);
		}

		this._history.save();
	}

	private _version: string;
	private _configTypes: ConfigType[];
	private _buildCommands: BuildCommand[];
	private _history: MCBHistory | undefined;
}

interface MCBConfigJSON
{
	version: string;
	configTypes: ConfigType[];
	buildCommands: BuildCommand[];
}
