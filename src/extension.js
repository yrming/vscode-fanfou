const vscode = require('vscode');
const Fanfou = require('fanfou-sdk');
const Timeline = require('./timelineProvider');
const TimelineCommands = require('./timelineCommands');

function activate(context) {
  const { consumerKey, consumerSecret, username, password } = vscode.workspace.getConfiguration('vsCodeFanfou');
	if (!consumerKey || !consumerSecret || !username || !password) {
    vscode.window.showErrorMessage('VSCode Fanfou / 请设置你的饭否账号和密码(设置->搜索VSCode Fanfou)，然后重启VSCode Fanfou。', { modal: true }, { title: '设置' }).then((value) => {
      if (value !== undefined) {
        vscode.commands.executeCommand('workbench.action.openGlobalSettings');
      } else {
        vscode.window.showErrorMessage('请设置你的饭否账号和密码，然后重启VSCode Fanfou。');
      }
    });
  }
	const client = new Fanfou({
    consumerKey: consumerKey,
    consumerSecret: consumerSecret,
    username: username,
    password: password
  });
  new Timeline(context, client);
  new TimelineCommands(context, client);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
