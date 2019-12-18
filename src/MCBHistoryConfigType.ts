export class MCBHistoryConfigType
{
	constructor(configType: string, lastOption: string)
	{
		this._configType = configType;
		this._lastOption = lastOption;
	}

	get configType()
	{
		return this._configType;
	}

	get lastOption()
	{
		return this._lastOption;
	}

	set lastOption(val: string)
	{
		this._lastOption = val;
	}

	private _configType: string;
	private _lastOption: string;
}
