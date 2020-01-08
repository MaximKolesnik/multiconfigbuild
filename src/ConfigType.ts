import { ConfigOption } from './ConfigOption'

export class ConfigType
{
	constructor(
		private _name: string = "undefined",
		private _options: Array<ConfigOption> = new Array(new ConfigOption))
	{
	}

	toJSON()
	{
		var obj = 
			{
				name: this._name,
				options: this._options
			};
		
		return obj;
	}

	static fromJSON(json: ConfigTypeJSON) : ConfigType
	{
		let instance = Object.create(ConfigType.prototype);
		let options = new Array;

		for (let val of json.options)
		{
			options.push(ConfigOption.fromJSON(val));
		}

		instance = Object.assign(instance, {},
			{
				_name: json.name,
				_options: options
			});

		return instance;
	}

	static reviver(key: string, value: any): any {
		return key === "" ? ConfigType.fromJSON(value) : value;
	}

	get name()
	{
		return this._name;
	}

	get options()
	{
		return this._options;
	}
}

interface ConfigTypeJSON
{
	name: string;
	options: Array<ConfigOption>;
}
