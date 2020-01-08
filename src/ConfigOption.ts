export class ConfigOption
{
	constructor(
		private _name: string = "default",
		private _flags: string = "your flags")
	{
	}

	toJSON()
	{
		var obj = 
			{
				name: this._name,
				flags: this._flags
			};
		
		return obj;
	}

	static fromJSON(json: ConfigOptionJSON) : ConfigOption
	{
		let instance = Object.create(ConfigOption.prototype);
		instance = Object.assign(instance, {},
			{
				_name: json.name,
				_flags: json.flags
			});

		return instance;
	}

	static reviver(key: string, value: any): any {
		return key === "" ? ConfigOption.fromJSON(value) : value;
	}

	get name()
	{
		return this._name;
	}

	get flags()
	{
		return this._flags;
	}
}

interface ConfigOptionJSON
{
	name: string;
	flags: string;
}
