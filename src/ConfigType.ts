import { ConfigOption } from './ConfigOption'
import { Deserializable } from './Deserializable';

export class ConfigType implements Deserializable<ConfigType>
{
	constructor()
	{
		this._name = "undefined";
		this._options = new Array(new ConfigOption);
	}

	get name()
	{
		return this._name;
	}

	get options()
	{
		return this._options;
	}

	deserialize(input: Object)
	{
		this._options = new Array;

		let entries = new Map(Object.entries(input));
		this._name = entries.get('_name');
		for (let option of entries.get('_options'))
		{
			var newConfOption = new ConfigOption;
			newConfOption.deserialize(option);
			this._options.push(newConfOption);
		}
	}

	private _name: string
	private _options: ConfigOption[];
}
