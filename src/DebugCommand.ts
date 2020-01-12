import * as vscode from 'vscode';
import { DebugConfiguration } from "vscode";
import { Parser } from './Parser'
import { ConfigType } from './ConfigType'
import { MCBHistory } from './MCBHistory'

export class DebugCommand
{
	static fromJSON(json: DebugCommandJSON) : DebugCommand
	{
		let instance = Object.create(DebugCommand.prototype);
		instance = Object.assign(instance, {}, json);

		return instance;
	}

	static reviver(key: string, value: any): any {
		return key === "" ? DebugCommand.fromJSON(value) : value;
	}

	async executeCommand(configTypes: ConfigType[], history: MCBHistory)
	{
		if (!Reflect.has(this, 'name') || !Reflect.has(this, 'type')
			|| !Reflect.has(this, 'request'))
		{
			throw('Debug must contain name, type and request');
		}

		if (!vscode.workspace.workspaceFolders)
		{
			throw('Workspace is not valid');
		}

		var debugConf : any = new CustomDebugConf(Reflect.get(this, 'name'),
			Reflect.get(this, 'type'), Reflect.get(this, 'request'));
		
		for (let k in this)
		{
			if (k == 'name' || k == 'type' || k == 'request')
			{
				continue;
			}
			
			debugConf[k] = Reflect.get(this, k);
		}

		this.parseProperties(debugConf, configTypes, history);

		var session = vscode.debug.startDebugging(
			vscode.workspace.workspaceFolders[0], debugConf);
		await session.then();
	}

	private parseProperties(root: any, configTypes: ConfigType[], history: MCBHistory)
	{
		for (let k in root)
		{
			var prop = Reflect.get(root, k);
			if (typeof prop == 'string')
			{
				root[k] = Parser.parse(prop, configTypes, history);
			}
			else if (typeof prop == 'object')
			{
				this.parseProperties(prop, configTypes, history);
			}
		}
	}
}

interface DebugCommandJSON
{
	[key: string]: any
}

class CustomDebugConf implements DebugConfiguration
{
	constructor(name: string, type: string, request: string)
	{
		this.name = name;
		this.type = type;
		this.request = request;
	}

	name: string;
	type: string;
	request: string;
}