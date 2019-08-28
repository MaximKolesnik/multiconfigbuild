import { Deserializable } from './Deserializable';

export class ConfigOption implements Deserializable<ConfigOption>
{
	constructor()
	{
		this._name = "default";
		this._flags = "your flags";
	}

	get name()
	{
		return this._name;
	}

	get flags()
	{
		return this._flags;
	}

	deserialize(input: Object)
	{
		let entries = new Map(Object.entries(input));

		this._name = entries.get('_name');
		this._name = entries.get('_flags');
	}

	private _name: string;
	private _flags: string;
}
