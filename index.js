(function(){
    var img=document.querySelector("#img");
    console.log(img);
    // var reader=new FileReader();
    // reader.addEventListener("loadend",function(d){
    //     console.log(d);
    // })
    // reader.readAsDataURL(img);


    var compress=(function(){
        var canvas=document.createElement("canvas");
        var ctx=canvas.getContext("2d");
        ctx.fillStyle="#fff";
        return function(img){
            canvas.width=img.width;
            canvas.height=img.height;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img,0, 0, img.width, img.height);
            var base=canvas.toDataURL("image/jpeg");
            return base;
        }        
    })();
    var base=compress(img);
    console.log(base);
})();


//  图片上传，将base64的图片转成二进制对象，塞进formdata上传
function upload(basestr, type, $li) {
  var text = window.atob(basestr.split(",")[1]);
  var buffer = new ArrayBuffer(text.length);
  var ubuffer = new Uint8Array(buffer);
  var pecent = 0 , loop = null;
  for (var i = 0; i < text.length; i++) {
    ubuffer[i] = text.charCodeAt(i);
  }
  var Builder = window.WebKitBlobBuilder || window.MozBlobBuilder;
  var blob;
  if (Builder) {
    var builder = new Builder();
    builder.append(buffer);
    blob = builder.getBlob(type);
  } else {
    blob = new window.Blob([buffer], {type: type});
  }
  var xhr = new XMLHttpRequest();
  var formdata = new FormData();
  formdata.append('imagefile', blob);
  xhr.open('post', '/cupload');
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log('上传成功：' + xhr.responseText);
      clearInterval(loop);
      //当收到该消息时上传完毕
      $li.find(".progress span").animate({'width': "100%"}, pecent < 95 ? 200 : 0, function () {
        $(this).html("上传成功");
      });
      $(".pic-list").append('<a href="' + xhr.responseText + '">' + xhr.responseText + '<img src="' + xhr.responseText + '" /></a>')
    }
  };
  //数据发送进度，前50%展示该进度
  xhr.upload.addEventListener('progress', function (e) {
    if (loop) return;
    pecent = ~~(100 * e.loaded / e.total) / 2;
    $li.find(".progress span").css('width', pecent + "%");
    if (pecent == 50) {
      mockProgress();
    }
  }, false);
  //数据后50%用模拟进度
  function mockProgress() {
    if (loop) return;
    loop = setInterval(function () {
      pecent++;
      $li.find(".progress span").css('width', pecent + "%");
      if (pecent == 99) {
        clearInterval(loop);
      }
    }, 100)
  }
  xhr.send(formdata);
}