$(function(){

    // 我要制作
    $("#file-upload").on('change',function(){
        makePhoto();
    });

    // 保存
    $('.btn-save').on('click',function(){
        // 制作canvas生成图片
        HtmlToCanvas('.make-item',function(canvas){
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            var newImg = convertCanvasToImage(canvas);
            $('.photo-wrap').append(newImg);
            if(newImg){
                var isWechat = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger';
                if(isWechat){
                    wx.ready(function(){
                        wx.previewImage({
                            current: newImg.src, // 当前显示图片的http链接
                            urls: [newImg.src] // 需要预览的图片http链接列表
                        });
                    });
                } else{
                    $('.photo-wrap').html(newImg);
                    $('.photo-show').removeClass('hide');
                    $('.photo-show').on('click',function(){
                        $('.photo-show').addClass('hide');
                        return false;
                    });
                }
            }
        });
    });

    // 设置当前农历时间
    var currentTime = getTranditionalTime();
    $('.current-time').html(currentTime);


});

// 制作明信片
function makePhoto(){
    var formdata = createFormDate(8);  // 创建FormData
    $('.make-img').attr('data-filter',8);
    $('.spinner').show();

    // 上传图片发送数据
    sendPhoto(formdata,function(res){
        if(res){
            $('.spinner').hide();
            var onlineURL = res.url;
            var newImg = new Image();
            newImg.src = onlineURL;
            newImg.onload = function(){
                $('.make-page').addClass('disappear').removeClass('hide');
                // 判断拍照图片的方向，并设置图片尺寸
                var fileInput = document.getElementById('file-upload');
                getOrientation(fileInput.files[0],function(orientation){  // 获取到方向代码
                    var wrapWidth = $('.make-pic').width();
                    var ratio = newImg.width > newImg.height ? newImg.height/newImg.width : newImg.width/newImg.height;
                    var resImgWidth,resImgHeight;
                    if(newImg.width == newImg.height){
                        resImgWidth = wrapWidth;
                        resImgHeight = wrapWidth;
                    } else if(newImg.width < newImg.height){
                        resImgWidth = wrapWidth*ratio;
                        resImgHeight = wrapWidth;
                    } else{
                        resImgWidth = wrapWidth;
                        resImgHeight = wrapWidth*ratio;
                    }

                    // 如果是以下代码中的一个，就放大图片
                    var arrOrt = [3,4,5,6,7,8];
                    for(var i=0;i<arrOrt.length;i++){
                        if(arrOrt[i] == orientation){
                            resImgWidth = resImgWidth/ratio;
                            resImgHeight = resImgHeight/ratio;
                        }
                    }
                    // 根据方向做出相应的旋转
                    switch(orientation){
                        case 3:
                            // 向左旋转180度
                            $('.make-pic').css('transform','rotate(-180deg)');
                            break;
                        case 4:
                            // 垂直翻转
                            $('.make-pic').css('transform','rotate(180deg)');
                            break;
                        case 5:
                            // 垂直翻转 + 向右旋转90度
                            $('.make-pic').css('transform','rotate(-90deg)');
                            break;
                        case 6:
                            // 向右旋转90度
                            $('.make-pic').css('transform','rotate(90deg)');
                            break;
                        case 7:
                            // 水平翻转 + 向右旋转90度
                            $('.make-pic').css('transform','rotate(90deg)');
                            break;
                        case 8:
                            // 向左旋转90度
                            $('.make-pic').css('transform','rotate(-90deg)');
                            break;
                    }
                    $('.make-img').css({
                        'width': resImgWidth + 'px',
                        'height': resImgHeight + 'px',
                        'margin-left': '-'+resImgWidth/2 + 'px',
                        'margin-top': '-'+resImgHeight/2 + 'px'

                    });
                    $('.make-img').attr('src',onlineURL);
                    $('.upload-bg').css('background-image','url('+ onlineURL +')');


                    // 匹配诗词
                    var arrResult = res.result;
                    var poemHTML = makePoemHMTL(arrResult[0],res.haspoem); // 调用函数【生成诗词HTML】
                    $('.poem-word').html(poemHTML);
                    $('.btn-change').hide();
                    if(!res.haspoem){
                        $('.shake-word').html('似乎没有匹配的诗词');
                    } else{
                        $('.shake-word').html('');
                        if(arrResult.length > 1){
                            $('.btn-change').show();
                        }
                    }

                    $('.main-page').addClass('hide');
                    $('.make-page').removeClass('disappear');



                    // 新手引导：向左滑屏切换滤镜两秒后消失
                    $('.pop-tips').removeClass('hide');
                    setTimeout(function(){
                        $('.pop-tips').addClass('disappear');
                        $('.make-img').attr('data-filter',8);
                    },2000);

                    
                    
                    // 换诗
                    changePoem(arrResult);

                });
            }
        }
    });

    // 更换滤镜
    var isSlidable = true;
    changeFilter(isSlidable);

    return false;
};


