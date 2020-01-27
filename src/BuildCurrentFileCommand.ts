import * as path from 'path';
import * as vscode from "vscode";
import { Parser } from './Parser'
import { ConfigType } from './ConfigType'
import { MCBHistory } from './MCBHistory'

export class BuildCurrentFileCommand
{
	constructor()
	{
		this._command = "";
		this._extensions = ".c;.cpp";
	}

	toJSON()
	{
		var obj =
			{
				command: this._command,
				extensions: this._extensions
			};
		
		return obj;
	}

	static fromJSON(json: BuildCurrentFileCommandJSON) : BuildCurrentFileCommand
	{
		let instance = Object.create(BuildCurrentFileCommand.prototype);
		instance = Object.assign(instance, {},
			{
				_command: json.command,
				_extensions: json.extensions
			});

		return instance;
	}

	static reviver(key: string, value: any): any
	{
		return key === "" ? BuildCurrentFileCommand.fromJSON(value) : value;
	}

	executeCommand(terminal: vscode.Terminal | undefined, configTypes: ConfigType[], history: MCBHistory)
	{
		if (!terminal)
		{
			throw('Terminal is not available');
		}

		if (!vscode.window.activeTextEditor)
		{
			throw('No active text editor');
		}

		if (!vscode.workspace || !vscode.workspace.rootPath)
		{
			throw('Workspace is not valid');
		}
		
		const filePath = vscode.window.activeTextEditor.document.fileName;
		const extension = path.extname(filePath);

		if (this._extensions.length == 0 || !this.isValidExtension(extension))
		{
			throw('Cannot compile files with extension ' + extension);
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

	private isValidExtension(ext: string)
	{
		var extList = this._extensions.split(';');
		return extList.find(elem =>  elem == ext ) != undefined;
	}

	private _command: string;
	private _extensions: string;
}

interface BuildCurrentFileCommandJSON
{
	command: string;
	extensions: string;
}
