import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { MCBHistoryConfigType } from './MCBHistoryConfigType';
import { ConfigType } from './ConfigType';

export class MCBHistory
{
	constructor()
	{
		this._configTypes = new Array;
		this.initialize();
	}

	save()
	{
		fs.writeFileSync(this.getHistoryPath(), JSON.stringify(this, null, '\t'));
	}

	get isEmpty()
	{
		return this._configTypes.length == 0;
	}

	getLastOptionOfType(type: string)
	{
		var foundVal = this._configTypes.find((elem) => elem.configType == type);
		if (!foundVal)
		{
			vscode.window.showErrorMessage(
				"Cannot update history. Config type is invalid");
			return;
		}

		return foundVal.lastOption;
	}

	setLastOptionOfType(type: string, lastOption: string)
	{
		var foundVal = this._configTypes.find((elem) => elem.configType == type);
		if (foundVal)
		{
			foundVal.lastOption = lastOption;
		}
		else
		{
			this._configTypes.push(new MCBHistoryConfigType(type, lastOption));
		}
	}

	updateToNewConfig(configs: ConfigType[])
	{
		var length = this._configTypes.length - 1;
		while (length >= 0)
		{
			var index = configs.findIndex(
				(elem) => elem.name == this._configTypes[length].configType);
			if (index == -1)
			{
				this._configTypes.splice(length, 1);
			}

			--length;
		}

		for (let config of configs)
		{
			const index = this._configTypes.findIndex(
				(elem) => elem.configType == config.name);
			if (index == -1)
			{
				this._configTypes.push(new MCBHistoryConfigType(config.name,
					config.options[0].name));
			}
		}
	}

	private getHistoryPath() : string
	{
		if (vscode.workspace.workspaceFolders !== undefined)
		{
			return path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,
				'.vscode', 'mcb.history.json');
		}

		return '';
	}

	private initialize()
	{
		var historyPath = this.getHistoryPath();

		if (fs.existsSync(historyPath))
		{
			var obj = new Object(JSON.parse(fs.readFileSync(historyPath, 'utf8')));

			let entries = new Map(Object.entries(obj));

			if (!entries.has('_configTypes'))
			{
				vscode.window.showErrorMessage("Failed to initialize history");
				return;
			}

			for (let confType of entries.get('_configTypes'))
			{
				let variants = new Map(Object.entries(new Object(confType)));
				this._configTypes.push(
					new MCBHistoryConfigType(variants.get('_configType'),
					variants.get('_lastOption')));
			}
		}
		else
		{
			fs.writeFileSync(historyPath, JSON.stringify(this, null, '\t'));
		}
	}

	private _configTypes: MCBHistoryConfigType[];
}
