!function(e,t){function n(t,n,i){if("createEvent"in document&&"function"==typeof MouseEvent){var o=document.createEvent("MouseEvents");o.initEvent(n,!0,!0),o.data=i,t.dispatchEvent(o)}else e(t).trigger(e.Event({type:n,data:i}))}function i(t){var n,i,o=t.originalEvent;switch(t.type=t.type.toLowerCase(),t.eventType=p[t.type]||t.type,t.eventCode=c[t.type]||0,n=s[t.eventType],t.eventType){case"mouse":case"pointer":var a=o.pointerId||0;3==t.eventCode?delete n[a]:n[a]=t,t.changedPointers=[{id:a,pointer:t}],t.pointers=e.map(n,function(e,t){return{id:t,pointer:e}});break;case"touch":s[t.eventType]=n=o.touches,t.changedPointers=e.map(o.changedTouches,function(e){return{id:e.identifier,pointer:e}}),t.pointers=e.map(o.touches,function(e){return{id:e.identifier,pointer:e}})}return(i=t.pointers[0])&&(t.pageX=i.pointer.pageX,t.pageY=i.pointer.pageY),t.length=t.pointers.length,t}function o(e){return e.replace(/^-ms-/,"ms-").replace(/-([a-z]|[0-9])/gi,function(e,t){return(t+"").toUpperCase()})}var a={start:1,down:1,move:2,end:3,up:3,cancel:3},r=[],p={},c={},s={},u={};e.each("mouse touch pointer MSPointer-".split(" "),function(t,n){var i=/pointer/i.test(n)?"pointer":n;e.each(a,function(e,t){var a=o(n+e);r.push(a),s[i]={},p[a.toLowerCase()]=i,c[a.toLowerCase()]=t})}),u=r.join(" "),function(){var t,o,a,r,p,c,s,d,v;e(document).on(u,function(e){switch(i(e),s=e.which<2&&(!d||d==e.eventType),e.eventCode){case 1:s&&e.length<2&&!o&&(clearTimeout(v),d||(d=e.eventType),o=+new Date,a=e.pageX,r=e.pageY,p=0,c=0,t=e.target);break;case 3:if(s&&!e.length&&o){var u,h=+new Date-o,g=Math.abs(p),f=Math.abs(c);g<5&&f<5?h<300?n(t,"tap",h):n(t,"longTap",h):h<600&&(g>30||f>30)&&(g>f?(u=p>0?"right":"left",n(t,"swipe",{time:h,distance:g,direction:u})):(u=c>0?"down":"up",n(t,"swipe",{time:h,distance:f,direction:u})),n(t,"swipe"+u,{time:h,distance:Math.max(g,f)})),t=o=a=r=null,v=setTimeout(function(){d=null},1e3)}break;case 2:s&&o&&(p=e.pageX-a,c=e.pageY-r)}})}()}(jQuery);