(function () {
    function Module() {

    }
    Module.prototype.set = function (name, m) {
        if (typeof m == "function") {
            m = m();
        }
        if (Array.isArray(m)) {
            var _this = this;
            var fun = m.splice(-1)[0];
            var args = m.map(function (k, v) {
                return _this.get(k);
            });
            m = fun.apply({},
                args);
        }
        this[name] = m;
    }
    Module.prototype.get = function (name, m) {
        return this[name];
    }
    this.module = new Module();
})(window);
module.set("promise", function () {
    function defer() {
        function resolve(d) {
            this.promise.data = d;
            this.promise.state = "fulfilled";
            trigger(this.promise);
        }

        function reject() {
            this.promise.data = d;
            this.promise.state = "reject";
            trigger(this.promise);
        }
        var promise = new Promise();

        function Promise() {
            this.successFun = [];
            this.errorFun = [];
            this.state = "pending";
            this.data = null;
            this.d = null;
        }
        Promise.prototype.then = function (success, error) {
            this.successFun.push(success);
            this.errorFun.push(error);
        }

        function thenCall(s, e) {
            if (p.state == "pending") {
                return;
            } else if (p.state == "fulfilled") {
                p.d = s(p.d);
            } else if (p.state == "reject") {
                p.d = e(p.d);
            }
        }

        function trigger(p) {
            if (p.state == "pending") {
                return;
            } else if (p.state == "fulfilled") {
                var s = p.successFun;
                p.d = p.data;
                for (var i = 0; i < s.length; i++) {
                    var cur = s[i];
                    p.d = cur(p.d);
                }
            } else if (p.state == "reject") {
                var s = p.errorFun;
                p.d = p.data;
                for (var i = 0; i < s.length; i++) {
                    var cur = s[i];
                    p.d = cur(p.d);
                }
            }
        }
        var defer = {
            resolve: resolve,
            reject: reject,
            promise: promise
        }
        return defer;
    }
    return {
        defer: defer
    }
});
module.set("blob", ["promise",
    function ($q) {
        function blobToBase64(blob) {
            var reader = new FileReader();
            var defer = $q.defer();
            reader.addEventListener("loadend",
                function (d) {
                    defer.resolve(d.target.result);
                });
            reader.readAsDataURL(blob);
            return defer.promise;
        }
        return {
            blobToBase64: blobToBase64
        }
    }
]);

module.set("img", ["promise",function ($q) {
        function compress(base64) {
            var reader = new FileReader();
            var defer = $q.defer();
            var img = new Image();
            img.addEventListener("load",
                function () {
                    var width = img.width;
                    var height = img.height;
                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");
                    ctx.fillStyle = "#fff";
                    canvas.width = width;
                    canvas.height = height;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, width, height);
                    var base = canvas.toDataURL("image/jpeg", 1.0);
                    defer.resolve(base);
                });
            img.src = base64;
            return defer.promise;
        }

        return {
            compress: compress
        }
    }
]);
module.set("upload", ["promise",
    function ($q) {
        function upload(url, basestr) {
            var defer = $q.defer();

            var xhr = new XMLHttpRequest();
            xhr.open('post', url);
            xhr.addEventListener("loadend", function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    console.log('上传成功：' + xhr.responseText);
                    defer.resolve(xhr.responseText);
                } else {
                    defer.resolve(xhr.statusText);
                }
            });
            xhr.send(basestr);
            return defer.promise;
        }
        return {
            upload: upload
        }
    }
]);
module.set("main", ["blob", "img", "upload",
    function (blob, img, upload) {
        window.addEventListener("load",
            function (e) {
                var input = document.querySelector("#input");
                input.addEventListener("change",
                    function (e) {
                        var file = input.files[0];
                        blob.blobToBase64(this.files[0]).then(function (d) {
                            var img=new Image();
                            img.src=d;
                            img.style.width="500px";
                            img.style.height="auto";
                            document.querySelector("body").appendChild(img);
                            if (file.size > 2000000) {
                                img.compress(d).then(function (d) {
                                    upload.upload("a", d).then(function (d) {
                                            console.log(d)
                                        },
                                        function (d) {
                                            console.log(d)
                                        });
                                });
                            } else {
                                upload.upload("a", d).then(function (d) {
                                        console.log(d)

                                    },
                                    function (d) {
                                        console.log(d)
                                    });
                            }
                        });
                    });
            });
    }
]);