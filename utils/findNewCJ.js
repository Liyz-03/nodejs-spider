//发送http请求
const superagent = require('superagent');
//操作mysql数据库
const { query, queryArgs } = require('./mysql');
//解析html
const cheerio = require('cheerio');
//获取加密后的密码
const getEnPass = require('../jm/main');
//发送post请求
const request = require('request');
//发送邮件
const { sendEmail, sendHelloMail } = require('./sendEmail')



//请求成绩分页参数
let reqes = 'xnm=2018&xqm=12&_search=false&nd=1586800433627&queryModel.showCount=15&queryModel.currentPage=1&queryModel.sortName=&queryModel.sortOrder=asc&time=1';
let sq = reqes.split('&');
let s = {};
for (var i = 0; i < sq.length; i++) {
    let q = sq[i].split('=');
    s[q[0]] = q[1];
}
console.log(s);

//全局常量
const url = 'http://jwgl.suse.edu.cn/xtgl/login_slogin.html';

//查询所有数据
//"insert into cucj_user(xh,pwd,notify_email,cj) 
//values(" + data.xh + "," + data.pwd + "," + data.notify_email + "," + data.cj + ")"
//"select * from cucj_user"
let sqlFindAll = "select * from cucj_user"
    // let data = {
    //     xh: '18101060205',
    //     pwd: 'li123456...',
    //     notify_email: '1125548895@qq.com',
    //     cj: "38"
    // };
    // query(sqlFindAll, (err, rows) => {
    //     console.log(rows);
    // });
    // query("insert into cucj_user(xh,pwd,notify_email,cj) values('" + data.xh + "','" + data.pwd + "','" + data.notify_email + "','" + data.cj + "')", (err, rows) => {
    //     console.log(rows);

// });
setInterval(function() {

    query(sqlFindAll, (err, rows) => {
        rows.forEach(item => {
            setTimeout(() => {
                console.log("正在查询学号为" + item.xh);
                //定义全局局部变量存储cookie
                let data = item;
                let Cookie;
                let Token;
                //第一步获取访问登录页面获取公钥
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
                                    Token = p('#csrftoken').val();
                                    console.log("获取到Token：" + Token);

                                    time = new Date().getTime();
                                    console.log('---------------获取公钥访问登录页面---------------');
                                    superagent
                                    // .get('http://jwgl.suse.edu.cn' + "/xtgl/login_getPublicKey.html?time=" + new Date().getTime() + '&_=' + new Date().getTime())
                                        .get('http://jwgl.suse.edu.cn' + "/xtgl/login_getPublicKey.html?time=" + time + '&_=' + (time - 50))
                                        .set('Content-Type', 'application/json')
                                        .set("Cookie", Cookie)
                                        .end(function(err, resKey) {
                                            modulus = JSON.parse(resKey.text)['modulus'];
                                            exponent = JSON.parse(resKey.text)['exponent'];
                                            data.modulus = modulus;
                                            data.exponent = exponent;
                                            // data.pass = pass;
                                            data.mmm = getEnPass({ module: data.modulus, exponent: data.exponent }, data.pwd)
                                            console.log(data);
                                            //---------开始模拟登录---------------------------------------------------------------------------------------------------
                                            setTimeout(() => {
                                                request.post({
                                                    url: 'http://jwgl.suse.edu.cn/xtgl/login_slogin.html?time=' + (time - 20),
                                                    headers: {
                                                        "content-type": "application/x-www-form-urlencoded",
                                                        'Cookie': Cookie
                                                    },
                                                    form: {
                                                        csrftoken: Token,
                                                        yhm: data.xh,
                                                        mm: data.mmm,
                                                        mm: data.mmm
                                                    }
                                                }, function(error, res006, body) {
                                                    if (!error) {
                                                        console.log(res006.headers['set-cookie']);
                                                        let cookie007 = res006.headers['set-cookie'];
                                                        if (!cookie007[1]) {

                                                            console.log("密码或者账号错误");
                                                            return false;
                                                        }
                                                        cookie007 = cookie007[1].slice(0, cookie007[1].indexOf(';'));
                                                        Cookie[0] = cookie007;
                                                        console.log(Cookie);
                                                        console.log('------------模拟登录成功--------------');
                                                        setTimeout(() => {
                                                            let p = s;
                                                            p.xnm = '';
                                                            p.xqm = '';
                                                            p['queryModel.currentPage'] = 1;
                                                            let Alltotal = [];
                                                            superagent
                                                                .post('http://jwgl.suse.edu.cn/cjcx/cjcx_cxDgXscj.html?doType=query&gnmkdm=N305005')
                                                                .set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
                                                                .set('Connection', 'keep-alive')
                                                                .set('Cookie', Cookie)
                                                                .send(p)
                                                                .end(function(err, res) { //发起get请求
                                                                    if (err) {
                                                                        console.log(err);
                                                                    } else {
                                                                        console.log('状态码：' + res.status);
                                                                        let list0000 = JSON.parse(res.text);
                                                                        console.log('查询到总页数:' + list0000.totalPage);
                                                                        console.log('查询到总条数:' + list0000.totalCount);
                                                                        console.log(data.xh);
                                                                        query("select * from cucj_user where xh = '" + data.xh + "'", function(err, rows) {
                                                                            if (err) {
                                                                                console.log("学号有问题，查询对比失败");
                                                                            }
                                                                            if (rows[0].cj != list0000.totalCount) {
                                                                                sendEmail.sendMail(rows[0].notify_email, (rows[0].xh + "").substr(5), function() {
                                                                                    console.log("邮件发送成功！");
                                                                                })
                                                                                query("update cucj_user set cj =" + list0000.totalCount + " where id = " + rows[0].id, function(err, rows) {
                                                                                    console.log("数据库学生成绩更新成功！");
                                                                                })
                                                                            }

                                                                        })
                                                                    }
                                                                });
                                                        }, 1500);

                                                        //查询全部数据存入数据库

                                                    } else {
                                                        console.log('错误');
                                                        console.log(error);

                                                    }
                                                })
                                            }, 500);
                                        })
                                })

                        }
                    });
            }, 10 * 1000)
        })
    });
}, 60 * 60 * 60 * 1000)