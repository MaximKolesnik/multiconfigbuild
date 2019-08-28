import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as lodash from 'lodash';
import { stringify } from 'querystring';
import { MCBConfig } from './MCBConfig';
import { ConfigBuilder } from './ConfigBuilder'

export class MultiConfigurationBuild
{
	constructor(context: vscode.ExtensionContext)
	{
		this._context = context;
		this._mainCommandID = 'extension.multiConfigurationBuild';
		this._buildCommandID = 'extension.build';
		this._buildCurrentFileCommandID = 'extension.buildCurrentFile';
		this._debugCommandID = 'extension.debug';
		this._runCommandID = 'extension.run';
		this._configWatcher = undefined;
		this._config = new MCBConfig;
		this._configBuilder = new ConfigBuilder(context);

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
				this.readConfig();
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
		disposables.push(vscode.commands.registerCommand(this._buildCommandID,
			() =>
			{
				vscode.window.showInformationMessage('Build Command');
			}));
		disposables.push(vscode.commands.registerCommand(this._buildCurrentFileCommandID,
			() =>
			{
				vscode.window.showInformationMessage('Build Current Command');
			}));
		disposables.push(vscode.commands.registerCommand(this._debugCommandID,
			() =>
			{
				vscode.window.showInformationMessage('Debug Command');
			}));
		disposables.push(vscode.commands.registerCommand(this._runCommandID,
			() =>
			{
				vscode.window.showInformationMessage('Run Command');
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
		
		this.readConfig();
		vscode.workspace.openTextDocument(configPath).then(doc => {
			vscode.window.showTextDocument(doc);
		});
	}

	private initFileWatcher()
	{
		this._configWatcher = vscode.workspace.createFileSystemWatcher(this.getConfigPath());
		this._configWatcher.onDidChange((filename) => {
			if (filename.fsPath === this.getConfigPath())
			{
				this.onConfigFileChangedCallback();
			}
		});
		this._configWatcher.onDidDelete((filename) => {
			if (filename.fsPath === this.getConfigPath())
			{
				this.onConfigFileDeletedCallback();
			}
		});
	}

	private onConfigFileChangedCallback()
	{
		this.readConfig();
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
		this._configBuilder.destroy();
		this._initialized = false;
	}

	private readConfig()
	{
		this._config.deserialize(JSON.parse(fs.readFileSync(this.getConfigPath(), 'utf8')));
		this._configBuilder.rebuild(this._config);
	}

	private _context: vscode.ExtensionContext;
	private _initialized = false;
	private readonly _mainCommandID: string;
	private readonly _buildCommandID: string;
	private readonly _buildCurrentFileCommandID: string;
	private readonly _debugCommandID: string;
	private readonly _runCommandID: string;
	private _configWatcher: vscode.FileSystemWatcher | undefined;
	private _config: MCBConfig;
	private _configBuilder: ConfigBuilder;
}
