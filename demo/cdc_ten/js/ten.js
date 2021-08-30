(function($){$.fn.touchwipe=function(settings){var config={min_move_x:20,min_move_y:20,wipeLeft:function(){},wipeRight:function(){},wipeUp:function(){},wipeDown:function(){},preventDefaultEvents:true};if(settings)$.extend(config,settings);this.each(function(){var startX;var startY;var isMoving=false;function cancelTouch(){this.removeEventListener('touchmove',onTouchMove);startX=null;isMoving=false}function onTouchMove(e){if(config.preventDefaultEvents){e.preventDefault()}if(isMoving){var x=e.touches[0].pageX;var y=e.touches[0].pageY;var dx=startX-x;var dy=startY-y;if(Math.abs(dx)>=config.min_move_x){cancelTouch();if(dx>0){config.wipeLeft()}else{config.wipeRight()}}else if(Math.abs(dy)>=config.min_move_y){cancelTouch();if(dy>0){config.wipeDown()}else{config.wipeUp()}}}}function onTouchStart(e){if(e.touches.length==1){startX=e.touches[0].pageX;startY=e.touches[0].pageY;isMoving=true;this.addEventListener('touchmove',onTouchMove,false)}}if('ontouchstart'in document.documentElement){this.addEventListener('touchstart',onTouchStart,false)}});return this}})(jQuery);
$(function(){
	var winH = $(window).height(),
		ind = 0,
		mdList = $(".wrap"),
		mod = $(".page"),
		mdSize = mod.length,
		zInd = 1;

	function pageShow(ind,className){
		zInd++;
		$(".page").eq(ind).css({
			zIndex:zInd
		})
		$(".page").eq(ind).show();
		$(".page").removeClass("fadeInDown fadeInUp play").eq(ind).addClass(className+' play');

	}

	var slidePage = true;
	var scrollDir = 0
	$(".page1,.page2").touchwipe({
		wipeUp: function() {
			if($(".play").hasClass("page1")){
				return false;
			}
			ind--;
			pageShow(ind,'fadeInDown');
		},
		wipeDown: function() {
			if(ind<=mdSize-3){

				ind++;
				pageShow(ind,'fadeInUp');
				slidePage = false;
			}

		},
		min_move_x: 80,
		min_move_y: 80,
		preventDefaultEvents: true
	});

	$(window).on("scroll",function(){
		var scrollTop = $(window).scrollTop();
		if(scrollTop>0){scrollDir = 0;}
		if(scrollTop<=0){
			scrollDir++;
			if(scrollDir >= 2){
				ind = 1;
				pageShow(ind,'fadeInDown');
				scrollDir = 0;
			}
		}
		// $(".ipt_textarea").val(scrollDir);
	});


	$(document).on("click",".qustion_list .question1",function(){
		$(this).parents(".qustion_list").find(".question1 ").removeClass('checked');
		$(this).addClass('checked');
	})





	//提交问卷
	$(".post_btn").on("click",function(){

		var question = [];

		$(".page3 .question").each(function(){

			var type = $(this).attr("type");
			if(type == 'radio' && !$(this).find(".current").length){
				// var scrollTop = $(this).position().top;
				// $("html,body").animate({"scrollTop":scrollTop});
				$(".p3_null").show().html('*请将选项填写完整');
				return false;
			}
			// if(type == 'textarea' && !$(this).find("textarea").val()){
			// 	// var scrollTop = $(this).position().top;
			// 	// $("html,body").animate({"scrollTop":scrollTop});
			// 	$(".p3_null").show().html('*');
			// 	return false;
			// }

			if(type == 'text' && !$(".ipt_trousers").val()){
				$(".p3_null").show().html('*请填写裤长');
				return false;
			}

			if(type == 'text' && !$(".ipt_company").val()){
				// alert('公司名不能为空')
				// $(".ipt_company").focus();
				$(".p3_null").show().html('*请填写公司名字');
				return false;
			}
			if(type == 'text' && !$(".ipt_contact").val()){
				// alert('联系方式不能空');
				// $(".ipt_contact").focus();
				$(".p3_null").show().html('*请填写联系方式');
				return false;
			}

			var id = $(".page3 .question").index(this);

			switch(type){
				case 'radio':
					var ind = $(this).find(".an_item").index($(this).find(".current"));
					if(ind == 2 && $(this).find(".other_text").is(":visible")){
						var text = $(this).find(".other_text").val();
					}else{
						var text = $(this).find(".current span").text();
					}
					question.push({
						'id':id,
						"type":'radio',
						'checked':ind,
						"text":text
					})
				break;
				case 'textarea':
					var text = $(this).find(".ipt_textarea").val();
					question.push({
						'id':id,
						'type':"textarea",
						"text":text
					})

				break;
				case 'text':

					if($(this).find(".ipt_trousers").length>0){
						var iptTrousers = $(".ipt_trousers").val();
						question.push({
							'id':id,
							'type':"text",
							"text":iptTrousers
						})
					}else if($(this).find(".ipt_ceo").length>0){
						var iptCeo = $(".ipt_ceo").val();
						question.push({
							'id':id,
							'type':"text",
							"text":iptCeo
						})

					}else{
						var iptCompany = $(".ipt_company").val();
						var iptContact = $(".ipt_contact").val();
						question.push({
							'id':id,
							'type':"text",
							"text":iptCompany
						})

						question.push({
							'id':id,
							'type':"text",
							"text":iptContact
						})
					}

				break;
			}
		})

		if(question && question.length>=10){
			console.log(question);
			postAnswer(question,function(){
			})
			$(".page4").fadeIn(500,function(){
		        $('body,html').on("touchmove",function(e){
		                e.preventDefault();
		        });
			});
		}


	})

	// weChatSDKInit();

})


