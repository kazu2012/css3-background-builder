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
    var iTouch = require('touch'); 
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


      var resizeTimer = null;
      window.addEventListener('resize',function(e){
        if(resizeTimer){
          clearTimeout(resizeTimer);
          resizeTimer = null;
        }
        var _preview = doc.getElementById('preview');
        var _preview_size = doc.getElementById('preview_size');
        _preview_size.style.display = '';
        _preview_size.innerHTML = _preview.clientWidth + 'px , '+ _preview.clientHeight + 'px';
        resizeTimer = setTimeout(function(){
          _preview_size.style.display = 'none';
        },3000);
      });

      iTouch({
          element:doc.getElementById('preview'),
          start:function (e, x, y) {
            exports._start(e,x,y);
          },
          move:function (e, dir, disX, disY, x, y) {
             exports._move(e,dir,disX,disY,x,y);
          },
          end:function () {
            exports._end();
          }
      });

      var Imgs = doc.getElementById('imgs');
      Imgs.addEventListener('click',function(e){
        var _target = e.target;
        if(_target.classList.contains('img')){
          var _id = ~~_target.getAttribute('_id');
          exports.toggleSelect(_id);
          exports.render();
        }
      });


      window.onkeydown = function(e){
        e.preventDefault();

        var _x=0,_y=0;
        var fact = e.shiftKey ? 10 : 1;
        switch(e.keyCode){

          case 38 : 
           _y=-1;
           break;
          case 40 : 
           _y=1;
           break;
          case 37 : 
           _x=-1;
           break;
          case 39 : 
           _x=1;
           break;
        }
        Files.forEach(function(file,index){
          if(file.selected){
            file.x += _x*fact;
            file.y += _y*fact;
          }
        });
        exports.render();
      };


    };

    exports.toggleSelect = function(id){
      if(!id){return;}
      for(var n=0;n<Files.length;n++){
        var _file = Files[n];
        if(_file.id == id){
          _file.selected = true;
        }else{
          _file.selected = false;
        }
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
                    selected : false,
                    src : OURL.createObjectURL(files[n]),
                    file : files[n],
                    id : ~~Date.now() + ~~(Math.random() * 1000),
                    x : 0,
                    y : 0,
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
        Files = tmpFiles.concat(Files);
        tmpFiles = [];
        exports.toggleSelect(Files[0].id);
        exports.render();
    };

    exports.showImages = function(){
        if(Files.length == 0){return false;}
        var Imgs = doc.getElementById('imgs');
        Imgs.innerHTML = '';
        for(var n=0;n<Files.length;n++){
            var _file = Files[n];
            var img = doc.createElement('div');
            img.className = 'img';
            img.style['backgroundImage'] = 'url(' +_file.src+ ')';
            img.setAttribute('_id',_file.id);
            if(_file.selected){
              img.classList.add('ac');
            }
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
                _preview.style['backgroundPositionX'] = Files[n].x + 'px';
                _preview.style['backgroundPositionY'] = Files[n].y + 'px';

            }else{
                _preview.style['backgroundImage'] += ',url(' +Files[n].src +')';
                _preview.style['backgroundRepeat'] += ',' +  Files[n].repeat;
                _preview.style['backgroundSize'] += ',' + Files[n].backgroundSize;
                _preview.style['backgroundPositionX'] += ',' +  Files[n].x + 'px';
                _preview.style['backgroundPositionY'] += ',' + Files[n].y + 'px';
            }
        }
    };

    exports.genterCssCode = function(){
      var cssCode = '';
      cssCode += '{\n';
      var _bs = '';
      var _br = '';
      var _bi = '';
      var _bp = '';
      Files.forEach(function(_file,index){
        _bs += index ? ','+_file.backgroundSize : _file.backgroundSize;
        _br += index ? ',' + _file.repeat : _file.repeat;
        _bi += index ? ',' + 'url(' +  _file.file.name + ')' :  'url(' + _file.file.name + ')'; 
        _bp += index ? ',' + _file.x + 'px ' + _file.y + 'px' : _file.x + 'px ' + _file.y + 'px';
      });
      cssCode += 'background-image : ' + _bi + ';\n';
      cssCode += 'background-repeat : ' + _br + ';\n';
      cssCode += 'background-size : ' +  _bs + ';\n';
      cssCode += 'background-position : ' + _bp + ';\n';
      cssCode += '}'
      $('#code').value = cssCode;
    };

    var startX,startY;
    var copyFiles = [];
    exports._start = function(e,x,y){
      startX = x;
      startY = y;
      copyFiles = [];

      Files.forEach(function(file,index){
        var _file = {};
        for(var name in file){
          _file[name] = file[name];
        }
        copyFiles.push(_file);
      });
    };

    exports._move = function (e, dir, disX, disY, x, y) {
      if(startX == undefined || startY == undefined){return false;}
      Files.forEach(function(file,index){
        if(file.selected){
          file.x = copyFiles[index].x + x -startX;
          file.y = copyFiles[index].y + y - startY;
        }
      });
      exports.render();
    };          

    exports._end = function () {
      startX = startY = undefined;
      copyFiles = [];
    };

    exports.render = function(){
        exports.showImages();
        exports.previewImages();
        exports.genterCssCode();
    };



});