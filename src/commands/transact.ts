import * as vscode from 'vscode';
import * as Service from '../service/index';
import * as Utility from '../utility/index';
import { API } from '@ultraos/ultra-signer-lib';

async function register() {
    const disposable = vscode.commands.registerCommand(Service.command.commandNames.transact, async () => {
        if (!Service.wallet.exists()) {
            vscode.window.showErrorMessage('No wallet available.');
            return;
        }

        const endpoint = await Service.api.pick();
        if (!endpoint) {
            return;
        }

        const api = await Service.api.getSignable(endpoint).catch((err) => {
            console.log(err);
            return undefined;
        });
        if (!api) {
            vscode.window.showErrorMessage('Could not create signable API. Wrong password? Bad endpoint?');
            return;
        }

        const contract = await Utility.quickInput.create({
            title: 'Contract Account Name',
            placeHolder: 'eosio.token',
            value: '',
        });

        if (!contract) {
            return;
        }

        const ultraApi = await Service.api.getUltraApi(endpoint).catch((err) => {
            console.log(err);
            return undefined;
        });

        if (ultraApi === undefined) {
            console.log(`Undefined ultraAPi`);
            return undefined;
        }

        const result = await ultraApi.chain.getAbi(contract).catch((err) => {
            console.log(err);
            return undefined;
        });

        if (!result || !result.abi) { 
            vscode.window.showErrorMessage(`Account '${contract}' does not have a contract set`);
            return;
        }

        const actions: { [action: string]: Array<{ name: string; type: string }> } = {};
        for (let abiStruct of result.abi.structs) {
            const isAction = result.abi.actions.find((x) => x.name === abiStruct.name);
            if (!isAction) {
                continue;
            }

            if (!actions[abiStruct.name]) {
                actions[abiStruct.name] = [];
            }

            for (let field of abiStruct.fields) {
                actions[abiStruct.name].push({ name: field.name, type: field.type });
            }
        }

        const items = Object.keys(actions).map((x) => {
            return { label: x, description: x };
        });

        const action = await Utility.quickPick.create({
            title: 'Select Action / Type',
            items,
            placeholder: 'Use arrow keys, or type',
        });

        if (!action) {
            vscode.window.showErrorMessage(`No action was selected.`);
            return;
        }

        let actor: string = '', permission: string = '';

        while (actor.length <= 0) {
            // Ask for Signer
            const signer = await Utility.quickInput.create({
                title: 'Who is signing?',
                placeHolder: 'myacc@active',
                value: '',
            });

            if (!signer) {
                return;
            }

            [actor, permission] = signer.split('@');

            if (!permission) {
                permission = 'active';
            }

            try {
                // Ensure this account can be signed as
                const testTrx = await api.buildTransaction([{
                    account: 'eosio.token',
                    name: 'transfer',
                    authorization: [{ actor, permission }],
                    data: {from: actor, to: actor, quantity: '0.00000000 UOS', memo: ''}
                }]);
                const signature = await api.signTransaction(testTrx);
            } catch (err) {
                console.log(err);
                vscode.window.showErrorMessage(`Was not able to sign as ${signer}.`);
                actor = '';
            }
        }

        let formData: any;
        if (actions[action].length >= 1) {
            formData = await Utility.form.create(action, actions[action]);
        } else {
            formData = {};
        }

        if (!formData) {
            vscode.window.showErrorMessage(`Form was not filled out. Canceled transaction.`);
            return;
        }

        const outputChannel = Utility.outputChannel.get();
        const transactionResult = await api
            .transact(
                [
                    {
                        account: contract,
                        name: action,
                        authorization: [{ actor, permission }],
                        data: formData,
                    },
                ]
            )
            .catch((err) => {
                outputChannel.appendLine(err);
                outputChannel.show();
                return undefined;
            });

        if (!transactionResult) {
            outputChannel.appendLine('Failed to transact.');
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

Service.command.register('transact', register);
