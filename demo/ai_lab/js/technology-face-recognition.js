'use strict'

// 人脸对比
function faceCompare (sourceImgBase64Str = '', targetImgBase64Str = '', sourceImgUrl = '', targetImgUrl = '') {
  const url = 'face_compare'
  var data = {
    source_image: sourceImgBase64Str,
    target_image: targetImgBase64Str,
    source_img_url: sourceImgUrl,
    target_img_url: targetImgUrl
  }
  return request(url, data)
}

// 人脸检测
function faceDetection (imageBase64Str = '', imgUrl = '') {
  const url = 'face_detection'
  var data = {
    image: imageBase64Str,
    img_url: imgUrl
  }
  return request(url, data)
}

// 人脸对比和人脸检测本地上传图片
$('.jmod-imgidy-scene .inputfile').on('change', function (e) {
  var fileUploadInputId = this.id
  var selectedFile = this.files[0]
  if (!selectedFile) return
  var validityInfo = checkImageValidity(selectedFile)
  if (!validityInfo.valid) {
    return alert(validityInfo.msg)
  }
  // 更新预览图
  var $previewImg = $(this).parents('.demo-box').find('.jmod-preview img')
  convertFileToBase64Str(selectedFile, true).then(imgBase64Str => {
    $previewImg.attr({
      src: imgBase64Str,
      'data-img-type': 'base64'
    }).one('load', function (e) {
      // 设置预览图的缩放并把人脸位置矩形框隐藏
      var $previewContainer = $previewImg.parents('.img-preview'),
          $faceInfoContainer = $previewImg.parents('.face-info'),
          $faceRect = $faceInfoContainer.find('.face-analysis-rect')
      var scaler = getPreviewImgScaler($previewContainer.get(0), $faceInfoContainer.get(0))
      $faceInfoContainer.css('transform', 'translate(-50%, -50%) scale(' + scaler + ')')
      $faceRect.hide()
      
      // 人脸检测部分本地选择图片之后更新人脸检测信息
      if (fileUploadInputId == 'face-detect-upload') {
        updateFaceDetectionInfo($previewImg.get(0), $faceInfoContainer)
      }
    })
  })
})

// 显示人脸对比信息
function displayFaceCompareInfo (compareInfo, $sourceFaceRect, $targetFaceRect) {
  $('.face-similarity span').text((compareInfo.score * 100).toFixed())
  $sourceFaceRect.css({
    left: compareInfo.source_face.x1 + 'px',
    top: compareInfo.source_face.y1 + 'px',
    width: (compareInfo.source_face.x2 - compareInfo.source_face.x1) + 'px',
    height: (compareInfo.source_face.y2 - compareInfo.source_face.y1) + 'px',
    display: 'block'
  })
  $targetFaceRect.css({
    left: compareInfo.target_face.x1 + 'px',
    top: compareInfo.target_face.y1 + 'px',
    width: (compareInfo.target_face.x2 - compareInfo.target_face.x1) + 'px',
    height: (compareInfo.target_face.y2 - compareInfo.target_face.y1) + 'px',
    display: 'block'
  })
}

// 更新人脸检测信息
function updateFaceDetectionInfo (sourceImg = '', $faceInfoContainer, imgUrl = '') {
  var imgBase64Str = ''
  if (sourceImg) {
    imgBase64Str = sourceImg.dataset.imgType && sourceImg.dataset.imgType == 'base64' ? removeBase64Header(sourceImg.src) : convertImgToBase64Str(sourceImg)
  }
  faceDetection(imgBase64Str, imgUrl).then(result => {
    if (result.code !== 0) {
      alert(result.msg)
    } else {
      displayFaceDetectionInfo(result, $faceInfoContainer)
    }
  }).catch(e => {
    console.log(e)
  })
}

// 显示人脸检测信息
function displayFaceDetectionInfo (result, $faceInfoContainer) {
  var faceDetectionInfo = result.result
  $faceInfoContainer.find('.face-analysis-rect').remove()
  faceDetectionInfo.forEach(function (item) {
    var rectLeft = item.x1,
        rectTop = item.y1,
        rectWidth = item.x2 - item.x1,
        rectHeight = item.y2 - item.y1
    $faceInfoContainer.append('<div class="face-analysis-rect" style="left: ' + rectLeft + 'px; top: ' + rectTop + 'px; width: ' + rectWidth + 'px; height: ' + rectHeight + 'px;"></div>')
  })
  // 更新右侧 json 信息
  $faceInfoContainer.parents('.face-detection-wrap').find('.jmod-result pre').text(JSON.stringify(result, null, '\t'))
}

