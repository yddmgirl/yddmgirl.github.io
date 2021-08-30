'use strict'

// 生成图片标注列表 HTML
function generateAnnotationHtml (annotationInfo) {
  var html = '<h5 class="sec-tit">场景</h5>'
  annotationInfo.forEach(item => {
    var percent = (item.confidence * 100).toFixed(2) + '%'
    html += `<div class="sec-item">
                <div class="bar"><span style="width: ${percent};"></span></div>
                <p>${item.label}<label>${percent}</label></p>
            </div>`
  })
  return html
}

// 获取图片标注信息
function getImageAnnotation (imgBase64Data = '', imgUrl = '') {
  const url = 'image_annotation'
  var data = {
    image: imgBase64Data,
    img_url: imgUrl,
    topn: 10
  }
  return request(url, data)
}

// 获取看图说话信息
function getImageCaptionInfo (imgBase64Data = '', imgUrl = '') {
  const url = 'image_caption'
  var data = {
    image: imgBase64Data,
    img_url: imgUrl
  }
  return request(url, data)
}

// 更新图片标注信息和看图说话信息
function updateImageInfo (imgBase64Data = '', imgUrl = '') {
  getImageAnnotation(imgBase64Data, imgUrl).then(annotationInfo => {
    $('.jmod-data-result').html(generateAnnotationHtml(annotationInfo.result))
  }).catch (e => {
    console.log(e)
  })
  
  // 更新看图说话信息
  getImageCaptionInfo(imgBase64Data, imgUrl).then(captionInfo => {
    $('#image-json-result').html(JSON.stringify(captionInfo, null, '\t'))
  }).catch (e => {
    console.log(e)
  })
}

// 功能体验部分图片切换
$('.jmod-demo-list').on('click', function (e) {
  // 更新右侧列表标注信息
  var imgBase64Data = convertImgToBase64Str(e.target)
  updateImageInfo(imgBase64Data)
})

// 本地上传图片
$('#file_5').on('change', function (e) {
  var selectedFile = this.files[0]
  if (!selectedFile) return
  var validityInfo = checkImageValidity(selectedFile)
  if (!validityInfo.valid) {
    return alert(validityInfo.msg)
  }
  // 更新预览图
  var $previewImg = $('.jmod-preview img')
  var localImgSrc = URL.createObjectURL(selectedFile)
  $previewImg.one('load', function (e) {
    URL.revokeObjectURL(localImgSrc)
  })
  $previewImg.attr('src', localImgSrc)
  // 图片标注和看图说话信息
  convertFileToBase64Str(selectedFile).then(updateImageInfo)
})

// 自定义的网络图片
$('.jmod-detect').on('click', function (e) {
  var urlInput = $(this).parent().find('.jmod-network-url').get(0)
  if (!urlInput.checkValidity()) {
    return alert(urlInput.validationMessage)
  }
  // 在预览区域显示图片
  var img = new Image()
  img.onload = function (e) {
    $(urlInput).parents('.demo-box').find('.img-preview img').attr({
      src: urlInput.value,
      'data-img-type': 'network-url'
    })
    updateImageInfo('', urlInput.value)
  }
  img.onerror = function (e) {
    alert('加载图片失败！')
  }
  img.src = urlInput.value
})

// 显示第一张缩略图信息
$(function () {
  $('.jmod-demo-list img:first').click()
})
