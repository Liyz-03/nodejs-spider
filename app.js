const express = require('express'); //导入依赖 实例化express
const superagent = require('superagent');
const cheerio = require('cheerio');
var events = require("events");
const request = require('request');
var emitter = new events.EventEmitter()
const app = express();

const url = 'http://jwgl.suse.edu.cn/xtgl/login_slogin.html';
let time;
let token;
var dates = {};
var data = {};
var modulus, exponent;
var Cookie;
var total = [];
var action;
let reqes = 'xnm=2019&xqm=3&_search=false&nd=1586800433627&queryModel.showCount=15&queryModel.currentPage=1&queryModel.sortName=&queryModel.sortOrder=asc&time=1';
let sq = reqes.split('&');
let s = {};
for (var i = 0; i < sq.length; i++) {
    let q = sq[i].split('=');
    s[q[0]] = q[1];
}
console.log(s);

app.use(express.static('static'));

app.get('/data', async function(req, response) { //声明get请求在指定的路径下调用相应的回调函数
    dates.yhm = req.url.substr(6);

    console.log('---------------发送首页获取默认cookie--------------------');
    superagent
        .get('http://jwgl.suse.edu.cn/')
        .set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
        .end(function(err, res) { //发起get请求
            if (err) {
                console.log(err);
            } else {
                console.log('状态码：' + res.status);
                console.log(res.header['set-cookie']);
                Cookie = res.header['set-cookie'];
                let cookie1 = Cookie[0].slice(0, Cookie[0].indexOf(';'));
                let cookie2 = Cookie[1].slice(0, Cookie[1].indexOf(';'));
                let cookieAll = cookie1 + ";" + cookie2;
                Cookie = cookieAll.split(';');
                //打印第一次请求得到回应的cookie 的格式化形式
                console.log('----------');
                console.log(Cookie);
                console.log('---------------拿到默认cookie访问登录页面---------------');
                superagent
                    .get(url)
                    .set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
                    .set("Cookie", Cookie)
                    .end(function(err, resdddd) { //发起get请求
                        let p = cheerio.load(resdddd.text); //使用cheerio解析数据
                        token = p('#csrftoken').val();
                        console.log(token);
                        dates.csrftoken = token;

                        time = new Date().getTime();
                        console.log('---------------获取公钥访问登录页面---------------');
                        superagent
                            .get('http://jwgl.suse.edu.cn' + "/xtgl/login_getPublicKey.html?time=" + time + '&_=' + (time - 50))
                            .set('Content-Type', 'application/json')
                            .set("Cookie", Cookie)
                            .end(function(err, resKey) {
                                modulus = JSON.parse(resKey.text)['modulus'];
                                exponent = JSON.parse(resKey.text)['exponent'];
                                data.modulus = modulus;
                                data.exponent = exponent;
                                response.send(data);
                            })
                    })

            }
        })
});


app.get('/put', function(req, response) { //声明get请求在指定的路径下调用相应的回调函数
    s['queryModel.currentPage'] = 1;
    total = [];
    dates.mm = req.url.substr(5);
    let gg = 'csrftoken=' + dates.csrftoken + '&yhm=' + dates.yhm + '&mm=' + dates.mm + '&mm=' + dates.mm;
    console.log(dates);

    console.log('------------------提交登录信息-----------------');

    //post请求
    request.post({
        url: 'http://jwgl.suse.edu.cn/xtgl/login_slogin.html?time=' + (time - 20),
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            'Cookie': Cookie
        },
        form: {
            csrftoken: dates.csrftoken,
            yhm: dates.yhm,
            mm: dates.mm,
            mm: dates.mm
        }
    }, function(error, res006, body) {
        if (!error) {
            console.log(res006.headers['set-cookie']);
            let cookie007 = res006.headers['set-cookie'];
            if (!cookie007[1]) {

                response.status(404).send({ msg: '密码或账号错误' });
                return false;
            }
            cookie007 = cookie007[1].slice(0, cookie007[1].indexOf(';'));
            Cookie[0] = cookie007;
            console.log(Cookie);
            console.log('------------获取课程--------------');

            superagent
                .post('http://jwgl.suse.edu.cn/cjcx/cjcx_cxDgXscj.html?doType=query&gnmkdm=N305005')
                .set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
                .set('Connection', 'keep-alive')
                .set('Cookie', Cookie)
                .send(s)
                .end(function(err, res) { //发起get请求
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('状态码：' + res.status);
                        let list = JSON.parse(res.text);
                        console.log('总页数:' + list.totalPage);
                        console.log(list.items.length);
                        for (let k = 0; k < list.items.length; k++) {
                            total.push(list.items[k]);
                        }
                        if (list.totalPage > 1) {
                            for (let j = 1; j < list.totalPage; j++) {
                                s['queryModel.currentPage'] = j + 1;
                                superagent
                                    .post('http://jwgl.suse.edu.cn/cjcx/cjcx_cxDgXscj.html?doType=query&gnmkdm=N305005')
                                    .set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
                                    .set('Connection', 'keep-alive')
                                    .set('Cookie', Cookie)
                                    .send(s)
                                    .end(function(err, res00000) {
                                        let list0000 = JSON.parse(res00000.text);
                                        console.log(list0000.items.length);
                                        for (let k = 0; k < list0000.items.length; k++) {
                                            total.push(list0000.items[k]);
                                        }
                                        console.log(total.length);
                                        response.send(total);
                                    })
                            }
                        } else {
                            response.send(total);
                        }

                    }
                });
        } else {
            console.log('错误');
            console.log(error);

        }
    })
});

app.listen(5000, function() { //监听5000端口
    console.log('server is listening port 5000....');
})