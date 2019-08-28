import { Deserializable } from './Deserializable';

export class BuildCommand implements Deserializable<BuildCommand>
{
	constructor(commandType: string)
	{
		this._commandType = commandType;
		this._command = "";
	}

	get command()
	{
		return this._command;
	}

	get commandType()
	{
		return this._commandType;
	}

	deserialize(input: Object)
	{
		let entries = new Map(Object.entries(input));

		this._command = entries.get('_command');
		this._commandType = entries.get('_commandType');
	}

	private _commandType: string;
	private _command: string;
}
