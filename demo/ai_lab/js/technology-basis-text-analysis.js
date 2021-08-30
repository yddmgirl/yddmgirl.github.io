/* 功能体验点击换一段示例功能开始 */

var ip = 'http://100.102.32.50'
var syntacticParsingUrl = ip + ':8081/appdemo/syntactic_parsing'
var wordposUrl = ip + ':8081/appdemo/wordpos'

var userInputData = generateAuthenticationInfo()  // 获取鉴权信息

var $changeSentenceBtn = $('#change-sentence')  // 换一段示例按钮
var curSentenceId = 0  // 当前示例id

// 生成词性HTML（介词、名词、动词等）
function generateWordTypesHtml(data) {
  var html = ''
  var wordTypes = data.tokens.map(function (item) {
    return item.wtype
  })
  // return $.unique(wordTypes)  jQuery当前版本2.0.0，调用这个方法不能去重，旧版本1.11.3正常
  var uniqueWordTypes = []
  wordTypes.forEach(function (item) {
    if ($.inArray(item, uniqueWordTypes) === -1) {
      uniqueWordTypes.push(item)
    }
  })
  uniqueWordTypes.forEach(function (item) {
    html += '<a href="javascript:;" data-label="' + item + '">' + item + '</a>'
  })
  return html
}

// 生成分词HTML
function generateWordsHtml(data) {
  var html = ''
  data.tokens.forEach(function (item) {
    html += '<span data-word-type="' + item.wtype + '">' + (item.word == ' ' ? '&nbsp;' : item.word) + '</span>'
  })
  return html
}

var sentences = ['腾讯总裁刘炽平强调，人工智能具有战略意义，并表示公司会持续进行长期投资',
                 '腾讯公司级AI战略蓄势待发，聚集全球数十位人工智能科学家、70位世界一流AI博士。专注机器学习、计算机视觉、语音识别、自然语言处理等人工智能领域的研究',
                 '腾讯AI Lab学术合作计划秉持开放、灵活、共赢的原则，旨在通过无边际的产学研合作，推动人工智能的前沿研发和人才培养',
                 '2017年3月23日至24日，首届腾讯AI Lab学术论坛在深圳成功举行',
                 '昨天凌晨，全世界的目光都聚焦在美国的肯尼迪航天中心，在成千上万现场观众的欢呼声中，“猎鹰重型”火箭成功发射']
// 更换示例
function changeSentence(sentenceId) {
  var mes = sentences[sentenceId]
  userInputData.data = { 'text': encodeURI(mes) }

  wordposRequest()
  syntacticParsingRequest()
}

// 显示第一段示例
changeSentence(0)

$changeSentenceBtn.on('click', function (e) {
  curSentenceId = (curSentenceId + 1) % 5
  changeSentence(curSentenceId)
})

/* 功能体验点击换一段示例功能结束 */

// 分词和词性高亮
$('.analysis-words').on('click', function (e) {
  if ($(e.target).parent('.words-list').length > 0) {
    // 点击分词
    var wordType = e.target.dataset.wordType
    var $allWordCats = $(this).find('.words-cats a')
    var $relatedWordCat = $(this).find('.words-cats a[data-label="' + wordType + '"]')
    $(e.target).siblings().removeClass('selected')
    $allWordCats.removeClass('selected')
    $(e.target).addClass('selected')
    $relatedWordCat.addClass('selected')
  } else if ($(e.target).parent('.words-cats').length > 0) {
    // 点击词性
    var wordCat = e.target.dataset.label
    var $allWords = $(this).find('.words-list span')
    var $relatedWords = $(this).find('.words-list span[data-word-type="' + wordCat + '"]')
    $(e.target).siblings().removeClass('selected')
    $allWords.removeClass('selected')
    $(e.target).addClass('selected')
    $relatedWords.addClass('selected')
  }
})

/* 句法分析相关功能开始(部分代码引用自nlu.oa.com) */

// 文本框输入
$('#sentence-input').keydown(function(e) {
  if (e.which == 13) {
    var mes = $('#sentence-input').val()
    userInputData.data = { 'text': encodeURI(mes) }
    wordposRequest()
    syntacticParsingRequest()
    e.preventDefault()  // 取消默认的回车换行
  }
})

// 分词/词性请求
function wordposRequest() {
  $.ajax({
    url: wordposUrl,
    type: 'POST',
    data: userInputData,
    crossDomain: true,
    success: function(data, statusText, smlHttpRequest) {
      console.log(data.result)

      $('#sentence-input').val(data.result.sentence)
      $('.analysis-words .words-list').html(generateWordsHtml(data.result))
      $('.analysis-words .words-cats').html(generateWordTypesHtml(data.result))
      $('.analysis-words .words-list span:first').click()  // 选中第一个分词
    }
  })
}

