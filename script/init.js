seajs.config({
     base:'./script',
     alias:{
     'touch':'library/touch.js'
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

      var _repeats = doc.querySelectorAll('input[name=repeat]');
      for(var n=0;n<_repeats.length;n++){
        var _repeat = _repeats[n];
        _repeat.addEventListener('change',function(){
          var _value = this.value;
          tmpFiles.forEach(function(_file,index){
            _file.repeat = _value;
          });
        },false);
      }

      var _bss = doc.querySelectorAll('input[name=bs]');
      for(var n=0;n<_bss.length;n++){
        var _bs = _bss[n];
        _bs.addEventListener('change',function(){
          var _value = this.value;
          tmpFiles.forEach(function(_file,index){
            _file.backgroundSize = _value;
          });
        },false);
      }

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
                    id : Date.now(),
                    repeat : exports._getRadioValue('repeat'),
                    backgroundSize : exports._getRadioValue('bs')
                };
                tmpFiles.push(fileObj);
            }
            $('#uploadPreview').style['backgroundImage'] = 'url(' + tmpFiles[0].src + ')';
            $('#uploadPreview').innerHTML = '';
        }
    };

    exports._getRadioValue = function(name){
        var _inputs = doc.querySelectorAll('input[name='+name+']');
        var value = null;
        if(_inputs && _inputs.length>0){
          for(var n=0;n<_inputs.length;n++){
            if(_inputs[n].checked){
              value = _inputs[n].value;
              break;
            };
          }
        }
        return value;
    };

    exports.appendImages = function(){
        if(tmpFiles.length == 0 ){return false;}
        Files = Files.concat(tmpFiles);
        tmpFiles = [];
        exports.showImages();
        exports.previewImages();
        exports.genterCssCode();
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
            img.se

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
                _preview.style['backgroundRepeat'] = Files[n].repeat;
                _preview.style['backgroundSize'] = Files[n].backgroundSize;
            }else{
                _preview.style['backgroundImage'] += ',url(' +Files[n].src +')';
                _preview.style['backgroundRepeat'] += ',' +  Files[n].repeat;
                _preview.style['backgroundSize'] += ',' + Files[n].backgroundSize;

            }
        }
    };

    exports.genterCssCode = function(){

      console.log(Files);

      var cssCode = '';
      cssCode += '{\n';
      var _bs = '';
      var _br = '';
      var _bi = '';
      Files.forEach(function(_file,index){
        _bs += index ? ','+_file.backgroundSize : _file.backgroundSize;
        _br += index ? ',' + _file.repeat : _file.repeat;
        _bi += index ? ',' + _file.file.name : _file.file.name;
      });
      cssCode += 'background-image : ' + _bi + ';\n';
      cssCode += 'background-repeat : ' + _br + ';\n';
      cssCode += 'background-size : ' +  _bs + ';\n';
      cssCode += '}'
        
      $('#code').value = cssCode;

    };



});