// 创建FormData： 参数: 滤镜id
function createFormDate(styleId){
    var formdata = new FormData();
    // console.log($("#file-upload")[0].files[0])
    formdata.append('upload_image',$("#file-upload")[0].files[0]);
    formdata.append('user','abc');
    formdata.append('style_id',styleId);
    return $("#file-upload")[0].files[0];
}

// 发送图片到服务器并返回数据
function sendPhoto(formdata,fn){

    setTimeout(function(){
      var reader = new FileReader();
      reader.readAsDataURL(formdata);//发起异步请求
      reader.onload = function(){
          //读取完成后，数据保存在对象的result属性中
          var src=this.result
          // console.log(src)
          fn({
            filterId:111,
            url: src,
            result: '测 试 数据'
          })
      }
    },1000)
    return;

    $.ajax({
         type : 'post',
         url : 'https://asr.qq.com/upd_py/imgPoemCgi.py',
         data : formdata,
         cache : false,
         processData : false,
         contentType : false,
         dataType: 'json',
         success : function(res){
            fn(res);
         }
    });
}

// 生成诗词HTML : 参数：某一句诗词(string)、是否有诗词(boolean)。返回值为HTML
function makePoemHMTL(poem,hasPoem){
    var poemHTML = '';
    var poem = poem.replace(/；|;|？|\?|\,|\.| /g, '');  // 去掉奇怪的符号
    if(hasPoem){
        var punctuation = ['。','，','。']; // 标点符号
        poemHTML = '<span>' + poem.replace(/。/g, '<i>。</i></span><span>').replace(/，/g, '<i>，</i></span><span>').replace(/：/g, '<i class="mh">：</i></span><span>').replace(/、/g, '<i>、</i></span><span>');
    } else{
        if(poem.length > 8){
            var wordArr = poem.split('');
            var col = parseInt(wordArr.length/8);
            for(var i=1;i<=col;i++){
                wordArr.splice(i*9-1,0,'</span><span>');
            }
            poemHTML = '<span>' + wordArr.join('') + '</span>';
        } else{
            poemHTML = '<span>' + poem + '</span>';
        }
    }
    return poemHTML;
};

// 向左滑动切换滤镜 【依赖hammer.min.js】参数：是否允许切换(未成功切换滤镜前不再次发送请求)
function changeFilter(isSlidable){
    var photo = document.querySelector('.make-item');
    var hammertime = new Hammer(photo);

    hammertime.on('swipe', function(e) {
        if(e.deltaX < 0){
            $('.pop-tips').addClass('disappear');
            setTimeout(function(){
                $('.pop-tips').addClass('invisible');
            },1000);
            if(!isSlidable) return;
            isSlidable = false;
            var filterId;
            if($('.make-img').attr('data-filter') == 8){
                var formdata = createFormDate(374);
                filterId = 374;
            } else{
                var formdata = createFormDate(8);
                filterId = 8;
            }
            if($('.pop-tips').hasClass('invisible')){
                $('.spinner').show();
            } else{
                setTimeout(function(){
                    $('.spinner').show();
                },600);
            }
            sendPhoto(formdata,function(res){
                if(res){
                    $('.make-img').attr('data-filter',filterId);
                    var onlineURL = res.url;
                    $('.make-img').attr('src',onlineURL);
                    $('.upload-bg').css('background-image','url('+ onlineURL +')');
                    $('.spinner').hide();
                    // 0.5秒后才允许再次切换
                    setTimeout(function(){
                        isSlidable = true;   
                    },500);
                }
            });
        }
        return false;
    });
};

// HTML转Canvas 参数：转换后图片的宽w、高h，回调函数fn
function HtmlToCanvas(ele,fn){
    html2canvas(document.querySelector(ele), {
        onrendered: function(canvas) {
            fn(canvas);
        },
        allowTaint: true,
        scale: 4
    });
}

// canvas转Image
function convertCanvasToImage(canvas) {
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    return image;
}


// 换诗
function changePoem(poemArr){
    var i = 1;
    $('.btn-change').on('click',function(){
        if(i == poemArr.length) i = 0;
        var poem = makePoemHMTL(poemArr[i],1);
        $('.poem-word').html(poem);
        i++;
    });
}