// 点击示例图片把预览图缩放并把人脸位置矩形框隐藏
$('.jmod-imgidy-scene .img-list').on('click', function (e) {
  var $previewContainer = $(this).parents('.demo-box').find('.img-preview'),
      $faceInfoContainer = $previewContainer.find('.face-info'),
      $faceRect = $faceInfoContainer.find('.face-analysis-rect'),
      $previewImg = $faceInfoContainer.find('img')
  $previewImg.one('load', function (e) {
    var scaler = getPreviewImgScaler($previewContainer.get(0), $faceInfoContainer.get(0))
    $faceInfoContainer.css('transform', 'translate(-50%, -50%) scale(' + scaler + ')')
    $faceRect.hide()
    
    // 点击人脸检测部分的缩略图更新人脸检测信息
    if ($previewContainer.parents('.face-detection-wrap').length > 0) {
      var sourceImg = $previewImg.get(0)
      updateFaceDetectionInfo(sourceImg, $faceInfoContainer)
    }
  })
})

// 人脸对比和人脸检测自定义网络图片
$('.jmod-imgidy-scene .jmod-detect').on('click', function (e) {
  var detectBtnId = $(this).attr('id')
  var urlInput = $(this).parent().find('.jmod-network-url').get(0)
  if (!urlInput.checkValidity()) {
    return alert(urlInput.validationMessage)
  }
  // 在预览区域显示图片
  var img = new Image()
  img.onload = function (e) {
    var $imgPreviewContainer = $(urlInput).parents('.demo-box').find('.img-preview')
    $imgPreviewContainer.find('img').attr({
      src: urlInput.value,
      'data-img-type': 'network-url'
    }).siblings('.face-analysis-rect').hide()
    
    // 人脸检测部分获取人脸检测信息
    if (detectBtnId == 'face-detection-network-btn') {
      updateFaceDetectionInfo('', $imgPreviewContainer.find('.face-info'), urlInput.value)
    }
  }
  img.onerror = function (e) {
    alert('加载图片失败！')
  }
  img.src = urlInput.value
})

// 点击开始检测
$('.btn-start').on('click', function (e) {
  var $faceCompareImgPreviews = $('.face-compare-wrap .img-preview img'),
      sourceImg = $faceCompareImgPreviews.get(0),
      targetImg = $faceCompareImgPreviews.get(1),
      sourceImgType = sourceImg.dataset.imgType,
      targetImgType = targetImg.dataset.imgType,
      sourceImgBase64Str = '',
      targetImgBase64Str = '',
      sourceImgUrl = '',
      targetImgUrl = ''
  
  if (!sourceImgType || sourceImgType == 'url') {
    sourceImgBase64Str = convertImgToBase64Str(sourceImg)
  } else if (sourceImgType == 'base64') {
    sourceImgBase64Str = removeBase64Header(sourceImg.src)
  } else if (sourceImgType == 'network-url') {
    sourceImgUrl = sourceImg.src
  }
  
  if (!targetImgType || targetImgType == 'url') {
    targetImgBase64Str = convertImgToBase64Str(targetImg)
  } else if (targetImgType == 'base64') {
    targetImgBase64Str = removeBase64Header(targetImg.src)
  } else if (targetImgType == 'network-url') {
    targetImgUrl = targetImg.src
  }
  
  faceCompare(sourceImgBase64Str, targetImgBase64Str, sourceImgUrl, targetImgUrl).then(result => {
    if (result.code !== 0) {
      alert(result.msg)
    } else {
      displayFaceCompareInfo(result.result, $(sourceImg).parent().find('.face-analysis-rect'), $(targetImg).parent().find('.face-analysis-rect'))
    }
  }).catch (e => {
    console.log(e)
  })
})

// 人脸对比部分和人脸检测部分选中第一张图片
$(function () {
  $('.jmod-imgidy-scene .jmod-demo-list').find('img:first').click()
})