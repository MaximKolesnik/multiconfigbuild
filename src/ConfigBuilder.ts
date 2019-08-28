import * as vscode from 'vscode';
import { MCBConfig } from './MCBConfig';
import { ConfigType } from './ConfigType';

export class ConfigBuilder
{

	constructor(context: vscode.ExtensionContext)
	{
		this._context = context;
		this._statusBarItems = new Map;
		this._statusBarCommands = new Array;
	}

	rebuild(config: MCBConfig)
	{
		this.destroy();
		
		config.configTypes.forEach(elem =>
			{
				var item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
				var commandId = elem.name + 'FlagPicker';
				let options: string[] = [];

				elem.options.forEach(option =>
					{
						options.push(option.name);
					});

				var commandDisp = vscode.commands.registerCommand(commandId, () =>
				{
					vscode.window.showQuickPick(options, {placeHolder: 'Select Option', canPickMany: false});
				});
				this._statusBarCommands.push(commandDisp);
				item.command = commandId;
				item.text = 'MCB ' + elem.name;
				item.show();
				this._statusBarItems.set(elem.name, item);
				this._context.subscriptions.push(item);
			});
	}

	destroy()
	{
		this._statusBarItems.forEach(element => {
			element.dispose();
		});
		this._statusBarItems = new Map;
		this._statusBarCommands.forEach(value => {
			value.dispose();
		});
		this._statusBarCommands = new Array;
	}

	private _context: vscode.ExtensionContext;
	private _statusBarItems: Map<string, vscode.StatusBarItem>;
	private _statusBarCommands: vscode.Disposable[];
}