// 填表单
//表单提交&验证

$('body').on('click','.question_btn',function() {

		var valid = true;

		// 姓名
		function checkName(){
			if ($('#cdcer_name').val().trim() === '' ) {						// 为空时
				$('.error_name').show();
				valid = false;
			}else if($('#cdcer_name').val().trim().length >= 256 ){	// 字符超过256
				$('.error_name').text('*您的名字真的有这么复杂吗 :)').show();
				valid = false;
			}else{
				$('.error_name').hide();
				// valid = true;
			}
		}
		$("#cdcer_name").on('change', function(e) {
			checkName();									//修改时 实时反馈
		});
		checkName();

		// 联系方式
		function checkPhone(){
			if ($('#cdcer_phone').val().trim() === '' ) {						// 为空时
				$('.error_phone').show();
				valid = false;
			}else if($('#cdcer_phone').val().trim().length >= 256 ){	// 字符超过256
				$('.error_phone').text('*您的联系方式真的有这么复杂吗 :)').show();
				valid = false;
			}else{
				$('.error_phone').hide();
				// valid = true;
			}
		}
		$("#cdcer_phone").on('change', function(e) {
			checkPhone();									//修改时 实时反馈
		});
		checkPhone();

		// RTX
		function checkRTX(){
			if ($('#cdcer_rtx').val().trim() === '' ) {		// 为空时
				$('.error_rtx').show();
				valid = false;
			}else if($('#cdcer_rtx').val().trim().length >= 256 ){	// 字符超过256
				$('.error_rtx').text('*您的RTX真的有这么复杂吗 :)').show();
				valid = false;
			}else{
				$('.error_rtx').hide();
				// valid = true;
			}
		}
		$("#cdcer_phone").on('change', function(e) {
			checkRTX();									//修改时 实时反馈
		});
		checkRTX();

		var question = [];

		$(".question").each(function(index, el) {
			var type = $(this).attr("data-type");
			switch(type){
				case 'radio':
					var ind = $(this).find(".question1").index($(".question1 .checked"))
					var text = $(this).find(".checked span").text();
					question.push({
						type:type,
						text:text,
						ind:ind
					})

					break;

				case 'text':
					var text = $(this).find("input:text").val();
					question.push({
						type:type,
						text:text
					})

				break;

				case 'select':
					var ind = $("#size_sel").get(0).selectedIndex;
					var text = $("#size_sel").find("option:selected").val();
					question.push({
						type:type,
						text:text,
						ind:ind
					})
				break;
			}
		});


		// 全部填写成功 则直接提交
		if (valid) {
			postAnswer(question,function(){

			});

            setTimeout(" $('.pop_win').removeClass('hide')",0);
            setTimeout(" $('.pop_win').addClass('hide')",2000);
            // 弹出提交成功
            setTimeout("$('#content').fadeOut(1200);$('.page_6').fadeIn(400);",1200);

			$('.photo_infor').find('.rtx').text($('#cdcer_rtx').val());
			$('.photo_infor').find('.name').text($('#cdcer_name').val());

		}
		return false;

});


