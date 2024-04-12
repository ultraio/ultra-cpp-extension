import * as vscode from 'vscode';
import * as Service from '../service/index';
import * as Utility from '../utility/index';
import * as glob from 'glob';
import * as fs from 'fs';
import { ABI, Serializer } from "@wharfkit/antelope";

let disposable: vscode.Disposable;

async function register() {
    disposable = vscode.commands.registerCommand(Service.command.commandNames.deployContract, async () => {
        if (!Service.wallet.exists()) {
            vscode.window.showInformationMessage('No wallet available.');
            return;
        }

        const wasmFiles = glob.sync(Utility.files.getWorkspaceFolder() + '/**/*.wasm');
        if (wasmFiles.length <= 0) {
            vscode.window.showInformationMessage('No compiled contracts available.');
            return;
        }

        const items = wasmFiles.map((x) => {
            x = x.replace(/\\/gm, '/');
            const splitFilePath = x.split('/');
            const fileName = splitFilePath[splitFilePath.length - 1];
            return { label: fileName, description: x };
        });

        const filePath = await Utility.quickPick.create({
            title: 'Select Contract',
            items,
            placeholder: 'Type / Use Arrow Keys',
        });

        if (!filePath) {
            vscode.window.showErrorMessage('No contract was selected.');
            return;
        }

        const api = await Service.api.getSignable();
        if (!api) {
            vscode.window.showErrorMessage('Could not create signable API. Wrong password? Bad endpoint?');
            return;
        }

        const signer = await Utility.quickInput.create({
            title: 'What account are we deploying to?',
            placeHolder: 'myacc@active',
            value: '',
        });

        if (!signer) {
            vscode.window.showErrorMessage('Account to deploy to was not provided.');
            return;
        }

        let [actor, permission] = signer.split('@');
        if (!permission) {
            permission = 'active';
        }

        const wasm = fs.readFileSync(filePath).toString('hex');
        const abiPath = filePath.replace('.wasm', '.abi');
        if (!fs.existsSync(abiPath)) {
            vscode.window.showErrorMessage('ABI file does not exist for provided contract.');
            return;
        }

        let abiJson = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));

        const encodedAbi = Serializer.encode({
            object: ABI.from(abiJson),
        });

        const abiHex = Buffer.from(encodedAbi.array).toString('hex');

        const authorization = [{ actor, permission }];
        const outputChannel = Utility.outputChannel.get();

        const transactionResult = await api
            .transact(
                [
                    {
                        authorization,
                        account: 'eosio',
                        name: 'setcode',
                        data: {
                            account: actor,
                            vmtype: 0,
                            vmversion: 0,
                            code: wasm,
                        },
                    },
                    {
                        authorization,
                        account: 'eosio',
                        name: 'setabi',
                        data: {
                            account: actor,
                            abi: abiHex,
                        },
                    }
                ]
            )
            .catch((err) => {
                outputChannel.appendLine(err);
                outputChannel.show();
                return undefined;
            });

        if (!transactionResult) {
            outputChannel.appendLine('Could not deploy contract.');
            outputChannel.show();
        } else if (typeof transactionResult.data === 'string') {
            outputChannel.appendLine(transactionResult.data);
            outputChannel.show();
        } else {
            outputChannel.appendLine(JSON.stringify(transactionResult, null, 2));
            outputChannel.show();
        }
    });

    const context = await Utility.context.get();
    context.subscriptions.push(disposable);

    return () => {
        if (!disposable) {
            return;
        }

        disposable.dispose();
    };
}

Service.command.register('deployContract', register);
