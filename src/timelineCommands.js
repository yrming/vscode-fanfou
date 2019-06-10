const vscode = require('vscode');

function getWebviewContent(imgurl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
    <img src="${imgurl}" />
</body>
</html>`;
}
class TimelineCommands {
  constructor(context, client) {
    vscode.commands.registerCommand('fanfouTimeline.seephoto', (node) => {
      const panel = vscode.window.createWebviewPanel('图片详情', '图片详情', vscode.ViewColumn.One, {});
      panel.webview.html = getWebviewContent(node.photoUrl);
    });
    vscode.commands.registerCommand('fanfouTimeline.send', () => {
      vscode.window.showInputBox({ placeHolder: '你在做什么？', prompt: '发送' }).then((value) => {
        if (value) {
          client
            .xauth()
            .then(() => {
              client
                .post('/statuses/update', { status: value })
                .then(() => {
                  vscode.window.showInformationMessage('发送成功');
                })
                .catch((ex) => {
                  vscode.window.showWarningMessage(`发送失败：${ex}`);
                });
            })
            .catch((ex) => {
              vscode.window.showWarningMessage(`发送失败：${ex}`);
            });
        }
      });
    });
    vscode.commands.registerCommand('fanfouTimeline.reply', (node) => {
      vscode.window
        .showInputBox({ value: `@${node.screen_name} `, valueSelection: [`@${node.screen_name} `.length, `@${node.screen_name} `.length], placeHolder: `回复：${node.content}`, prompt: '发送' })
        .then((value) => {
          if (value) {
            client
              .xauth()
              .then(() => {
                client
                  .post('/statuses/update', { status: value, in_reply_to_status_id: node.id })
                  .then(() => {
                    vscode.window.showInformationMessage('回复成功');
                  })
                  .catch((ex) => {
                    vscode.window.showWarningMessage(`回复失败：${ex}`);
                  });
              })
              .catch((ex) => {
                vscode.window.showWarningMessage(`回复失败：${ex}`);
              });
          }
        });
    });
    vscode.commands.registerCommand('fanfouTimeline.repost', (node) => {
      // debugger;
      vscode.window.showInputBox({ value: `转@${node.screen_name} ${node.content}`, valueSelection: [0, 0], placeHolder: `转@${node.screen_name} ${node.content}`, prompt: '发送' }).then((value) => {
        if (value) {
          client
            .xauth()
            .then(() => {
              client
                .post('/statuses/update', { status: value, in_reply_to_status_id: node.id })
                .then(() => {
                  vscode.window.showInformationMessage('转发成功');
                })
                .catch((ex) => {
                  vscode.window.showWarningMessage(`转发失败：${ex}`);
                });
            })
            .catch((ex) => {
              vscode.window.showWarningMessage(`转发失败：${ex}`);
            });
        }
      });
    });
    vscode.commands.registerCommand('fanfouTimeline.mention', (node) => {
      vscode.window
        .showInputBox({ value: `@${node.screen_name} `, valueSelection: [`@${node.screen_name} `.length, `@${node.screen_name} `.length], placeHolder: `@${node.screen_name}`, prompt: '发送' })
        .then((value) => {
          if (value) {
            client
              .xauth()
              .then(() => {
                client
                  .post('/statuses/update', { status: value, in_reply_to_user_id: node.userId })
                  .then(() => {
                    vscode.window.showInformationMessage('@TA成功');
                  })
                  .catch((ex) => {
                    vscode.window.showWarningMessage(`@TA失败：${ex}`);
                  });
              })
              .catch((ex) => {
                vscode.window.showWarningMessage(`@TA失败：${ex}`);
              });
          }
        });
    });
    vscode.commands.registerCommand('fanfouTimeline.like', (node) => {
      client
        .xauth()
        .then(() => {
          client
            .post(`/favorites/create/${node.id}`)
            .then(() => {
              vscode.window.showInformationMessage('收藏成功');
              node.favorited = !node.favorited;
              vscode.commands.executeCommand('fanfouTimeline.refresh', node);
            })
            .catch((ex) => {
              vscode.window.showWarningMessage(`收藏失败：${ex}`);
            });
        })
        .catch((ex) => {
          vscode.window.showWarningMessage(`收藏失败：${ex}`);
        });
    });
    vscode.commands.registerCommand('fanfouTimeline.unlike', (node) => {
      client
        .xauth()
        .then(() => {
          client
            .post(`/favorites/destroy/${node.id}`)
            .then(() => {
              vscode.window.showInformationMessage('取消收藏成功');
              node.favorited = !node.favorited;
              vscode.commands.executeCommand('fanfouTimeline.refresh', node);
            })
            .catch((ex) => {
              debugger;
              vscode.window.showWarningMessage(`取消收藏失败：${ex}`);
            });
        })
        .catch((ex) => {
          vscode.window.showWarningMessage(`取消收藏失败：${ex}`);
        });
    });
    vscode.commands.registerCommand('fanfouTimeline.setting', () => {
      vscode.commands.executeCommand('workbench.action.openGlobalSettings');
    });
  }
}

module.exports = TimelineCommands;
