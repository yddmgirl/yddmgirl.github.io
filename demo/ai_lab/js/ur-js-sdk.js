    /**
     * 回收问卷接口
     * @param answer 答案
     * @param successCallback 成功回调
     * @returns {*}
     */
    var postAnswer = function(calllback){

        var url = 'https://wj.qq.com/sur/collect_answer';
        var survey_id = 1696164;
        var hash = 'd9c4';
        var pages = [{
            "questions":[
                {
                    "id":"q-5-GvfA",
                    "type":"text",
                    "text":"测试1",
                    "options":[],
                    "blanks":[]
                },
                {
                    "id":"q-6-JHsf",
                    "type":"text",
                    "text":"测试2",
                    "options":[],
                    "blanks":[]
                },
                {
                    "id":"q-7-Hmr9",
                    "type":"text",
                    "text":"测试3",
                    "options":[],
                    "blanks":[]
                },
                {
                    "id":"q-8-d6AL",
                    "type":"text",
                    "text":"测试4",
                    "options":[],
                    "blanks":[]
                },
                {
                    "id":"q-9-HfU9",
                    "type":"text",
                    "text":"测试5",
                    "options":[],
                    "blanks":[]
                },
                {
                    "id":"q-10-ynQy",
                    "type":"text",
                    "text":"测试6",
                    "options":[],
                    "blanks":[]
                },
                {
                    "id":"q-12-k6XC",
                    "type":"select",
                    "text":"",
                    "options":[
                        {
                            "id":"o-101-oRf7",
                            "checked":1,
                            "text":"1"
                        },
                        {
                            "id":"o-102-gVSr",
                            "checked":0,
                            "text":""
                        },
                        {
                            "id":"o-103-McXG",
                            "checked":0,
                            "text":""
                        },
                        {
                            "id":"o-104-jL5O",
                            "checked":0,
                            "text":""
                        },
                        {
                            "id":"o-4-Nb4s",
                            "checked":0,
                            "text":""
                        }
                    ],
                    "blanks":[]
                },
                {
                    "id":"q-14-y9P4",
                    "type":"upload",
                    "file_name_src":"对话框.zip",
                    "file_name_dst":"1696164_254522693_5a13e5239d100phpiSizVC0ebf.zip",
                    "blanks":[]
                }
            ]
        }];

        // answer.forEach(function (question, index) {
            
        //     switch(question.type){
        //         case 'radio':
        //             var ind = question.checked;
        //             pages[0].questions[index].options[ind].checked = 1;
        //             pages[0].questions[index].options[ind].text = question.text;

        //             break;

        //         case 'textarea':
        //             pages[0].questions[index].text = question.text;
                    
        //             break;

        //         case 'text':

        //             pages[0].questions[index].text = question.text;

        //             break;
                    
        //     }
            

        // });

        var answer_survey = {
            pages: pages,
            id: survey_id,
            ua: URSDK.getPlatform() +'|'+ URSDK.getBrowserInfo(),
            ldw: URSDK.uuid(),
            time: parseInt(new Date().getTime() / 1000),
            jsonLoadTime: parseInt((new Date().getTime() - URSDK.startTime))
        };

        //return $.post(url, {
        //    survey_id: survey_id,
        //    hash: hash,
        //    answer_survey: JSON.stringify(answer_survey)
        //}, function(resp){
        //    calllback(resp);
        //});

        return $.ajax({
            url: url,
            type: 'POST',
            data:{
                survey_id: survey_id,
                hash: hash,
                answer_survey: JSON.stringify(answer_survey)
            },
            error: function(){
                //alert('fail');
                console.log('error');
            },
            success: function(result){
                //alert('success');
                calllback(result);
            }
        });
    };


/**
 * Created by libo on 15/3/2.
 *
 * 腾讯问卷系统 JS-SDK BETA版
 */

(function(){
    var URSDK = {
        startTime: new Date().getTime()
    };

    var getBrowserInfo = function(){
        var browserInfo = _getBrowserInfo();
        var browser = '';
        if(browserInfo.chrome){
            browser = 'chrome';
        }else if(browserInfo.safari){
            browser = 'safari';
        }else if(browserInfo.opera){
            browser = 'opera';
        }else if(browserInfo.msie){
            browser = 'ie';
        }else if(browserInfo.mozilla){
            browser = 'mozilla';
        }else{
            browser = 'unknown';
        }
        browser += browserInfo.version;
        return browser;
    };

    var getPlatform = function(){
        return navigator.platform;
    };

    var uuid = (function() {

        // Private array of chars to use

        var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

        return function (len, radix) {

            var chars = CHARS, uuid = [], rnd = Math.random;

            radix = radix || chars.length;

            if (len) {

                // Compact form

                for (var i = 0; i < len; i++) uuid[i] = chars[0 | rnd()*radix];

            } else {

                // rfc4122, version 4 form

                var r;

// rfc4122 requires these characters

                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';

                uuid[14] = '4';

// Fill in random data.  At i==19 set the high bits of clock sequence as

                // per rfc4122, sec. 4.1.5

                for (var i = 0; i < 36; i++) {

                    if (!uuid[i]) {

                        r = 0 | rnd()*16;

                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];

                    }

                }

            }

            return uuid.join('');

        };

    })();

    var _uaMatch = function( ua ) {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
            /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
            /(msie) ([\w.]+)/.exec( ua ) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
            [];

        return {
            browser: match[ 1 ] || "",
            version: match[ 2 ] || "0"
        };
    };

    var _getBrowserInfo = function(){
        matched = _uaMatch( navigator.userAgent );
        browser = {};

        if ( matched.browser ) {
            browser[ matched.browser ] = true;
            browser.version = matched.version;
        }

        // Chrome is Webkit, but Webkit is also Safari.
        if ( browser.chrome ) {
            browser.webkit = true;
        } else if ( browser.webkit ) {
            browser.safari = true;
        }
        return browser;
    };

    URSDK.getBrowserInfo = getBrowserInfo;
    URSDK.getPlatform = getPlatform;
    URSDK.uuid = uuid;

    if(!window.URSDK){
        window.URSDK = URSDK;
    }

})();