// 句法分析请求
var myChart, option, zr

function syntacticParsingRequest() {
  $.ajax({
    url: syntacticParsingUrl,
    type: 'POST',
    data: userInputData,
    crossDomain: true,
    success: function(data, statusText, smlHttpRequest) {
      $result = $.parseJSON(data).result
      console.log($result)

      // 绘制树图之前先把container显示出来，否则canvas宽高为零
      var $container = $('.analysis-content-item.sentence-analysis-area')
      $container.addClass('force-show')

      myChart = echarts.init(document.getElementById('analysis-canvas-area'), 'macarons');
      option = {
        series : [
          {
            name:'树图',
            type:'tree',
            orient: 'vertical',  // vertical horizontal
            rootLocation: { x: 100, y: 20 }, // 根节点位置  {x: 100, y: 'center'}
            nodePadding: 120,
            layerPadding: 40,
            hoverable: false,
            roam: true,
            symbolSize: 6,
            itemStyle: {
              normal: {
                color: '#4883b4',
                label: {
                  show: true,
                  position: 'right',
                  formatter: "{b}",
                  textStyle: {
                    color: '#000',
                    fontSize: 15
                  }
                },
                lineStyle: {
                  color: '#ccc',
                  type: 'curve' // 'curve'|'broken'|'solid'|'dotted'|'dashed'
                }
              },
              emphasis: {
                color: '#4883b4',
                label: {
                  show: false
                },
                borderWidth: 0
              }
            },
            data: $result
          }
        ]
      };

      initTree(option)

      // 绘制完树图之后恢复之前的状态
      $container.removeClass('force-show')

      // 生成树图对应的图例
      var treeLegendsHtml = createTreeLegendsHtml(getAllWordAbbrs($result), treeLegendsMap)
      $container.find('.sentence-relationship ul').html(treeLegendsHtml)
    }
  })
}

function initTree(data) {
  myChart.setOption(data)
  adjustTree()                    // 生成图表后调整
}

function adjustTree() {
  zr = myChart.getZrender()
  var domWidth = zr.painter.getWidth()
  var treeWidth = getTreeWidth(zr)
  // if (treeWidth <= domWidth) {
  //     return
  // }
  // var adjustSize = domWidth / treeWidth * 0.95        // 调整为dom宽度的0.95
  // var lastNodeX = zr.storage._roots[zr.storage._shapeListOffset - 1].style.x * adjustSize // 调整后的最后一个节点距root节点的x方向偏移量
  // var rightOffset = (domWidth - lastNodeX) - (domWidth - treeWidth * adjustSize)/2    // 右移量，保持整体居中
  zr.painter._layers[1].scale = [zoom, zoom, 0, 0]    // 前两个参数为x，y方向缩放比例，后两个为缩放原点  详见zrender API
  // zr.painter._layers[1].position = [rightOffset, treeTopPadding]  // 偏移量
  myChart.refresh()
}

function getTreeWidth(zr) {
  var nodes = zr.storage._roots
  // var max = nodes[nodes.length - 1].style.x,
  var max = 0, min = 0
  for (var i = 0, len = nodes.length; i < len; i++) {
    if (nodes[i].type == 'icon') {
      var nodeX = nodes[i].style.x
      if (nodeX > max) {
        max = nodeX
        continue
      }
      if (nodeX < min) {
        min = nodeX
      }
    }
  }
  return max - min
}

// 从nlu.oa.com引用的代码 ***********************************************************

// 树图图例字典，暂时写在代码里
var treeLegendsMap = {
  'ROOT': '原始语句',
  'IP': '简单句',
  'NP': '名词短语',
  'VP': '动词短语',
  'PU': '断句符',
  'LCP': '方位词短语',
  'PP': '介词短语',
  'CP': '由"的"构成的修饰性关系的短语',
  'DNP': '由"的"构成的表示所属关系的短语',
  'ADVP': '副词短语',
  'ADJP': '形容词短语',
  'DP': '限定词短语',
  'QP': '量词短语',
  'AD': '副词',
  'AS': '语态词',
  'BA': '把',
  'CC': '并列连接词',
  'CD': '许多',
  'CS': '从属连接词',
  'DEC': '从句"的"',
  'DEG': '修饰"的"',
  'DER': '得',
  'DEV': '地',
  'DT': '限定词',
  'ETC': 'for words 等，等等',
  'FW': '外来词',
  'IJ': '感叹词',
  'JJ': '名词修饰语',
  'LB': '被,给',
  'LC': '方位词',
  'MSP': '其他小品词',
  'NN': '普通名词',
  'NR': '专有名词',
  'NT': '时间名词',
  'OD': '序数',
  'ON': '拟声法',
  'P': '介词',
  'PN': '代词',
  'PU': '标定符号',
  'SB': '被，给',
  'SP': '句尾语气词',
  'VA': '表语形容词',
  'VC': '是',
  'VE': '有',
  'VV': '情态动词'
}

