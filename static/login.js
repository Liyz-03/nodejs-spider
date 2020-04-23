//给登录界面的action加上时间戳
document.forms[0].action = (document.forms[0].action) + "?time=" + new Date().getTime();

var dlArr = [];

function refreshCode() {
	$("#yzmPic").attr("src", _path + '/kaptcha?time=' + new Date().getTime());
}

jQuery(function ($) {
	refreshCode();
	$('#mm,#yzm').empty();

	$("#mm").bind("copy paste cut", function () {
		return false;
	});

	//获得焦点
	$("#yhm").focus();
	//设置回车登录事件	
	$('#yhm,#mm,#yzm').unbind("keydown").bind("keydown", function (e) {
		var event = $.event.fix(e);
		//回车自动查询
		if (event.keyCode == 13) {
			//取消浏览器默认行为
			event.preventDefault();
			//点击登录
			$('#dl').click();
		}
		//取消事件冒泡
		event.stopPropagation();
		//阻止剩余的事件处理函数执行并且防止事件冒泡到DOM树上
		event.stopImmediatePropagation();
	});


	var modulus, exponent;

	$.getJSON(_path + "/xtgl/login_getPublicKey.html?time=" + new Date().getTime(), function (data) {
		modulus = data["modulus"];
		exponent = data["exponent"];
	});

	$("#dl").click(function () {





		var loginBtn = this;
		//2.让提交按钮失效，以实现防止按钮重复点击
		$(loginBtn).attr('disabled', 'disabled');
		//3.给用户提供友好状态提示
		$(loginBtn).text('登录中...');


		var ts = '<span class="glyphicon glyphicon-minus-sign"></span>';
		if (!$.founded($("#yhm").val())) {
			$("#tips").empty().append(ts + $.i18n.zftal["login"]["user_empty"]);
			$("#tips").show();
			//5.让登陆按钮重新有效
			$(loginBtn).removeAttr('disabled');
			$(loginBtn).text('登录');
			$("#mm").val("");
			return false;
		}
		if (!$.founded($("#mm").val())) {
			///$("#tips").removeClass("alert-danger").addClass("alert-warning");
			$("#tips").empty().append(ts + $.i18n.zftal["login"]["pwd_empty"]);
			$("#tips").show();
			//5.让登陆按钮重新有效
			$(loginBtn).removeAttr('disabled');
			$(loginBtn).text('登录');
			$("#mm").val("");
			return false;
		}
		if ($("#mmsrddcshkzfs").val() == "0") {
			if ($("#yzmDiv:visible").size() > 0) {
				if (!$.founded($("#yzm").val())) {
					$("#tips").empty().append(ts + $.i18n.zftal["login"]["yzm_empty"]);
					$("#tips").show();
					//5.让登陆按钮重新有效
					$(loginBtn).removeAttr('disabled');
					$(loginBtn).text('登录');
					$("#mm").val("");
					return false;
				}
			}
		}

		if ($("#mmsfjm").val() == '0') {
			$("#hidMm").val($("#mm").val());
		} else {
			var rsaKey = new RSAKey();
			rsaKey.setPublic(b64tohex(modulus), b64tohex(exponent));
			var enPassword = hex2b64(rsaKey.encrypt($("#mm").val()));
			$("#mm").val(enPassword);
			$("#hidMm").val(enPassword);   //页面上放了一个隐藏的password类型输入框，name也是mm，防止密码自动填充，在提交的时候把内容设置成跟输入的密码一致

		}

		if ($("#mmsrddcshkzfs").val() == "1") {
			var isSuccess = false;
			$.ajax({
				url: _path + '/xtgl/login_cxDlxgxx.html',
				async: false,
				type: "post",
				dataType: "json",
				data: { "yhm": $("#yhm").val() },
				success: function (data) {
					if (data == "0") {
						//alert("用户不存在");
						if ($(".btn-lang-enabled").val() == "en_US") {
							$("#tips").empty().append(ts + "User does not exist");
							$("#tips").show();
						} else {
							$("#tips").empty().append(ts + "用户不存在");
							$("#tips").show();
						}
						isSuccess = false;
					} else {
						var dataArr = data.split("_");
						var yzcskz = $("#yzcskz").val();
						if (dataArr[0] >= yzcskz) {
							var fz = Number($("#dlsbsdsj").val());//设置的锁定时间（分钟)
							var ms = fz * 60000;//转成秒数
							var timestamp = (new Date()).valueOf(); //当前时间戳
							if ((parseInt(dataArr[1]) + parseInt(ms)) > parseInt(timestamp)) {
								var sj = (parseInt(dataArr[1]) + parseInt(ms)) - parseInt(timestamp);
								var minutes = parseInt((sj % (1000 * 60 * 60)) / (1000 * 60) * 60);
								if ($(".btn-lang-enabled").val() == "en_US") {
									$("#tips").empty().append(ts + "You have exceeded the maximum number of login failures. Please sign in after " + minutes + " seconds");
									$("#tips").show();
								} else {
									$("#tips").empty().append(ts + "您已超过最大登录失败次数，请在" + minutes + "秒后再登");
									$("#tips").show();
								}
								//alert("您已超过最大登录失败次数，请在"+minutes+"秒后再登");
								isSuccess = false;
							} else {
								//锁定时间过了就更新登录失败次数为0
								$.ajax({
									url: _path + '/xtgl/login_cxUpdateDlsbcs.html',
									async: false,
									type: "post",
									dataType: "json",
									data: { "yhm": $("#yhm").val() },
									success: function (data) {
										if (data == "操作成功") {
											isSuccess = true;
										}
									}
								})
							}
						} else {
							isSuccess = true;
						}
					}
				}
			});

			if (isSuccess) {
				document.forms[0].submit();
			} else {
				//5.让登陆按钮重新有效
				$(loginBtn).removeAttr('disabled');
				$(loginBtn).text('登录');
				$("#mm").val("");
				return false;
			}
		} else {




			document.forms[0].submit();
		}

	});


});
