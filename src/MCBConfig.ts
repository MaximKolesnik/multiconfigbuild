import { ConfigType } from './ConfigType';
import { BuildCommand } from './BuildCommand';
import { Deserializable } from './Deserializable';

export class MCBConfig implements Deserializable<MCBConfig>
{
	constructor()
	{
		this._configTypes = new Array(new ConfigType);
		this._buildCommands = new Array(
				new BuildCommand('build'),
				new BuildCommand('buildCurrentFile'),
				new BuildCommand('debug'),
				new BuildCommand('run'));
	}

	get configTypes()
	{
		return this._configTypes;
	}

	deserialize(input: Object)
	{
		this._configTypes = new Array;
		this._buildCommands = new Array;

		let entries = new Map(Object.entries(input));
		for (let confType of entries.get('_configTypes'))
		{
			var newConfType = new ConfigType;
			newConfType.deserialize(confType);
			this._configTypes.push(newConfType);
		}

		for (let buildCommand of entries.get('_buildCommands'))
		{
			var newCommand = new BuildCommand('undefined');
			newCommand.deserialize(buildCommand);
			this._buildCommands.push(newCommand);
		}
	}

	private _configTypes: ConfigType[];
	private _buildCommands: BuildCommand[];
}
