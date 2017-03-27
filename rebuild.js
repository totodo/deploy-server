const request        = require("request");
const moment         = require("moment");
const exec           = require('child_process').exec;
const log            = require("./log");

const releaseRoot    = '/root/release';
const wwwPath        = '/root/www';
const repoNames = ['web-user', 'web-admin', 'api-server', 'micro-service'];

function t() {
  return moment().format('YYYY-MM-DD-HH-mm-ss');
}
module.exports = (body) => {
  if (!body.ref) {
    return;
  }
  const msg = {
    ref: body.ref,
    repoName: body.repository.name
  };
  const branch = msg.ref;
  if (branch !== 'refs/heads/master') {
    return;
  }
  const repoName = msg.repoName;
  if (repoNames.indexOf(repoName) === -1) {
    return;
  }

  console.log(`${t()} Start: ${repoName}`);
  const releasePath = `${releaseRoot}/${repoName}/${t()}`;
  let cmd = [];

  switch (repoName) {
    case 'web-user':
    case 'web-admin':
      cmd = [
        `cd /root/github/${repoName}`,
        'git pull origin master',
        'cnpm i',
        'rm -rf dist',
        'tar jxvf dist.tar.bz2',
        `cp -R dist ${releasePath}`,
        `rm -rf ${wwwPath}/${repoName}/dist`,
        `ln -s ${releasePath} ${wwwPath}/${repoName}/dist`
      ];
      break;
    case 'api-server':
    case 'micro-service':
      cmd = [
        `cd /root/github/${repoName}`,
        'git pull origin master',
        'cnpm install',
        'npm run apidoc',
        `rsync -av --exclude node_modules ../${repoName} ${releasePath}`,
        `ln -s /root/github/${repoName}/node_modules ${releasePath}/${repoName}/node_modules`,
        `cd ${releasePath}/${repoName}/`,
        `pm2 delete ${repoName}`,
        `pm2 start app.js --name "${repoName}"`
      ];
      break;
  }
  const cmds = cmd.join(' && ');
  exec(cmds, {}, function (error) {
    console.log(`${t()} End: ${repoName}`);

    if (error) {
      console.error(error);
      return;
    }
    log({title: repoName + '：部署成功', content: releasePath});
  });
};