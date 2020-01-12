import * as vscode from 'vscode';
import * as path from 'path';
import { ConfigType } from './ConfigType'
import { MCBHistory } from './MCBHistory'

export class Parser
{
	static parse(command: string, configTypes: ConfigType[], history: MCBHistory)
	{
		const openingSym = '$mcb{';
		const openingLength = openingSym.length;
		const closingSym = '}$';
		const closingLength = closingSym.length;

		var currIndex = 0;
		var parsedCommand = '';

		if (!history)
		{
			throw "History is not initialized";
		}

		while (true)
		{
			let nextIndex =	command.indexOf(openingSym, currIndex);
			if (nextIndex == -1)
			{
				if (parsedCommand.length == 0 && command.length != 0)
				{
					parsedCommand = command;
				}

				break;
			}

			var t = command.substring(currIndex, nextIndex == -1 ? command.length : nextIndex);
			parsedCommand += t;

			let closingIndex = command.indexOf(closingSym, nextIndex);

			{
				let sanityCheck = command.indexOf(openingSym, nextIndex + 1);
				if (closingIndex == -1 || (sanityCheck != -1 && sanityCheck < closingIndex))
				{
					throw "Parser failed";
				}
			}

			var configName = command.substring(nextIndex + openingLength, closingIndex);

			// special case
			if (configName == "currentFile")
			{
				if (!vscode.window.activeTextEditor
					|| vscode.workspace.workspaceFolders == undefined)
				{
					throw 'Cannot resolve current file path';
				}

				const filePath = vscode.window.activeTextEditor.document.fileName;
				const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
				parsedCommand += path.relative(workspacePath, filePath);
			}
			else
			{
				var configType = configTypes.find((elem) => elem.name == configName);

				if (!configType)
				{
					throw 'Unrecognized config ' + configName;
				}

				var lastOptionName = history.getLastOptionOfType(configName);
				var option = configType.options.find(
					(elem) => elem.name == lastOptionName);

				if (!option)
				{
					throw 'Uncrecognized option of ' + configName;
				}

				parsedCommand += option.flags;
			}

			currIndex = closingIndex + closingLength;
		}

		return parsedCommand;
	}
}