/* 获取当前时间，返回农历日期(年月日) */
function getTranditionalTime(){
    var CalendarData = new Array(100);
    var madd = new Array(12);
    var tgString = "甲乙丙丁戊己庚辛壬癸";
    var dzString = "子丑寅卯辰巳午未申酉戌亥";
    var numString = "一二三四五六七八九十";
    var monString = "正二三四五六七八九十冬腊";
    var weekString = "日一二三四五六";
    var cYear, cMonth, cDay, TheDate;
    CalendarData = new Array(0xA4B, 0x5164B, 0x6A5, 0x6D4, 0x415B5, 0x2B6, 0x957, 0x2092F, 0x497, 0x60C96, 0xD4A, 0xEA5, 0x50DA9, 0x5AD, 0x2B6, 0x3126E, 0x92E, 0x7192D, 0xC95, 0xD4A, 0x61B4A, 0xB55, 0x56A, 0x4155B, 0x25D, 0x92D, 0x2192B, 0xA95, 0x71695, 0x6CA, 0xB55, 0x50AB5, 0x4DA, 0xA5B, 0x30A57, 0x52B, 0x8152A, 0xE95, 0x6AA, 0x615AA, 0xAB5, 0x4B6, 0x414AE, 0xA57, 0x526, 0x31D26, 0xD95, 0x70B55, 0x56A, 0x96D, 0x5095D, 0x4AD, 0xA4D, 0x41A4D, 0xD25, 0x81AA5, 0xB54, 0xB6A, 0x612DA, 0x95B, 0x49B, 0x41497, 0xA4B, 0xA164B, 0x6A5, 0x6D4, 0x615B4, 0xAB6, 0x957, 0x5092F, 0x497, 0x64B, 0x30D4A, 0xEA5, 0x80D65, 0x5AC, 0xAB6, 0x5126D, 0x92E, 0xC96, 0x41A95, 0xD4A, 0xDA5, 0x20B55, 0x56A, 0x7155B, 0x25D, 0x92D, 0x5192B, 0xA95, 0xB4A, 0x416AA, 0xAD5, 0x90AB5, 0x4BA, 0xA5B, 0x60A57, 0x52B, 0xA93, 0x40E95);
    madd[0] = 0;
    madd[1] = 31;
    madd[2] = 59;
    madd[3] = 90;
    madd[4] = 120;
    madd[5] = 151;
    madd[6] = 181;
    madd[7] = 212;
    madd[8] = 243;
    madd[9] = 273;
    madd[10] = 304;
    madd[11] = 334;

    function GetBit(m, n) {
    return (m >> n) & 1;
    }

    function e2c() {
    TheDate = (arguments.length != 3) ? new Date() : new Date(arguments[0], arguments[1], arguments[2]);
    var total, m, n, k;
    var isEnd = false;
    var tmp = TheDate.getYear();
    if (tmp < 1900) {
        tmp += 1900;
    }
    total = (tmp - 1921) * 365 + Math.floor((tmp - 1921) / 4) + madd[TheDate.getMonth()] + TheDate.getDate() - 38;

    if (TheDate.getYear() % 4 == 0 && TheDate.getMonth() > 1) {
        total++;
    }
    for (m = 0;; m++) {
        k = (CalendarData[m] < 0xfff) ? 11 : 12;
        for (n = k; n >= 0; n--) {
            if (total <= 29 + GetBit(CalendarData[m], n)) {
                isEnd = true;
                break;
            }
            total = total - 29 - GetBit(CalendarData[m], n);
        }
        if (isEnd) break;
    }
    cYear = 1921 + m;
    cMonth = k - n + 1;
    cDay = total;
    if (k == 12) {
        if (cMonth == Math.floor(CalendarData[m] / 0x10000) + 1) {
            cMonth = 1 - cMonth;
        }
        if (cMonth > Math.floor(CalendarData[m] / 0x10000) + 1) {
            cMonth--;
        }
    }
    }

    function GetcDateString() {
        var tmp = "";
        tmp += tgString.charAt((cYear - 4) % 10);
        tmp += dzString.charAt((cYear - 4) % 12);
        tmp += "";
        tmp += "年";
        if (cMonth < 1) {
            // tmp += "(闰)";
            tmp += monString.charAt(-cMonth - 1);
        } else {
            tmp += monString.charAt(cMonth - 1);
        }
        tmp += "月";
        tmp += (cDay < 11) ? "初" : ((cDay < 20) ? "十" : ((cDay < 30) ? "廿" : "三十"));
        if (cDay % 10 != 0 || cDay == 10) {
            tmp += numString.charAt((cDay - 1) % 10);
        }
        return tmp;
        }

        function GetLunarDay(solarYear, solarMonth, solarDay) {
        //solarYear = solarYear<1900?(1900+solarYear):solarYear;
        if (solarYear < 1921 || solarYear > 2020) {
            return "";
        } else {
            solarMonth = (parseInt(solarMonth) > 0) ? (solarMonth - 1) : 11;
            e2c(solarYear, solarMonth, solarDay);
            return GetcDateString();
        }
    }

    var D = new Date();
    var yy = D.getFullYear();
    var mm = D.getMonth() + 1;
    var dd = D.getDate();
    var ww = D.getDay();
    var ss = parseInt(D.getTime() / 1000);
    if (yy < 100) yy = "19" + yy;

    var currentTime = GetLunarDay(yy, mm, dd);
    return currentTime;
}


//  获取拍照照片的方向，返回相机拍照的方向的代码
function getOrientation(file, callback) {
  var reader = new FileReader();
  reader.onload = function(e) {

    var view = new DataView(e.target.result);
    if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
    var length = view.byteLength, offset = 2;
    while (offset < length) {
      var marker = view.getUint16(offset, false);
      offset += 2;
      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
        var little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;
        for (var i = 0; i < tags; i++)
          if (view.getUint16(offset + (i * 12), little) == 0x0112)
            return callback(view.getUint16(offset + (i * 12) + 8, little));
      }
      else if ((marker & 0xFF00) != 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };
  reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
}
















