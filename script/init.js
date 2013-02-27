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
          $('#file').value = '';
          $('#uploadPreview').innerHTML = 'preview';
          $('#uploadPreview').style['backgroundImage'] = 'none';
          $('#upArea').classList.remove('ac');
          exports.appendImages();
        }
      });
    };

    exports.addFiles = function(files){
        tmpFiles = [];

        if(files.length == 0 ){
            $('#uploadPreview').innerHTML = 'preview';
            $('#uploadPreview').style['backgroundImage'] = 'none';
        }else{
            for(var n=0;n<files.length;n++){

                var fileObj = {
                    src : OURL.createObjectURL(files[n]),
                    file : files[n],
                    id : Date.now()
                };
                tmpFiles.push(fileObj);
            }

              $('#uploadPreview').style['backgroundImage'] = 'url(' + tmpFiles[0].src + ')';
              $('#uploadPreview').innerHTML = '';
        }
    };

    exports.appendImages = function(){
        if(tmpFiles.length == 0 ){return false;}
        Files = Files.concat(tmpFiles);
        tmpFiles = [];
        exports.showImages();
        exports.previewImages();
    };

    exports.showImages = function(){
        if(Files.length == 0){return false;}
        var Imgs = doc.querySelector('.imgsArea .imgs');
        Imgs.innerHTML = '';
        for(var n=0;n<Files.length;n++){
            var img = doc.createElement('div');
            img.innerHTML = '<div class="close">x</div>';
            img.className = 'img';
            img.style['backgroundImage'] = 'url(' +Files[n].src+ ')';
            Imgs.appendChild(img);
        }
    };

    exports.previewImages = function(){
        if(Files.length == 0){return false;}
        var _preview = doc.querySelector('#preview');
        _preview.style['backgroundImage'] = '';

        for(var n=0;n<Files.length;n++){
            if(n==0){
                _preview.style['backgroundImage'] = 'url(' +Files[n].src +')';
            }else{
                console.log('hello?')
                _preview.style['backgroundImage'] += ',url(' +Files[n].src +')';
            }
        }
    };

});