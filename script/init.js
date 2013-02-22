seajs.config({
     base:'./script',
     alias:{
     'touch':'library/touch.js'
     // 'slider' : 'library/slider',
     // 'underscore' : 'library/underscore-min.js'
     },
     preload:['touch']
});

seajs.use('init.js',function(init){
    init.start();
});

define(function(require,exports){
    var doc = document;

    var $ = function(query){
      return doc.querySelector(query);
    };

    var BE = function(dom,type,fun){
      if(!dom){return false;}
      type = type || 'click';
      if (!!dom) {
        dom.addEventListener(type,function(e){
          fun && fun.apply(this,[e]);
        },false);
      }
    };

    var OURL = window.URL || window.webkitURL;

    var Src; //生成的预览src

    var Files = [];
    var tmpFiles = [];

    exports.start = function(){
        exports.bindEvents();
    };

    exports.bindEvents = function(){
      BE($('#add'),'click',function(){
          $('#upArea').classList.toggle('ac');
      });

      BE($('#upArea .close'),'click',function(){
          $('#upArea').classList.remove('ac');
      });

      BE($('#file'),'change',function(){
        var files = $('#file').files;
        exports.addFiles(files);
      });

      BE($('#finish'),'click',function(e){
        if(tmpFiles.length == 0){
          alert('please upload image first!');
          return false;
        }else{
          if(!!Src){OURL.revokeObjectURL(Src);}
          $('#file').value = '';
          $('#uploadPreview').innerHTML = 'preview';
          $('#uploadPreview').style['backgroundImage'] = 'none';
          $('#upArea').classList.remove('ac');
          exports.appendImages();
        }
      });

    };

    exports.addFiles = function(files){
        if(Src){OURL.revokeObjectURL(Src);}
        tmpFiles = files;
        if(tmpFiles.length == 0 ){
            $('#uploadPreview').innerHTML = 'preview';
            $('#uploadPreview').style['backgroundImage'] = 'none';
        }else{

          Src = OURL.createObjectURL(tmpFiles[0]);
          $('#uploadPreview').style['backgroundImage'] = 'url(' + Src + ')';
          $('#uploadPreview').innerHTML = '';
        }
    };

    
});