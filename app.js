var express = require('express')
var superagent = require('superagent')
var cheerio = require('cheerio')
var app = express()
// var eventproxy = require('eventproxy')
// var ep = new eventproxy()
var page = 0 //页码

app.get('/', function (req, res, next) {
  var url = getUrls()
  fetchText(url).then((txt) => {
    conts = parseText(txt)
    res.write(JSON.stringify(conts))
    return fetchText(getUrls(txt))
  }).then((val) => {
    res.write(JSON.stringify(parseText(val)))
  })
  // urls.forEach(function (item) {
  //   item.fetchText(url)
  // })

  // ep.after('curl', 3, function (conts) {
  //   conts = conts.map(function (one) {
  //     return parseText(one)
  //   })
  //   // 将内容呈现到页面
  //   res.send(conts)
  // })
})

// 抓取页面
function fetchText(url) {
  return new Promise((resolve) => {
    superagent.get(url)
      .end(function (err, res) {
        if (err) {
          console.log(err)
        }
        resolve(res.text)
        // ep.emit('curl', res.text)
      })
  })
}

// 解析节点,获取信息
function parseText(text) {
  var baseUrl = 'http://www.jianshu.com'
  var $ = cheerio.load(text)
  var items = []
  // 遍历页面节点
  $('.note-list li').each(function (ind, ele) {
    var $ele = $(ele)
    items.push({
      title: $ele.find('.title').text(),
      href: baseUrl + $ele.find('.title').attr('href')
    })
  })
  return items
}

// 解析获取url 
function getUrls(text) {
  page++
  var url = ''
  var baseUrl = 'http://www.jianshu.com'
  if (page >= 2 && text) {
    var $ = cheerio.load(text) // text未取到
    var str = '/?'
    $('.note-list li').each(function (ind, ele) {
      var $ele = $(ele)
      str = str + 'seen_snote_ids%5B%5D=' + $ele.data('note-id') + '&'
    })
    url = baseUrl + str + 'page=' + page
  } else {
    url = baseUrl
  }
  return url
}

app.listen(3000, function () {
  console.log('app is listening at port 3000')
})