// 手势操作
function fingerImg(){
		// 微信wx.chooseImage接口图片不会触发onload，改用下面方法
        // imageLoaded("#testImg",function(w,h){
        //     topPx=$('.photo').height()/2-(h*$('.photo').width()/w)/2;
        //     this.style.top=topPx+"px";
        // });

				var $img = $('#testImg');

				var w = $img.width();
				var h = $img.height();

				var top = autoSize(w, h) + 'px';

				// 保证图片一定是垂直居中
				$img.css('top', top);

				function autoSize (w, h){
					var $photo = $('.photo');
					return $photo.height()/2-(h*$photo.width()/w)/2;
				}

        function ease(x) {
            return Math.sqrt(1 - Math.pow(x - 1, 2));
        }

        var el = document.getElementById("testImg");
        Transform(el);
        var initScale = 1;
        new AlloyFinger(el, {
            multipointStart: function () {
                To.stopAll();
                initScale = el.scaleX;
            },
            rotate: function (evt) {
                el.rotateZ += evt.angle;
            },
            pinch: function (evt) {
                el.scaleX = el.scaleY = initScale * evt.scale;
            },
            pressMove: function (evt) {
                el.translateX += evt.deltaX;
                el.translateY += evt.deltaY;
            },
            multipointEnd: function () {
                To.stopAll();
                if (el.scaleX < 1) {

                    new To(el, "scaleX", 1, 500, ease);
                    new To(el, "scaleY", 1, 500, ease);
                }
                if (el.scaleX > 2) {

                    new To(el, "scaleX", 2, 500, ease);
                    new To(el, "scaleY", 2, 500, ease);
                }
                var rotation = el.rotateZ % 360;

                if (rotation < 0)rotation = 360 + rotation;
                el.rotateZ=rotation;

                if (rotation > 0 && rotation < 45) {
                    new To(el, "rotateZ", 0, 500, ease);
                } else if (rotation >= 315) {
                    new To(el, "rotateZ", 360, 500, ease);
                } else if (rotation >= 45 && rotation < 135) {
                    new To(el, "rotateZ", 90, 500, ease);
                } else if (rotation >= 135 && rotation < 225) {
                    new To(el, "rotateZ", 180, 500, ease);
                } else if (rotation >= 225 && rotation < 315) {
                    new To(el, "rotateZ", 270, 500, ease);
                }
            },
            pressMove: function (evt) {
                el.translateX += evt.deltaX;
                el.translateY += evt.deltaY;
            },
            tap: function (evt) {
                //console.log(el.scaleX + "_" + el.scaleY + "_" + el.rotateZ + "_" + el.translateX + "_" + el.translateY);
                //console.log("tap");
            },
            doubleTap: function (evt) {
                To.stopAll();
                if (el.scaleX > 1.5) {

                    new To(el, "scaleX", 1, 500, ease);
                    new To(el, "scaleY", 1, 500, ease);
                    new To(el, "translateX", 0, 500, ease);
                    new To(el, "translateY", 0, 500, ease);
                } else {
                    var box = el.getBoundingClientRect();
                    var y = box.height - (( evt.changedTouches[0].pageY - topPx) * 2) - (box.height / 2 - ( evt.changedTouches[0].pageY - topPx));

                    var x = box.width - (( evt.changedTouches[0].pageX) * 2) - (box.width / 2 - ( evt.changedTouches[0].pageX));
                    new To(el, "scaleX", 2, 500, ease);
                    new To(el, "scaleY", 2, 500, ease);
                    new To(el, "translateX", x, 500, ease);
                    new To(el, "translateY", y, 500, ease);
                }
                //console.log("doubleTap");
            },
            longTap: function (evt) {
                //console.log("longTap");
            },
            swipe: function (evt) {
                //console.log("swipe" + evt.direction);
            }
        });
}
fingerImg();
//图片操作

