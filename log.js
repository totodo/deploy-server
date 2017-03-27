const request = require("request");
// log mesage by wechat tool: http://sc.ftqq.com/

module.exports = function (param) {
  request({
    uri: `http://sc.ftqq.com/${process.env.SERVER_JIANG_KEY}.send`,
    qs: {
      text: param.title,
      desp: param.content
    }
  }, (err) => {
    if(err) {console.log('log err:', err)}
  });
};