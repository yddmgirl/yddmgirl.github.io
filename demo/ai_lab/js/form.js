$(function(){

    var langTip;
    function changeLang(){
        if($('body').hasClass('lang-cn')){
            langTip = ['请填写','请填写正确的邮箱','请选择','请选择','文件格式不正确','重新上传','正在上传','请上传','删除','上传成功','上传失败','文件过大'];
        } else{
            langTip = ['Please enter your ','Please enter correct email','Please select ','Please choose ','file format error','Reupload','Uploading','Please upload ','Delete','Success','Error','File is large'];
        }
    }

    $(document).on('blur','.mandatory .inp-text',function(){
        changeLang();
        checkInpText($(this).val(), $(this));  // 检查文本框
    });

    $(document).on('click','.pop-select .select-item',function(){
        changeLang();
        var inpWrap = $(this).parents('.inp-wrap');
        if(inpWrap.find('.selected').length == inpWrap.find('.mod-select').length){
            tipHide($(this).parents('.mod-select').find('a'));
        }
    });

    $(document).on('change','.mandatory .inp-radio',function(){
        changeLang();
        tipHide($(this));
    });

    // 文件上传
    $(document).on('change','.inp-upload',function(e){
        changeLang();
        var fileName = e.target.files[0] ? e.target.files[0].name : null;
        if(!fileName) return;
        var $this = $(this);
        var inpWrap = $this.parent('.inp-wrap');
        $this.siblings('.upload-status').remove();
        $this.parents('li').removeClass('warn');
        $this.parents('li').find('.warn-tip').remove();

        // 判断文件格式

        if(!fileTypeOK($this,fileName)){
            var statusDom = $('<div class="upload-status fail"><div class="file-name">'+ fileName +'</div><div class="status"><i class="icon-fail"></i><span>'+ langTip[4] +'</span></div><label class="btn fr" for="'+ $this.prop('id') +'">'+ langTip[5] +'</label></div>');
            inpWrap.append(statusDom);
            return;
        }

        // 判断文件大小
        if(e.target.files[0].size/1000000 > $this.prop('maxSize')){
            var statusDom = $('<div class="upload-status fail"><div class="file-name">'+ fileName +'</div><div class="status"><i class="icon-fail"></i><span>'+ langTip[11] +'</span></div><label class="btn fr" for="'+ $this.prop('id') +'">'+ langTip[5] +'</label></div>');
            inpWrap.append(statusDom);
            return;
        }

        var uploadStatus = $('<div class="upload-status"><div class="file-name">'+ fileName +'</div><div class="status"><i class="icon-uploading"></i><span>'+ langTip[6] +'</span></div></div>');
        inpWrap.append(uploadStatus);
        $this.prop('disabled',true);
        var fileAmount = $this.prop('currentFileAmount');

        $.ajax({
            type : 'get',
            url : 'http://10.137.131.85/ailab_admin/Home/Interface',
            data: {jsonData: '{"interface":{"interfaceName":"Academic.uploadFiles","para":{}}}'},
            dataType : 'json',
            success : function(res){
                if(res.returnCode == 0){
                    // 上传成功
                    uploadStatus.find('i').removeClass('icon-uploading').addClass('icon-success');
                    uploadStatus.find('span').html(langTip[9]);
                    uploadStatus.append('<a href="javascript:;" class="btn fr btn-delete">'+ langTip[8] +'</a>');
                    fileAmount++;
                } else{
                    // 上传失败
                    uploadStatus.addClass('fail');
                    uploadStatus.find('i').removeClass('icon-uploading').addClass('icon-fail');
                    uploadStatus.find('span').html(langTip[10]);
                    uploadStatus.append('<label class="btn fr" for="'+ $this.prop('id') +'">'+ langTip[5] +'</label>');
                }
                $this.prop('currentFileAmount',fileAmount);
                $this.prop('disabled',false);
            }
        });
    });

    // 删除已上传的文件
    $(document).on('click','.upload-status .btn-delete',function(){
        var uploadStatus = $(this).parents('.upload-status');
        var $inp = uploadStatus.siblings('input');
        var fileAmount = $inp.prop('currentFileAmount');
        fileAmount--;
        $inp.prop('currentFileAmount',fileAmount);
        $inp.prop('disabled',false);
        $inp.val('');
        uploadStatus.remove();

    });

    // 表单提交验证
    var valid = true;
    var focusOn = false; // 是否聚焦到当前表单
    $(document).on('click','.submit-appliaction',function(){
        changeLang();
        var len = $('.application-form li.mandatory').length;
        valid = true;
        focusOn = true;
        // 判断填写是否符合要求
        for(var i=0;i<len;i++){
            var $this = $('.application-form li.mandatory').eq(i);
            if($this.attr('data-inp') == 'text'){
                checkInpText($this.find('.inp-text').val(), $this.find('.inp-text'));
            } else if($this.attr('data-inp') == 'select'){
                checkSelect($this.find('a'));
            } else if($this.attr('data-inp') == 'date'){
                checkDate($this);
            } else if($this.attr('data-inp') == 'radio'){
                checkRadio($this);
            } else if($this.attr('data-inp') == 'file'){
                checkFile($this);
            }
        }
        if(valid){
            $('.pop-submit-success').fadeIn(200);
        }
    });

    // 文件上传-判断文件格式是否符合要求
    function fileTypeOK(_thisInp,filename){
        var fileList = _thisInp.prop('allowType').split(',');
        var fileType = '.' + filename.split('.')[filename.split('.').length - 1];
        var isOk = false;
        for(var i=0;i<fileList.length;i++){
            if(fileList[i] == fileType){
                isOk = true;
                break;
            }
        }
        return isOk;
    }

    // 检查文本输入框
    function checkInpText(val,_thisInp){
        var tipTitle = _thisInp.parents('li').find('h5').text();
        if(val == ''){
            tipShow(_thisInp, langTip[0] + tipTitle);
        } else if(_thisInp.hasClass('check-email')){
            // 检查邮箱
            var isEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            if(!isEmail.test(val)){
                tipShow(_thisInp,langTip[1]);
            } else{
                tipHide(_thisInp);
            }
        } else{
            tipHide(_thisInp);
        }
    }

    // 检查下拉选项是否选择
    function checkSelect(_thisA){
        var text = _thisA.parents('li').find('h5').text();
        if(!_thisA.hasClass('selected')){
            tipShow(_thisA, langTip[2] + text);
        }
    }

    // 检查日期是否填写且是否正确
    function checkDate(_thisLi){
        var text = _thisLi.find('h5').text();
        _thisLi.find('.mod-select').each(function(index, el) {
            if(!$(el).find('a').hasClass('selected')){
                tipShow($(el).find('a'),langTip[2] + text);
            }
        });
    }

    // 检查选项是否填写
    function checkRadio(_thisQst){
        var tipTitle = _thisQst.find('h5').text();
        var options = _thisQst.find('input[type="radio"]');
        if(!isChecked(options)){
            tipShow(options.eq(0), langTip[3] + tipTitle)
        }
        
        function isChecked(options){
            var isChecked = false;
            options.each(function(index, el) {
                if($(el).is(':checked')){
                    isChecked = true;
                }
            });
            return isChecked;
        }
    }

    // 检查文件是否上传完整
    function checkFile(_this){
        var title = _this.find('h5').text();
        var _thisUploadInp = _this.find('.inp-upload');
        if(_thisUploadInp.prop('currentFileAmount') < _thisUploadInp.prop('minAmount')){
            tipShow(_thisUploadInp, langTip[7] + title);
        }
    }

    // 弹出提示
    function tipShow(_this,text){
        valid = false;
        var inpWrap = _this.parents('.inp-wrap');
        if(!_this.parents('li').hasClass('warn')){
            inpWrap.append('<p class="warn-tip">' + text + '</p>');
            _this.parents('li').addClass('warn');

        } else{
            inpWrap.find('.warn-tip').html(text);
        }
        if(focusOn){
            _this.focus();
            focusOn = false;
        }
    }

    // 移除提示
    function tipHide(_this){
        var inpWrap = _this.parents('.inp-wrap');
        if(_this.parents('li').hasClass('warn')){
            _this.parents('li').removeClass('warn');
            inpWrap.find('.warn-tip').remove();
        }
    }

    // 关闭弹窗
    $(document).on('click','.pop-submit-success [data-func="close"]',function(){
        window.location.href = 'http://ai.tencent.com/ailab/fellowship.html';
    });

});



$(function(){
    // 表单
    $(document).on('change','.qst-internship input',function(){
        var qstPlace = $(this).parents('li').next('.qst-place');
        if($('#internship-yes').is(':checked')){
            qstPlace.removeClass('hide');
        } else{
            qstPlace.addClass('hide');
        }
    });


    // 2018博士奖学金项目宣传弹层
    $(document).on('click','.pop-page .btn-detail',function(){
        $('.pop-page').fadeOut();
        return false;
    });
});