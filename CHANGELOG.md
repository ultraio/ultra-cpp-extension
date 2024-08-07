# Change Log

All notable changes to the "ultra-cpp" extension will be documented in this file.

## 1.4.2

- Renamed 'Contract Name' to 'Contract Account Name' to reduce the confusion
- Updated transaction creation flow to remove the extra API selection step

## 1.4.1
- Added Wharfkit support

## 1.3.9

- Fix issue where wallet could not be destroyed properly.
- Fix issue where wallet could not be created again after being destroyed.
- Added 'Wallet - Create Key' command

## 1.3.8

- Fix extension path issues.

## 1.3.7

- Add workflow to GitHub for automated publishing

## 1.3.6

- Fix status bar registration
- Dispose of status bars on extension de-activation
- Remember last API even after extension restart

## 1.3.5

- More verbose transaction errors
- Refactor command registration

## 1.3.4

- Add a couple of auto-complete snippets for making tables, and actions.
- Fix Double Wallet Prompts

## 1.3.3

- Move glob to dependency tree

## 1.3.1

- Remove DOM from tsconfig

## 1.3.0

- Add ability to transact
- Add ability to unlock / lock wallet
- Add ability to deploy smart contract

## 1.2.2

- Add missing commands to README and more information + roadmap.

## 1.2.1

- Make inputs work with focus out.

## 1.2.0

- Added Wallet Service with 'aes-256-cbc' encryption
- Private keys are stored in the global state of VSCode encrypted with a user password
- Added Commands
  - Wallet - Create
  - Wallet - List Public Keys
  - Wallet - Destroy
  - Wallet - Add Key

## 1.1.0

- Refactored code base
- Auto dispose of anything disposable on extension deactivation
- Added compile contract to status bar in VSCode
- Status bar item for compiling only shows when .cpp, .hpp, or .cc files are selected
- Status bar item changes when compilation is in progress
- Added new action to create a smart contract quickly
- Added new action to query against different APIs
- Added last used api to top of query list, when making query requests

## 1.0.3

- Downgraded VSCode Requirements
- Made contract selection use active text editor for compiling

## 1.0.0

- Refactor and fix startup processes.

## 0.0.6

- Ignore some files

## 0.0.5

- Upgrade contract-builder dependency to `1.0.4`
- Fixes double output in output terminal

## 0.0.4

- Better README

## 0.0.3

- Add C++ Build Tool Workflow with Docker

## 0.0.2

- Patch Library Issues

## 0.0.1

- Initial release, and testing
