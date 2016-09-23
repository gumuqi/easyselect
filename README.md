# 易数项目：前端模块文档

## 运行环境   
HTTP服务：nginx    
其中数据请求nginx配置反向代理，解决ajax跨域。
```html
#本地开发nginx配置
    server {
        listen       80;
        server_name  localhost;

        location / {
            root   E:/program/ark2/ark2-client;
            expires -1;
        }
        location /api {
            proxy_pass    http://10.164.96.64:8183;
        }
        http {
            gzip  on;
            gzip_proxied any;
            gzip_min_length  1024;
            gzip_buffers     4 8k;
            gzip_comp_level 3;
            gzip_types       text/plain text/css application/x-javascript application/javascript application/xml application/json;
        }
    }
```

## 项目结构
* dist：开发目录，存放公共静态资源：js,css,imgs
* lib: 第三方库
* pages：html模板编译后目录, 存放静态html页面
* template：html静态模板
* plugins：第三方插件


## 依赖库
* jquery
* bootstrap
* echartJs
* requireJs

## 前端工程化
* 静态html模板预处理：gulp + gulp-html-extend
* 本地开发调试命令： gulp local
* 发布前命令： gulp online
* 静态资源处理：
1. 公共js库合并,包括 jQuery, app.min, bootstrap，生成 public.js： gulp + gulp-concat
2. 各业务模块js代码合并(requireJs模块化开发),压缩，添加hash(MD5)：gulp + gulp-alias-combo + gulp-uglify + gulp-rev
3. 编译后的html页面中，修改引用的js业务入口文件: gulp + gulp-rev-collector
4. 删除不需要的文件以及文件夹： gulp + del    
***合并的js文件只包括业务模块**


## 自动化测试

## 项目相关地址
* [git地址](https://g.hz.netease.com/dap/ark2-client.git)
* [测试地址](http://10.164.96.64:8183/pages/manager/event.html)

