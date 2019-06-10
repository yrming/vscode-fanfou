const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const timeago = require('node-time-ago');
const download = require('image-downloader');

function pathExists(string) {
  try {
    fs.accessSync(string);
  } catch (err) {
    return false;
  }
  return true;
}

function getProfilePicture(username, pics_url) {
  let pics_exists = pathExists(path.join(__filename, '..', '..', 'resources', 'profilePictures', `${username}.jpg`));
  if (!pics_exists) {
    const options = {
      url: pics_url,
      dest: path.join(__filename, '..', '..', 'resources', 'profilePictures', `${username}.jpg`)
    };
    download.image(options);
  }
}

function getMultiLineChildren(node) {
  let content = node.content;
  let newLines = content.split('\n');
  let childs = [];
  for (let i = 0; i < newLines.length; i++) {
    childs.push({
      label: '',
      content: newLines[i],
      type: 'body',
      screen_name: node.screen_name,
      favorited: node.favorited
    });
  }
  if (node.photo && node.photo.originurl) {
    childs.push({
      label: '',
      content: '[图]>>',
      type: 'body',
      screen_name: node.screen_name,
      favorited: '',
      photoUrl: node.photo.originurl
    });
  }
  return childs;
}

class TimelineProvider {
  constructor(model, client) {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.model = model;
    this.client = client;
    this.max_id = model[model.length - 1].id;
    this.since_id = model[0].id;
  }

  refresh(item) {
    if (item) {
      this._onDidChangeTreeData.fire(item);
    } else {
      this._onDidChangeTreeData.fire();
    }
  }

  loadFirstPage() {
    this.client
      .xauth()
      .then(() => {
        this.client
          .get('/statuses/home_timeline', { count: 30 })
          .then((statuses) => {
            // debugger;
            let data = statuses.map((item) => {
              getProfilePicture(item.user.screen_name, item.user.profile_image_origin);
              return {
                id: item.id,
                userId: item.user.id,
                label: `${item.user.screen_name}(@${item.user.id})  ·  ${timeago(item.created_at)}  ·  via ${item.source_name}`,
                type: 'head',
                screen_name: item.user.screen_name,
                content: item.text,
                avatar: item.user.profile_image_origin,
                favorited: item.favorited,
                photo: item.photo || {}
              };
            });
            this.model = data.concat(this.model);
            this.since_id = this.model[0].id;
            this.max_id = this.model[this.model.length - 1].id;
            this.refresh();
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  loadPrevPage() {
    this.client
      .xauth()
      .then(() => {
        this.client
          .get('/statuses/home_timeline', { count: 30, since_id: this.since_id })
          .then((statuses) => {
            // debugger;
            let data = statuses.map((item) => {
              getProfilePicture(item.user.screen_name, item.user.profile_image_origin);
              return {
                id: item.id,
                userId: item.user.id,
                label: `${item.user.screen_name}(@${item.user.id})  ·  ${timeago(item.created_at)}  ·  via ${item.source_name}`,
                type: 'head',
                screen_name: item.user.screen_name,
                content: item.text,
                avatar: item.user.profile_image_origin,
                favorited: item.favorited,
                photo: item.photo || {}
              };
            });
            this.model = data.concat(this.model);
            this.since_id = this.model[0].id;
            this.max_id = this.model[this.model.length - 1].id;
            this.refresh();
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  loadNextPage() {
    this.client
      .xauth()
      .then(() => {
        this.client
          .get('/statuses/home_timeline', { count: 30, max_id: this.max_id })
          .then((statuses) => {
            // debugger;
            let data = statuses.map((item) => {
              getProfilePicture(item.user.screen_name, item.user.profile_image_origin);
              return {
                id: item.id,
                userId: item.user.id,
                label: `${item.user.screen_name}(@${item.user.id})  ·  ${timeago(item.created_at)}  ·  via ${item.source_name}`,
                type: 'head',
                screen_name: item.user.screen_name,
                content: item.text,
                avatar: item.user.profile_image_origin,
                favorited: item.favorited,
                photo: item.photo || {}
              };
            });
            this.model = this.model.concat(data);
            this.since_id = this.model[0].id;
            this.max_id = this.model[this.model.length - 1].id;
            this.refresh();
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
  // getParent(element) {
  //   if (element.type === 'head') {
  //     return {
  //       label: element.label,
  //       type: 'head',
  //       content: '',
  //       screen_name: '',
  //       favorited: element.favorited
  //     };
  //   } else {
  //     return {
  //       label: '',
  //       type: 'body',
  //       content: element.content,
  //       screen_name: '',
  //       favorited: element.favorited
  //     };
  //   }
  // }
  getChildren(element) {
    if (element) {
      return getMultiLineChildren(element);
    } else {
      return this.model;
    }
  }
  getTreeItem(element) {
    return {
      label: element.label,
      tooltip: element.photoUrl ? '' : element.content,
      iconPath:
        element.type === 'head'
          ? {
              light: path.join(__filename, '..', '..', 'resources', 'profilePictures', element.screen_name + '.jpg'),
              dark: path.join(__filename, '..', '..', 'resources', 'profilePictures', element.screen_name + '.jpg')
            }
          : undefined,
      description: element.type === 'head' ? '' : element.content,
      collapsibleState: element.type === 'head' ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None,
      contextValue: element.type === 'head' ? (element.favorited ? 'fanfou-status-head-fav' : 'fanfou-status-head-nofav') : (element.photoUrl ? 'see-photo' : '')
    };
  }
}

class Timeline {
  constructor(context, client) {
    this.context = context;
    this.client = client;
    client
      .xauth()
      .then(() => {
        client
          .get('/statuses/home_timeline', { count: 30 })
          .then((statuses) => {
            // debugger;
            let model = statuses.map((item) => {
              getProfilePicture(item.user.screen_name, item.user.profile_image_origin);
              return {
                id: item.id,
                userId: item.user.id,
                label: `${item.user.screen_name}(@${item.user.id})  ·  ${timeago(item.created_at)}  ·  via ${item.source_name}`,
                type: 'head',
                screen_name: item.user.screen_name,
                content: item.text,
                avatar: item.user.profile_image_origin,
                favorited: item.favorited,
                photo: item.photo || {}
              };
            });
            const treeDataProvider = new TimelineProvider(model, client);
            // vscode.window.createTreeView('fanfouTimeline', { treeDataProvider });
            vscode.window.registerTreeDataProvider('fanfouTimeline', treeDataProvider);
            vscode.commands.registerCommand('fanfouTimeline.refresh', (item) => {
              if (item) {
                treeDataProvider.refresh(item);
              } else {
                treeDataProvider.loadFirstPage();
              }
            });
            vscode.commands.registerCommand('fanfouTimeline.next', () => {
              treeDataProvider.loadNextPage();
            });
            vscode.commands.registerCommand('fanfouTimeline.prev', () => {
              treeDataProvider.loadPrevPage();
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
    // vscode.window.createTreeView('fanfouTimeline', { treeDataProvider });
    // vscode.window.registerTreeDataProvider('fanfouTimeline', treeDataProvider);
  }
}

module.exports = Timeline;
