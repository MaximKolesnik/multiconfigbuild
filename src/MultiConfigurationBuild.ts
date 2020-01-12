import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { MCBConfig } from './MCBConfig';

export class MultiConfigurationBuild
{
	constructor(context: vscode.ExtensionContext)
	{
		this._context = context;
		this._mainCommandID = 'multiConfigBuild.multiConfigurationBuild';
		this._configWatcher = undefined;
		this._config = new MCBConfig(context);
		this._context = context;
		this._statusBarItems = new Map;
		this._statusBarCommands = new Array;
		this.tryInitialize();
	}

	private tryInitialize()
	{
		if (vscode.workspace.workspaceFolders == undefined
			|| vscode.workspace.workspaceFolders.length == 0)
		{
			vscode.window.showInformationMessage('MultiConfiguration requires a workspace');
		}
		else
		{
			let configPath = this.getConfigPath();

			if (fs.existsSync(configPath))
			{
				this.prepareConfig();
				this.initFileWatcher();
				this._initialized = true;
			}
			else
			{
				vscode.window.showInformationMessage('Run multiConfigurationBuild to configure');
			}
		}

		this.initializeCommands();
	}

	private initializeCommands()
	{
		var disposables:vscode.Disposable[] = new Array;

		disposables.push(vscode.commands.registerCommand(this._mainCommandID,
			() =>
			{
				this.mainCommandCallback();
			}));

		disposables.forEach((entry) =>
			{
				this._context.subscriptions.push(entry);
			});
	}

	private isWorkspaceReady() : boolean
	{
		return vscode.workspace.workspaceFolders !== undefined
			&& vscode.workspace.workspaceFolders.length !== 0
	}

	private getConfigPath() : string
	{
		if (vscode.workspace.workspaceFolders !== undefined)
		{
			return path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,
				'.vscode', 'mcb.config.json');
		}

		return '';
	}

	private getVSCodePath() : string
	{
		if (vscode.workspace.workspaceFolders !== undefined)
		{
			return path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,
				'.vscode');
		}
		
		return '';
	}

	private mainCommandCallback()
	{
		if (!this.isWorkspaceReady())
		{
			vscode.window.showInformationMessage('MultiConfiguration requires a workspace');
			return;
		}

		let configPath = this.getConfigPath();

		if (!this._initialized)
		{
			if (!fs.existsSync(this.getVSCodePath()))
			{
				fs.mkdirSync(this.getVSCodePath());
			}

			if (!fs.existsSync(configPath))
			{
				fs.writeFileSync(configPath, JSON.stringify(this._config, null, '\t'));
			}

			this.initFileWatcher();
			this._initialized = true;
		}
		
		this.prepareConfig();
		vscode.workspace.openTextDocument(configPath).then(doc =>
			{
				vscode.window.showTextDocument(doc);
			});
	}

	private initFileWatcher()
	{
		this._configWatcher = vscode.workspace.createFileSystemWatcher(this.getConfigPath());
		this._configWatcher.onDidChange((filename) =>
			{
				if (filename.fsPath === this.getConfigPath())
				{
					this.onConfigFileChangedCallback();
				}
			});
		this._configWatcher.onDidDelete((filename) =>
		{
			if (filename.fsPath === this.getConfigPath())
			{
				this.onConfigFileDeletedCallback();
			}
		});
	}

	private onConfigFileChangedCallback()
	{
		this.prepareConfig();
		vscode.window.showInformationMessage('MCB config was changed. Build commands were rebuilt!');
	}

	private onConfigFileDeletedCallback()
	{
		vscode.window.showWarningMessage('MCB config file was removed!');
		this.finalize();
	}

	private finalize()
	{
		if (this._configWatcher !== undefined)
		{
			this._configWatcher.dispose();
		}
		this.destroyConfigSelection();
		this._config.cleanup();
		this._initialized = false;
	}

	private prepareConfig()
	{
		this._config.cleanup();
		this._config = JSON.parse(
			fs.readFileSync(this.getConfigPath(), 'utf8'),
			MCBConfig.reviver);
		this._config.prepare(this._context);
		this.prepareConfigSelection();
	}

	private prepareConfigSelection()
	{
		let history = this._config.history;
		let configTypes = this._config.configTypes;

		this.destroyConfigSelection();

		configTypes.forEach(elem =>
			{
				var item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
				var commandId = elem.name + 'FlagPicker';
				let options: string[] = [];

				if (!history)
				{
					vscode.window.showErrorMessage("History is not initialized");
					return;
				}

				elem.options.forEach(option =>
					{
						options.push(option.name);
					});

				var commandDisp = vscode.commands.registerCommand(commandId, async () =>
				{
					if (!history)
					{
						vscode.window.showErrorMessage("History is not initialized");
						return;
					}

					const selection = await vscode.window.showQuickPick(
						options, {placeHolder: 'Select Option', canPickMany: false});

					if (selection)
					{
						var statusBarItem = this._statusBarItems.get(commandId);
						if (statusBarItem)
						{
							var configType = configTypes.find(
								(element) => element.name == elem.name);

							if (!configType)
							{
								vscode.window.showErrorMessage(
									'Cannot find config type' + elem.name);
								return;
							}

							var option = configType.options.find(
								(element) => element.name == selection);

							if (!option)
							{
								vscode.window.showErrorMessage(
									'Cannot find option' + elem.name);
								return;
							}

							history.setLastOptionOfType(configType.name, option.name);
							history.save();
							statusBarItem.text = 'MCB ' + elem.name + ' : ' + selection;
						}
					}
				});

				this._statusBarCommands.push(commandDisp);
				item.command = commandId;
				item.text = 'MCB ' + elem.name + ' : ' + history.getLastOptionOfType(elem.name);
				item.show();
				this._statusBarItems.set(commandId, item);
				this._context.subscriptions.push(item);
			});
	}

	private destroyConfigSelection()
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
	private _initialized = false;
	private readonly _mainCommandID: string;
	private _configWatcher: vscode.FileSystemWatcher | undefined;
	private _config: MCBConfig;
	private _statusBarItems: Map<string, vscode.StatusBarItem>;
	private _statusBarCommands: vscode.Disposable[];
}