// 浏览器方案，部分情况会闪退
// $(".js_upFile").uploadView({
//     uploadBox: '.js_uploadBox',//设置上传框容器
//     showBox : '.js_showBox',//设置显示预览图片的容器
//     // width : , //预览图片的宽度，单位px
//     // height : , //预览图片的高度，单位px
//     allowType: ["gif", "jpeg", "jpg", "bmp", "png"], //允许上传图片的类型
//     maxSize :20, //允许上传图片的最大尺寸，单位M
//     success:function(e){
//         // $(".js_uploadText").text('更改');
//         // alert('图片上传成功');
//         $("#imgBox").find('img').attr("id","testImg");
//         fingerImg();
//         $('.photo_cover').hide();
//
//         //支持移动提示
//         $('.tipscover').fadeIn(300);
//         setTimeout(" $('.tipscover').fadeOut(300)",1500);
//     }
// });

// 调用JSSDK方案
$('.js_upFile').on('click', function(evt){

	wx.chooseImage({
	  count: 1, // 默认9
	  sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
	  sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
	  success: onChooseImageSuccess
	});

	// 兼容现有DOM结构，屏蔽input默认行为
	evt.preventDefault();
	return false;

});

// 点击截图
$(document).on('click', '.btn_save', function() {
    $('.screen_wrap').fadeIn(300);
    setTimeout(" $('.screen_wrap').fadeOut(300)",3000);
    $('.screen_wrap').click(function() {
        $(this).fadeOut(300);
    });
});

// 点击分享
$(document).on('click', '.btn_show', function() {
    $('.share_wrap').fadeIn(300);
    setTimeout(" $('.share_wrap').fadeOut(300)",3000);
    $('.share_wrap').click(function() {
        $(this).fadeOut(300);
    });
});



// 音乐
// function() {
var music = document.getElementById('music');
var audio = document.getElementById('audio');
var video1Wrap = document.getElementById('video1-wrap');
var video1Thumb = document.getElementById('video1-thumb');
var video1 = document.getElementById('video1');

audio.pause();
music.className = '';
        
music.onclick = function() {
    if (audio.paused) {
        audio.play();
        music.className = 'on';
    } else {
        audio.pause();
        music.className = '';
    }
}

// wx.chooseImage 成功回调函数
function onChooseImageSuccess (res) {

	// 微信chooseImage 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
	var img = res.localIds[0]; // 只去第一张

	var $img = $('#imgBox img');
	$img.attr('src', img); // 替换图片

	// $(".js_uploadText").text('更改');
	// alert('图片上传成功');
	$img.attr("id","testImg");

  // 微信本地图片很特殊，$img.attr('src', img) 设置的时候，render出尺寸有延迟，需要异步再去执行fingerImg
	setTimeout(function(){
		fingerImg();
	}, 100);

	$('.photo_cover').hide();

	//支持移动提示
	$('.tipscover').fadeIn(300);
	setTimeout(" $('.tipscover').fadeOut(300)",1500);

	uploadToServer(img);

}

// 上传微信返回的资源ID到服务器，让服务器去下载资源
function uploadToServer (localId){

	wx.uploadImage({
	    localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
	    isShowProgressTips: 1, // 默认为1，显示进度提示
	    success: function (res) {
	        var serverId = res.serverId; // 返回图片的服务器端ID

					$.ajax({
							url: 'http://10.cdc.tencent.com/wx/file.php',
							data: {
									p: 'Y2RjLnRlbmNlbnQuY29tIFdYc2lvbg==',
									media_id: serverId
							},
							dataType: 'json',
							method: 'POST'
					});

	    }
	});

}
