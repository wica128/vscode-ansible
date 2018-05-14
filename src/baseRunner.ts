"use strict";

import * as vscode from "vscode";
import { Constants } from "./constants";
import * as utilties from "./utilities";
import * as path from "path";
import { OutputChannel } from "vscode";
import * as utilities from './utilities';

export enum Option {
    docker = "Docker",
    local = "Local"
}


export abstract class BaseRunner {
    protected _outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this._outputChannel = outputChannel;
    }

    protected output(label: string, message: string): void {
        this._outputChannel.append(`[${label}] ${message}`);
    }

    protected outputLine(label: string, message: string): void {
        this._outputChannel.appendLine(`[${label}] ${message}`);
    }

    protected isWindows(): boolean {
        return process.platform === 'win32';
    }

    public runPlaybook(playbook: string): void {
        
        if ( playbook === undefined ){
            var usePlaybook = utilities.getCodeConfiguration<string>(null, Constants.Config_usePlaybook);
            if ( usePlaybook !== '' ){
                if (path.basename(usePlaybook) === usePlaybook ){
                    playbook = vscode.workspace.workspaceFolders[0].uri.fsPath + '/' + usePlaybook
                }else{
                    playbook = usePlaybook
                }
            }
        }
        if (!playbook) {
            playbook = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.fileName : null;
            vscode.window.showInputBox({ value: playbook, prompt: 'Please input playbook name', placeHolder: 'playbook', password: false })
                .then((input) => {
                    if (input != undefined && input != '') {
                        playbook = input;
                    } else {
                        return;
                    }

                    if (this.validatePlaybook(playbook)) {
                        return this.runPlaybookInternal(playbook);
                    }
                })
        } else {
            if (this.validatePlaybook(playbook)) {
                this._outputChannel.appendLine('Validated playbook ' + playbook);
                this._outputChannel.show();
                return this.runPlaybookInternal(playbook);
            }
        }
    }

    protected validatePlaybook(playbook: string): boolean {
        if (!utilties.validatePlaybook(playbook)) {
            return false;
        }

        return true;
    }

    protected abstract runPlaybookInternal(playbook: string);
}

