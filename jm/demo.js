const getEnPass = require('./main')

let data ={
    module:"AIPSzoHNQR8eb/x09tbE1mIyFwpCF2SmVGMIlrRGW4n8usA3es0bJy3DDpwB9/vnBhXG6fWs1k8n3lU6fYOJPFlnQ4NcHNC+m/NaQoYQxpUaBYR/P52DQBX/rYmpNnbk6qyh51Hm4sTkN4AjrkBPpSoq6F8qfWEYgu8ypis/bFSv",
    exponent:"AQAB"
}
let enPass = getEnPass(data,"123")
console.log(enPass)