export class BuildCommand
{
	constructor(commandType: string)
	{
		this._commandType = commandType;
		this._command = "";
	}

	toJSON()
	{
		var obj = 
			{
				commandType: this._commandType,
				command: this._command
			};
		
		return obj;
	}

	static fromJSON(json: BuildCommandJSON) : BuildCommand
	{
		let instance = Object.create(BuildCommand.prototype);
		instance = Object.assign(instance, {},
			{
				_commandType: json.commandType,
				_command: json.command
			});

		return instance;
	}

	static reviver(key: string, value: any): any {
		return key === "" ? BuildCommand.fromJSON(value) : value;
	}

	get command()
	{
		return this._command;
	}

	get commandType()
	{
		return this._commandType;
	}

	private _commandType: string;
	private _command: string;
}

interface BuildCommandJSON
{
	commandType: string;
	command: string;
}
