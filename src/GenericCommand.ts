import * as vscode from 'vscode';
import { Parser } from './Parser'
import { ConfigType } from './ConfigType'
import { MCBHistory } from './MCBHistory'

export class GenericCommand
{
	constructor()
	{
		this._command = "";
	}

	toJSON()
	{
		var obj =
			{
				command: this._command
			};
		
		return obj;
	}

	static fromJSON(json: GenericCommandJSON) : GenericCommand
	{
		let instance = Object.create(GenericCommand.prototype);
		instance = Object.assign(instance, {},
			{
				_command: json.command
			});

		return instance;
	}

	static reviver(key: string, value: any): any {
		return key === "" ? GenericCommand.fromJSON(value) : value;
	}

	executeCommand(terminal: vscode.Terminal | undefined, configTypes: ConfigType[], history: MCBHistory)
	{
		if (!terminal)
		{
			throw('Terminal is not available');
		}

		try
		{
			vscode.workspace.saveAll(false);

			terminal.show(true);
			var t = Parser.parse(this._command, configTypes, history);
			terminal.sendText(t);
		}
		catch(e)
		{
			vscode.window.showErrorMessage('Failed to parse command. ' + e);
		}
	}

	private _command: string;
}

interface GenericCommandJSON
{
	command: string;
}