// 从树图的返回数据中获取所有的名字单词缩写
function getAllWordAbbrs(data) {
  var abbrs = []
  data.forEach(function (item) {
    if (item.children) {
      abbrs.push(item.name)
      abbrs = abbrs.concat(getAllWordAbbrs(item.children))
    }
  })
  var uniqueAbbrs = []
  abbrs.forEach(function (item) {
    if ($.inArray(item, uniqueAbbrs) === -1) {
      uniqueAbbrs.push(item)
    }
  })
  return uniqueAbbrs
}

// 生成树图图例HTML
function createTreeLegendsHtml(abbrs, legendsMap) {
  var html = ''
  abbrs.forEach(function (item) {
    if (legendsMap[item]) {
      html += '<li>' + item + '-' + legendsMap[item] + '</li>'
    }
  })
  return html
}

// 调整树图初始大小
var zoom = 1,
  focusX = 359,
  focusY = 230

function zoomInTree() {
  zoom += 0.1
  // zr.painter._layers[1].scale = [zoom, zoom, focusX, focusY]
  // myChart.clear()
  // myChart.setOption(option, true)
  $('#analysis-canvas-area').css({ 'transform': 'scale(' + zoom + ')' })
}

function zoomOutTree() {
  if (zoom > 0.1) {
    zoom -= 0.1
    zr.painter._layers[1].scale = [zoom, zoom, focusX, focusY]
    myChart.refresh()
  }
  return
}

$('.sentence-analysis-area .btn-zoom-in').on('click', function() {
  zoomInTree()
})

$('.sentence-analysis-area .btn-zoom-out').on('click', function() {
  zoomOutTree()
})

// echarts没有找到控制图表缩放的API，这利用模拟的滚轮事件实现，点击放大或者缩小按钮用脚本触发滚轮事件
// function dispatchWheelEvent_Chrome(el, delta) {
//     var evt = document.createEvent("MouseEvents");
//     evt.initEvent('mousewheel', true, true);
//     evt.wheelDelta = delta;
//     el.dispatchEvent(evt);
//     $('.pop-tip').css('display', 'none')
// }
//
// function sumilateMouseFocus() {
//     $('.analysis-canvas-area').on('mousemove', function(e) {
//         e.offsetX = 379
//         e.offsetY = 295
//     })
// }
// 点击放大缩小按钮控制树图缩放
// $('.sentence-analysis-area .btn-zoom').on('click', function (e) {
//     var treeCanvas = $('#analysis-canvas-area canvas:first').get(0)
//     var delta = $(this).hasClass('btn-zoom-in') ? 120 : -120
//     dispatchWheelEvent_Chrome(treeCanvas, delta)
//     sumilateMouseFocus()
//
// })
// $('.sentence-analysis-area .btn-zoom').on('click', function (e) {
//     var treeCanvas = $('#analysis-canvas-area canvas:first').get(0)
//     var delta = $(this).hasClass('btn-zoom-in') ? 120 : -120
//     dispatchWheelEvent_Chrome(treeCanvas, delta)
//
//     var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft
//     var scrollY = document.documentElement.scrollTop || document.body.scrollTop
//     var x = $('.analysis-canvas-area')[0].getBoundingClientRect().left + scrollX + 379
//     var y = $('.analysis-canvas-area')[0].getBoundingClientRect().top + scrollY + 295
//     console.log(x + ',' + y)
// })

// 隐藏拖动提示
$('.analysis-canvas-area').one('mousewheel', function() {
  $('.pop-tip').css('display', 'none')
})

$('.sentence-analysis-area .btn-zoom-in').one('click', function() {
  $('.pop-tip').css('display', 'none')
})

$('.sentence-analysis-area .btn-zoom-out').one('click', function() {
  $('.pop-tip').css('display', 'none')
})

function hideTips(obj) {
  obj.on('mousedown', start)
  function start(e) {
    if (e.button == 0) {
      obj.on('mousemove', move)
      obj.on('mouseup', stop)
    }
    return false
  }
  function move() {
    $('.pop-tip').css('display', 'none')

    return false
  }
  function stop() {
    obj.off('mousedown', start)
    obj.off('mousemove', move)
    obj.off('mouseup', stop)
  }
}

// var tree = $('.analysis-canvas-area')
hideTips($('.analysis-canvas-area'))

/* 句法分析相关功能结束 */
