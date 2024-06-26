import * as vscode from 'vscode';
import * as Service from '../service/index';

let disposableStatusBar: vscode.StatusBarItem | undefined;

function register() {
    disposableStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    disposableStatusBar.text = 'ᕫ Compile';
    disposableStatusBar.command = Service.command.commandNames.buildContract;
    disposableStatusBar.tooltip = 'Compile the smart contract in the active text editor.';
    disposableStatusBar.show();
}

export function showStatusBar() {
    if (!disposableStatusBar) {
        register();
    }

    disposableStatusBar!.show();

}

export function hideStatusBar() {
    if (!disposableStatusBar) {
        register();
    }

    disposableStatusBar!.hide();
}

export function enable() {
    if (disposableStatusBar) {
        disposableStatusBar.text = 'ᕫ Compile';
        disposableStatusBar.command = Service.command.commandNames.buildContract;
        disposableStatusBar.backgroundColor = undefined;
    }
}

export function disable() {
    if (disposableStatusBar) {
        disposableStatusBar.text = 'ᕫ Compiling';
        disposableStatusBar.command = undefined;
        disposableStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
}

export function dispose() {
    if (disposableStatusBar) {
        disposableStatusBar.dispose();
        disposableStatusBar = undefined;
    }
}
