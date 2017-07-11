(function ($, window, document) {
    $.picUrl = '/HomeAsync/CropImage', $.upUrl = '/HomeAsync/upload'
    var curPage = 0, pages = 0;
    $.extend({
        check: function (val, type) {
            var r;
            switch (type) {
                case 'account':
                    r = /(^[\w.\-]+@(?:[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\.)+[A-Za-z]{2,6}$)|(^1\d{10}$)|(^\d{3,}$)/.test(val);
                    break;
                case 'pwd':

            }
            return r;
        },
        showmsg: function (msg) {
            var timer = null;
            var w_m = $('<div class="w_p"><div class="w_bg"></div><div class="w_t">' + msg + '</div></div>');
            w_m.appendTo('body').css({ left: Math.floor(($(window).width() - $('.w_p').innerWidth()) / 2) + 'px', top: $(window).scrollTop() + Math.floor(($(window).height() - $('.w_p').innerHeight()) / 2) + 'px' }).animate({ opacity: 1 }, 1000);
            timer = setTimeout(function () { w_m.animate({ opacity: 0 }, 1000, function () { $(this).detach() }) }, 1500);
        },
        checkModify: function (n, old) {
            var o = eval(n);
            var _o = eval(old);
            if (o.length !== _o.length) {
                return true;
            }
            else {
                for (i = 0; i < o.length; i++) {
                    if (o[i].name == _o[i].name && o[i].value != _o[i].value || o[i].name != _o[i].name) {
                        return true;
                    }
                }
            }
            this.showmsg("您还没有做任何修改！");
            return false;
        },
        lightbox: function (ops) {
            return '<div class="cm"><div class="lightBox"></div><div class="f_p"><div class="op_title"><span>' + ops.title + '</span><div class="close c"></div></div><div class="tx_f_pan"></div><div class="pforms"><div class="form_group"><div class="mb20"><label class="form_m">' + ops.content + '</label></div><div class="op_f"><input type="button" class="sub btn btn_2" value="' + ops.btn + '"><input type="button" class="btn default_btn btn_2 c" value="取消"></div></div></div></div>';
        },
        preview: function (img, selection) {

            if (!selection.width || !selection.height)
                return;

            var w = $(img).width();
            var h = $(img).height();

            var scaleX = 130 / selection.width;
            var scaleY = 130 / selection.height;

            var scaleX1 = 70 / selection.width;
            var scaleY1 = 70 / selection.height;

            var scaleX2 = 40 / selection.width;
            var scaleY2 = 40 / selection.height;
            $('#photo').data('x', selection.x1);
            $('#photo').data('y', selection.y1);
            $('#photo').data('w', selection.width);
            $('#photo').data('h', selection.height);

            $('.tx_img130 img').css({
                width: Math.round(scaleX * w),
                height: Math.round(scaleY * h),
                marginLeft: -Math.round(scaleX * selection.x1),
                marginTop: -Math.round(scaleY * selection.y1)
            });
            $('.tx_img70 img').css({
                width: Math.round(scaleX1 * w),
                height: Math.round(scaleY1 * h),
                marginLeft: -Math.round(scaleX1 * selection.x1),
                marginTop: -Math.round(scaleY1 * selection.y1)
            });
            $('.tx_img40 img').css({
                width: Math.round(scaleX2 * w),
                height: Math.round(scaleY2 * h),
                marginLeft: -Math.round(scaleX2 * selection.x1),
                marginTop: -Math.round(scaleY2 * selection.y1)
            });
        },
        file_up: function (ops) {
            try {
                var uploader = new qq.FileUploader({
                    element: document.getElementById(ops.elem),
                    action: $.upUrl,
                    dragText: '',
                    multiple: ops.multiple,
                    params: { t: ops.type || 0 },
                    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],
                    customHeaders: { 'Content-Type': 'multipart/form-data' },
                    acceptFiles: 'image/jpg,image/jpeg,image/png,image/gif',
                    sizeLimit: 10485760,
                    listElement: '',
                    uploadButtonText: ops.btnText,
                    debug: true,
                    inputName: 'file',
                    onSubmit: function (id, filename) {
                        ops.sub && ops.sub(id, filename);
                    },
                    onProgress: function (id, filename, loaded, total) {
                        if (typeof ops.pro === 'function') {
                            ops.pro(id, filename, loaded, total); return;
                        }
                        ops.root.find('#photo').css('background', '#333 url(../Content/images/loading.gif) no-repeat center center');
                    },
                    onComplete: function (id, fileName, responseJSON) {
                        if (responseJSON.Status != 0) {
                            $('#loading_img').hide();
                            if(typeof ops.com === 'function') {
                                ops.com(id, fileName, responseJSON);
                                return;
                            }
                            $.showmsg(responseJSON.Msg);
                            return false;
                        }else{
                            if (typeof ops.com === 'function') {
                                ops.com(id, fileName, responseJSON);
                                return;
                            }
                            var o_img = ops.root.find('#photo');
                            o_img.data(responseJSON.Data);
                            ops.root.removeClass('uped').addClass('edit_tx');
                            ops.root.find('#photo').attr({ 'src': responseJSON.Data.path });
                            $('#loading_img').hide();
                            ops.root.find('.tx_pre img').attr('src', responseJSON.Data.path);

                            var w, h, s = 1;
                            if (o_img.data('width') >= 360) {
                                w = 360;
                                h = Math.floor(o_img.data('height') * 360 / o_img.data('width'));
                                s = o_img.data('width');
                            }
                            else {
                                w = o_img.data('width');
                                h = o_img.data('height');
                            }
                            var sx = w / 4, sy = h / 4, ex = w * 3 / 4, ey = h * 3 / 4;
                            var vh = h / 2, hh = w / 2;

                            Math.floor(w / h * 10) >= 10 ? ops.root.find('#photo').imgAreaSelect({ x1: ((w - vh) / 2), y1: sy, x2: ((w + vh) / 2), y2: ey, show: true, persistent: true, aspectRatio: '1:1', handles: true, parent: ops.root.find('.tx_op'), fadeSpeed: 200, onSelectChange: $.preview, onSelectEnd: $.preview, onInit: $.preview }).data(responseJSON.Data) : ops.root.find('#photo').imgAreaSelect({ x1: sx, y1: ((w - hh) / 2), x2: ex, y2: ((w - hh) / 2 + hh), show: true, persistent: true, aspectRatio: '1:1', handles: true, parent: ops.root.find('.tx_op'), fadeSpeed: 200, onSelectChange: $.preview, onSelectEnd: $.preview, onInit: $.preview }).data(responseJSON.Data);
                            o_img.parent().bind('dblclick', function () {
                                $.ajax({
                                    url: $.picUrl,
                                    type: 'POST',
                                    data: { x: o_img.data('x'), y: o_img.data('y'), w: o_img.data('w'), h: o_img.data('h'), path: o_img.data('path'), t: 0 },
                                    success: function (data) {
                                        $('.cm').remove();
                                        var Data = $.parseJSON(data);
                                        if (Data.Status !== 0)
                                            return false;
                                        $('.cur_tx img').attr('src', Data.Data.LargeHead);
                                        $.showmsg('修改头像成功！');
                                    },
                                    error: function () {
                                        $.showmsg("服务器错误！");
                                    }
                                });
                            })
                        }
                    },
                    onError: function (id, fileName, xhr) {
                        if (typeof ops.error === 'function') {
                            ops.error(id, fileName, xhr);
                        }
                        $.showmsg('服务器繁忙，请稍后再试');
                    },
                    showMessage: function (message) { $.showmsg(message) }
                })
            } catch (e) {

            }
        },
        blackHandler: function (page) {
            var pages = 1;
            $.get('/HomeAsync/GetBlackList', { page: page }, function (data) {
                var temp = template('blist_temp', data);
                if (data.list.length == 0) {
                    $('.state_pass').show();
                    return;
                }
                $('.state_pass').hide();
                pages = data.pageInfo.TotalPage;
                $('#black_lists').html(temp).find('li').removeBlack();
            });
            if (pages == 1) return;
            $('.page').pagination({
                pages: pages,
                onPageClick: function (pageNumber, event) {
                    $.blackHandler(pageNumber);
                }
            });
        },
        pbY: function (elem, y) {
            var p = elem.css('background-position');
            return p.replace(/\S+$/, y);
        },
        scrollAuto: function () {
            $(window).scroll(function () {
                if ($(window).scrollTop() <= 540) {
                    $('.ssbtn a').attr('href', function () {
                        var path = $(this).attr('href').split('#')[0];
                        return path + '#' + $(window).scrollTop();
                    })
                }
            })
        }
    });
    $.fn.getValid = function (ops) {
        var s = $.extend({}, { url: '/HomeAsync/SendMobile', resend_url: '/HomeAsync/Resend', type: 1 }, ops);
        return this.each(function (i, v) {
            var a = $('#account');
            $(v).bind('click', function () {
                if (a && a.next().hasClass('Validform_right')) {
                    var sec = 60, timer;
                    s.type = ($('.userType') != '') && $('.userType');
                    if (!$(v).hasClass('disable')) {
                        $(v).removeClass('default_btn').addClass('disable');
                        timer = setInterval(function () {
                            $(v).text(--sec + '秒后重新获取');
                            if (sec == 0) {
                                clearInterval(timer);
                                $(v).addClass('default_btn').removeClass('disable');
                                $(v).text('点击获取验证码');
                            }
                        }, 1000);
                        if ($(v).data('send') == 'yes') {
                            $.post(s.resend_url, { type: s.type }, function () {
                                if ($.parseJSON(data).Status == 0) {
                                    $(v).parent().next().show();
                                    $.showmsg('验证码已发送！');
                                    return false;
                                }
                                else {
                                    $.showmsg($.parseJSON(data).Msg);
                                }
                            })
                        }
                        else {
                            $(v).data('send', 'yes');
                            $.post(s.url, { account: $.trim($('#account').val()) }, function (data) {
                                if ($.parseJSON(data).Status == 0) {
                                    $(v).parent().next().show();
                                    $.showmsg('验证码已发送！');
                                    $('.userID').val($.parseJSON(data).Data.id);
                                    $('.userType').val($.parseJSON(data).Data.type);
                                    return false;
                                }
                                else {
                                    $.showmsg($.parseJSON(data).Msg);
                                }
                            });
                        }
                    }
                }
                else if (a && a.val() == '') {
                    alert('请输入账号');
                    a.focus();
                }
            });
        })
    }
    $.fn.createSelect = function () {
        return this.each(function () {
            var $c = $(this);
            var tag_select = $('<div class="select_box"></div>');
            tag_select.insertBefore($c);

            var select_showbox = $('<div class="select_showbox" style="cursor:pointer"></div>');
            select_showbox.appendTo(tag_select);

            var ul_option = $('<ul class="select_option"></ul>').appendTo(tag_select);
            createOptions(ul_option);

            tag_select.hover(function () {
                ul_option.show();
                ul_option.parent().find(".select_showbox").addClass("active");
            }, function () {
                ul_option.hide();
                ul_option.parent().find(".select_showbox").removeClass("active");
            });

            var li_option = ul_option.find('li');
            li_option.on('click', function () {
                var n = $(this).index(), surl = $c.find('option').eq(n).val();
                $(this).addClass('selected').siblings().removeClass('selected');
                var value = $(this).text();
                select_showbox.text(value);
                switch (n) {
                    case 1:
                        $c.parent().attr('action', surl);
                        break;
                    case 2:
                        $c.parent().attr('action', surl);
                        break;
                    default:
                        $c.parent().attr('action', surl);
                }
                ul_option.hide();
            });

            li_option.hover(function () {
                $(this).addClass('hover').siblings().removeClass('hover');
            }, function () {
                li_option.removeClass('hover');
            });
            function createOptions(ul_list) {
                var options = $c.find('option'),
                    selected_option = options.filter(':selected'),
                    selected_index = selected_option.index(),
                    showbox = ul_list.prev();
                showbox.text(selected_option.text());

                for (var n = 0; n < options.length; n++) {
                    var tag_option = $('<li></li>'),
                        txt_option = options.eq(n).text();
                    tag_option.text(txt_option).appendTo(ul_list);

                    if (n == selected_index) {
                        tag_option.attr('class', 'selected');
                    }
                }
            }
        });
    }
    $.fn.light = function () {
        return this.each(function (i, v) {
            $(v).css({ height: $(document).height(), background: '#000' }).animate({ opacity: 0.7 }, 500);
        });
    }
    $.fn.cm = function () {
        return this.each(function (i, v) {
            $(v).css({ position: 'absolute', zIndex: 999, top: $(window).scrollTop() + Math.round(($(window).height() - $(v).outerHeight()) / 2), left: Math.round(($(window).width() - $(v).outerWidth()) / 2) });
        });
    }
    $.fn.loading = function () {
        return this.each(function () {
            t = $(this);
            var l = $('<div class="loading"></div>').appendTo('body');
            l.find('.loading').css({ width: t.innerWidth(), height: t.innerHeight(), left: t.offset().left, top: offset().top });
        })
    };
    $.fn.valid = function () {
        return this.each(function (i, v) {
            $(v).find('input').each(function () {
                var $c = $(this);
                if ($.trim($c.val()) == '') {
                    $c.siblings('.Validform_title').text('不能为空');
                } else if ($c.attr('data-type') !== undefined) {
                    $.check($.trim($c.val()), $c.attr('data-type')) && $c.text('') || $c.text('格式不正确');
                }
            });
        })
    }
    $.fn.faceOn = function () {
        return this.each(function (i, v) {
            $(v).hover(function () {
                $('<div class="user_pop f_list" id="works_own" action-data="">'
                    + '<div class="user_bg"><img class="cover_bg" src="/Head/20150615/1782662072cc4dfb97a5b21f39f01e98.jpeg" />'
                    + '<div class="user_tx"><a href="#" title="" style="display:inline-block;"><img class="tx" src="/Head/20150618/29ec0f8a4c2f413dbfc898ea953c7531.jpeg" title="" alt="" /></a></div>'
                    + '</div><div class="nick_name"><a href="" title=""><span>中国设计网</span></a></div>'
                    + '<div class="user_attr"><span>平面设计师 河南，郑州</span></div>'
                    + '<div class="user_op">'
                    + '<a href="javascript:void(0);" class="cn_btn add_fol">'
                    + '<i class="unfol"></i>关注</a></div></div>').appendTo('body');
            }, function () {
                $('.user_pop').remove();
            });
        })
    }
    $.fn.modHandler = function (ops) {
        var s = $.extend({ hide: 'yes' }, ops);
        var pic = $('#photo');
        return this.each(function (i, v) {
            $(v).bind('click', function () {
                if (pic.attr('src').length != 0) {
                    subHandler(v);
                } else {
                    $.showmsg("你还没有上传图片");
                }
            });
        });
        function subHandler(v) {
            $(v).addClass('loading');
            $.ajax({
                url: $.picUrl,
                type: 'POST',
                data: { x: pic.data('x'), y: pic.data('y'), w: pic.data('w'), h: pic.data('h'), path: pic.attr('src'), t: 0 },
                success: function (data) {
                    if (s.hide == 'yes') {
                        s.elem.remove();
                    }
                    else {
                        s.elem.addClass('uped').removeClass('edit_tx');
                    }
                    var Data = $.parseJSON(data);
                    if (Data.Status !== 0)
                        return false;
                    $('.cur_tx img').attr('src', Data.Data.LargeHead);
                    $.showmsg('修改头像成功！');
                },
                error: function () {
                    $.showmsg("服务器错误！");
                }
            });
            $(v).removeClass('loading');
        }
    };
    $.fn.pwdS = function () {
        return this.bind('keyup', function () {
            var v = $.trim($(this).val());
            var q = 0;
            if (v.length < 6) {
                q++;
            }
            else if (v.length <= 20) {
                if (/[a-z]+/.test(v)) q++;
                if (/[A-Z]+/.test(v)) q++;
                if (/[0-9]+/.test(v)) q++;
                if (/[^a-zA-Z0-9]+/.test(v)) q++;
                if (q >= 3) q = 3;
            }
            else {
                q = 0;
            }
            $('.pwd_bar').animate({ width: (q * 74) }, 300);
        })
    };
    $.fn.showBind = function () {
        var _t = this;
        return this.each(function (i) {
            var t = window.location.hash.search('#tab') != -1 ? window.location.hash.match(/#tab(\d+)/)[1] : '1';
            if (t) {
                $(_t).eq(t - 1).addClass('active').parent().siblings().find('a').removeClass('active');
                $('.dn_con').eq(t - 1).show().siblings().hide();
            }
            $(this).bind('click', function () {
                $(this).addClass('active').parent().siblings().find('a').removeClass('active');
                $('.dn_con').eq(i).show().siblings().hide();
            })
        })
    }
    $.fn.city = function () {
        return this.each(function (i, v) {
            if ($('.cm').length != 0) return false;
            var f_p = $($.lightbox({ title: '更改所在地', content: '<div class="mb20"><label class="form_m">现在所在地</label></div><div class="city"><select id="province" name="province"></select><label>省</label><select id="city" name="city"></select><label>市</label></div><span class="Validform_checktip"></span></div>', btn: '更改' })).appendTo('body');
            f_p.find('.f_p').cm();
            f_p.find('.sub').bind('click', function () {
                $.post('/HomeAsync/SetAddr', { province: f_p.find('select:eq(0)').val(), city: f_p.find('select:eq(1)').val() }, function (data) {
                    if ($.parseJSON(data).Status == 0) {
                        f_p.remove();
                        $.showmsg($.parseJSON(data).Msg);
                        $('.mod_p .mod_p_txt').text(f_p.find('select:eq(0)').find('option:selected').text() + ',' + f_p.find('select:eq(1)').find('option:selected').text())
                    }
                    else {
                        $.showmsg($.parseJSON(data).Msg);
                    }
                })
            });
            f_p.printCity();
            $('.c').bind('click', function () {
                f_p.remove();
            });
        });
    };
    $.fn.printCity = function () {
        return this.each(function () {
            var pID = $("#province").attr("data-value");
            var cID = $("#city").attr("data-value");
            var p = $.parseJSON($('#cityData').html());
            $(this).find('#province').bind('change', function () { s(); });
            var s1 = $('select')[0];
            var s2 = $('select')[1];
            function s() {
                var loca2 = s1.selectedIndex;
                loca3 = (p[loca2][1]).split("|");
                s2.options.length = 0;
                for (j = 0; j < loca3.length; j++) {
                    s2.options[j] = new Option(loca3[j], j);
                }
            }
            for (i = 0; i < p.length; i++) {
                if (i == pID)
                    s1.options[i] = new Option(p[i][0], i, false, true);
                else
                    s1.options[i] = new Option(p[i][0], i, false, false);
            }
            loca3 = (p[pID][1]).split("|");
            for (l = 0; l < loca3.length; l++) {
                if (l == cID)
                    s2.options[l] = new Option(loca3[l], l, false, true);
                else
                    s2.options[l] = new Option(loca3[l], l, false, false);
            }
        })
    }
    $.fn.showChild = function () {
        return this.each(function () {
            var _t = $(this);
            var _n = _t.next();
            var timer = null;
            _t.hover(function () {
                _n.show();
            }, function () {
                timer = setTimeout(function () { _n.hide(); }, 200);
            });
            _n.hover(function () {
                clearTimeout(timer);
            }, function () {
                _n.hide();
            })
        })
    };
    //删除作品
    $.fn.deleteWorks = function () {
        return this.each(function (i, v) {
            var temp = $(v).find('a.wol_del').attr('data-href').split('?id=')[1];
            var s = {};
            for (var i = 0; i < temp.length; i++) {
                s[temp[i].split('=')[0]] = temp[i].split('=')[1];
            }
            var f_p = $($.lightbox({ title: '删除作品', content: '<span>你确定要删除这个作品么？</span>', btn: '确定' }));
            $(v).find('a.wol_del').bind('click', function () {
                f_p.appendTo('body').find('.lightBox').light().next('.f_p').cm();
            })
            f_p.find('.c').click(function () { f_p.detach(); });
            f_p.find('.sub').click(function () {
                $.get('/HomeWorks/Remove?id=' + temp, function (data) {
                    window.location.reload();
                });
            })
        })
    }
    //取消关注
    $.fn.unfollow = function () {
        return this.each(function (i, v) {
            var temp = $(v).attr('action-data').split('&');
            var s = {};
            for (var i = 0; i < temp.length; i++) {
                s[temp[i].split('=')[0]] = temp[i].split('=')[1];
            }
            temp = [];
            var f_p = $($.lightbox({ title: '取消关注', content: '<span>你确定取消对<b style="color:green">' + s.nickName + '</b>的关注么？</span>', btn: '确定' }));
            $(v).find('a.cancel_fol').bind('click', function () {
                if ($(this).attr('do-type') == 1) {
                    f_p.appendTo('body').find('.lightBox').light().next('.f_p').cm();
                }
                else {
                    $.post('/HomeAsync/CancelFollow', { followID: s.userID }, function (data) {
                        if ($.parseJSON(data).Status === 0) {
                            $(v).removeClass('ed');
                            $('#f_count').text(Number($('#f_count').text()) - 1);
                            return false;
                        }
                        else {
                            $.showmsg($.parseJSON(data).Msg);
                        }
                    });
                }
            })
            f_p.find('.c').click(function () { f_p.detach(); });
            f_p.find('.sub').click(function () {
                $.post('/HomeAsync/CancelFollow', { followID: s.userID }, function (data) {
                    if ($.parseJSON(data).Status === 0) {
                        $('#f_count').text(Number($('#f_count').text()) - 1);
                        f_p.remove();
                        $(v).remove();
                        //$.showmsg('你已经取消对' + s.nickName + '的关注');
                        window.location.reload();
                    }
                    else { $.showmsg($.parseJSON(data).Msg); }
                });
            })
        })
    }
    //移除粉丝
    $.fn.unfans = function () {
        return this.each(function () {
            _t = $(this);
            var temp = _t.attr('action-data').split('&');
            var s = {};
            for (var i = 0; i < temp.length; i++) {
                s[temp[i].split('=')[0]] = temp[i].split('=')[1];
            }
            temp = [];
            var op = $('<div></div>');
            var f_p = $($.lightbox({ title: '移除粉丝', content: '<span>你确定要移除<b style="color:green">' + s.nickName + '</b>？</span>', btn: '确定' }));
            _t.find('a[action-type=remove_fans]').bind('click', function () {
                f_p.appendTo('body').find('.lightBox').light().next('.f_p').cm();
            })
            f_p.find('.c').click(function () { f_p.detach(); });
            f_p.find('.sub').click(function () {
                $.post('/HomeAsync/RemoveFans', { fansID: s.userID }, function (data) {
                    if ($.parseJSON(data).Status === 0) {
                        $('#f_count').text(Number($('#f_count').text()) - 1);
                        f_p.detach();
                        _t.remove();
                        location.reload(true);
                    }
                    else { $.showmsg($.parseJSON(data).Msg); }
                });
            })
        })
    }
    //添加关注
    $.fn.addFollow = function () {
        return this.each(function (i, v) {
            var temp = $(v).attr('action-data').split('&');
            var s = {}, _t, h;
            for (var i = 0; i < temp.length; i++) {
                s[temp[i].split('=')[0]] = temp[i].split('=')[1];
            }
            temp = [];
            $(v).find('.add_fol').bind('click', function () {
                _t = $(this)
                h = _t.html();
                _t.addClass('load').html('<i class="unfol"></i>关注中');
                $.post('/HomeAsync/Follow', { followID: s.userID }, function (data, textStatus, xhr) {
                    var res = $.parseJSON(xhr.getResponseHeader('X-Responded-JSON'));
                    if (res && res.status === 401) {
                        var s = res.headers.location.toLocaleLowerCase();
                        window.location.href = s.substring(0, s.search('=')) + '=' + window.location.pathname + window.location.search;
                        _t.html(h).removeClass('load');
                        return;
                    }
                    else {
                        var d = $.parseJSON(data);
                        if (d.Status === 0) {
                            if ($(v).find('.add_fol').html('<div class="iUnfol"><i class="unfol">+</i>关注</div>').attr('do-type') == 1) {
                                $(v).addClass('ed');
                            }
                            else {
                                _t.removeClass('add_fol load').addClass('def').unbind();
                                // d.Data.type == '1' ? _t.html('<div class="iFoled"><i class="foled"></i>已关注</div>') : _t.html('<div class="iFolEach"><i class="fol_each"></i>互相关注</div>');
                                d.Data.type == '1' ? _t.html('<div class="iFoled"><i class="foled"></i>已关注</div>') : _t.html('<div class="iFolEach">互相关注</div>');
                            }
                            $('#f_count').text(Number($('#f_count').text()) + 1);
                            try {
                                msg.server.addOtherNotice(d.Data.count, d.Data.userID, 1);
                            }
                            catch (e) { }
                        }
                        else {
                            _t.html(h).removeClass('load');
                            $.showmsg(d.Msg);
                        }
                    }
                })
            });
        })
    }
    //加入黑名单
    $.fn.addBlack = function () {
        return this.each(function (i, v) {
            var temp = $(v).attr('action-data').split('&');
            var s = {};
            for (var i = 0; i < temp.length; i++) {
                s[temp[i].split('=')[0]] = temp[i].split('=')[1];
            }
            temp = [];
            var op = $('<div></div>');
            var f_p = $($.lightbox({ title: '加入黑名单', content: '<span>确认将<b style="color:green">' + s.nickName + '</b>加入到黑名单中么？</span><p>你和他将自动解除关注关系, 将不能继续关注！</p>', btn: '加入黑名单' }));
            $(v).find('a[action-type=add_black]').bind('click', function () {
                f_p.appendTo('body').find('.lightBox').light().next('.f_p').cm();
            });
            f_p.find('.c').bind('click', function () { f_p.detach(); });
            f_p.find('.sub').click(function () {
                f_p.detach();
                $.post('/HomeAsync/ToBlack', { ID: s.userID }, function (data, textStatus, xhr) {
                    var d = $.parseJSON(data);
                    if (d.Status === 0) {
                        $(v).removeClass('ed');
                        $.showmsg('您已经将' + s.nickName + '加入到黑名单中！');
                    }
                    else { $.showmsg(d.Msg); }
                });
            })
        })
    };
    //移除黑名单
    $.fn.removeBlack = function () {
        return this.each(function (i, v) {
            var temp = $(v).attr('action-data').split('&');
            var s = {};
            for (var i = 0; i < temp.length; i++) {
                s[temp[i].split('=')[0]] = temp[i].split('=')[1];
            }
            temp = [];
            $(v).find('.s_btn').bind('click', function () {
                var f_p = $($.lightbox({ title: '移除黑名单', content: '<span>确认将<b style="color:green">' + s.nickName + '</b>移除黑名单？</span>', btn: '移除黑名单' }));
                f_p.appendTo('body').find('.lightBox').light().next('.f_p').cm();
                f_p.find('.c').bind('click', function () { f_p.detach(); });
                f_p.find('.sub').click(function () {
                    $.post('/HomeAsync/RemoveBlack', { ID: s.userID }, function (data) {
                        if ($.parseJSON(data).Status === 0) {
                            f_p.remove();
                            $(v).remove();
                            $.showmsg('您已经将' + s.nickName + '移除黑名单！');
                            $.blackHandler($(v).children().length == 0 ? $('#black_lists').data('page') - 1 : $('#black_lists').data('page'));
                        }
                    });
                })
            });
        });
    }
    $.fn.random = function () {
        return this.each(function (i, v) {
            var at = parseInt($(v).attr('action-type'));
            var temp = '<li class="p bt clear" action-data="userID=$UserID$&nickName=$NickName$">'
                + '<a href="$Url$" target="_blank" class="fl"><img src="$UserHead$"></a>' +
                '<div class="clear"><span><a href="$Url$" target="_blank" class="s_C nick_name">$NickName$</a></span><em>$skill$</em>' +
                '<div class="br">' +
                '<a class="follow add_fol" href="javascript:void(0);"><i class="fol_i"></i>关注</a>' +
                '</div></div>' +
                '</li>'
            $.get('/HomeAsync/GetInterestingUser', { type: at, page: $(v).data('page') }, function (data) {
                var d = $.parseJSON(data);
                if (d.Data.length === 0) {
                    $.showmsg('没有更多用户了！');
                    $(v).addClass('disabled');
                }
                else {
                    $(v).data('page', parseInt($(v).data('page')) + 1).parent().next().html(function () {
                        var str = '';
                        for (var i = 0; i < d.Data.length; i++) {
                            str += temp.replace(/\$([A-Za-z]+)?\$/g, function (a) {
                                return d.Data[i][a.substring(1, a.length - 1)];
                            });
                        }
                        return str;
                    }).children().addFollow();
                }
            })
        })
    }
    $.fn.moveUp = function () {
        return this.each(function (i, v) {
            var _t = $(v);
            var _n = _t.find('.slideUp');
            var _o = { top: _n.attr('data-top') + 'px', down: _n.attr('data-down') + 'px' };
            _t.hover(function () {
                _n.stop().animate({ top: _o.top }, 200);
            }, function () {
                _n.stop().animate({ top: _o.down }, 200);
            })
        })
    }
    //头部搜索栏的打开和隐藏
    $.fn.searchBar = function () {
        return this.each(function (i, v) {
            $(v).find('.search_btn').click(function () {  //搜索
                var t = $(this),
                    p_b = $(this).parent();
                if ($(v).find('.sbi_inp').val() == '') {
                    if ($(v).css('width') == '35px') {
                        $(v).siblings('.navbar_ul').hide();
                        t.addClass('sb_bottomLine');
                        $(v).css('overflow', 'visible');
                        $(v).animate({ width: '420px' }, 200);
                        $('.navbar_collapse').show();   //zqj 01-04 10:10
                    } else {
                        $(v).animate({ width: '35px' }, 200, 'linear', function () {
                            $(v).css('overflow', 'hidden');
                            $(v).siblings('.navbar_ul').show();
                            $('.navbar_collapse').hide();   //zqj 01-04 10:10
                            t.removeClass('sb_bottomLine');
                        });
                    }
                }
            });

            var isClick = false;
            $(v).find('.c-search_sort_li').click(function () {
                isClick = true;
            })
            $(v).find('.sbi_inp').blur(function () {
                setTimeout(function () {
                    if (isClick) {
                        $(v).find('.sbi_inp').focus();
                        isClick = false;
                        return;
                    }
                    if ($(v).css('width') == '35px') { return; }
                    $(v).animate({ width: '35px' }, 200, 'linear', function () {
                        $(v).css('overflow', 'hidden');
                        $(v).find('.search_btn').removeClass('sb_bottomLine');
                        $(v).siblings('.navbar_ul').show();
                        $('.navbar_collapse').hide();    //zqj 01-04 10:10
                        $(v).find('.sbi_inp').val('');
                    });
                }, 100)
            });
            $(v).find('.sbs_ul').children('li').click(function () {
                $('#search_box .sbs_ul').hide();
                var txt = $(this).html(),
                    type = $(this).attr('data-type');
                $(v).find('#sbs_s').html(txt);
                $(v).find('#sbs_s').attr('data-type', type);
            })
        })
    }
    // 搜索功能
    $.fn.searchFun = function () {
        return this.each(function (i, v) {
            $(v).parents('.c-search_box').find('.c-search_sort_box').on('mouseover', function () {
                $(this).parents('.c-search_box').find('.c-search_sort_ul').show();
            })

            $(v).parents('.c-search_box').find('.c-search_sort_box').on('mouseleave', function () {
                $(this).parents('.c-search_box').find('.c-search_sort_ul').hide();
            })
            function moveEnd(obj) {
                obj.focus();
                var len = obj.value.length;
                if (document.selection) {
                    var sel = obj.createTextRange();
                    sel.moveStart('character', len);
                    sel.collapse();
                    sel.select();
                } else if (typeof obj.selectionStart == 'number'
                        && typeof obj.selectionEnd == 'number') {
                    obj.selectionStart = obj.selectionEnd = len;
                }
            }
            $(v).parents('.c-search_box').find('.c-search_sort_li').on('click', function () {
                var txt = $(this).html(),
                    type = $(this).attr('data-type');
                $(this).parents('.c-search_box').find('.c-search_sort_default').html(txt).attr('data-type', type);
                $(this).parents('.c-search_box').find('.c-search_sort_ul').hide();
            })
            function searFun(obj, target) {
                var key = obj.parents('.c-search_box').find('.c-keywords').val(),
                    type = obj.parents('.c-search_box').find('.c-search_sort_default ').attr('data-type');
                key = key.replace(/(^\s*)|(\s*$)/g, '').replace(/^\s*$/, '');
                if (key == '') {
                    obj.parents('.c-search_box').find('.c-keywords').val('');
                } else {
                    obj.parents('.c-search_box').find('.c-keywords').val('');
                    if (target) {
                        window.open('http://www.cndesign.com/Query/To?type=' + type + '&key=' + escape(key));
                    } else {
                        window.location.href = 'http://www.cndesign.com/Query/To?type=' + type + '&key=' + escape(key);
                    }
                }
            }
            $(v).on('click', function () {
                if ($(this).parents('.c-search_box').hasClass('_self')) {
                    var target = 1;
                    searFun($(this), target);
                } else {
                    searFun($(this));
                }
            });
            // 回车检索
            $(v).parents('.c-search_box').find('.c-keywords').on('keydown', function (e) {
                if (e.keyCode == 13) {
                    if ($(this).parents('.c-search_box').hasClass('_self')) {
                        target = 1;
                        searFun($(this), target);
                    } else {
                        searFun($(this));
                    }
                }
            })
        })
    }

})(jQuery, window, document);
$(document).ready(function () {
    /*公共*/
    $('#fol_list>li').unfollow();
    $('#fans_list>li, #coms_list>li').unfans().addFollow();
    $('#other_op').addFollow().unfollow().addBlack();
    $('.back').css('right', ($(window).width() - 1200) / 2 - 70 + 'px').bind('click', function () {
        $('html,body').animate({ 'scrollTop': 0 }, 500, function () {
            $('.back').fadeOut();
        });
        $(this).find('.help').bind('click', function (e) {
            e.stopPropagation();
        })
    });
    $(window).bind({
        'scroll': function () {
            var st = $(window).scrollTop();
            var t = $('.dingwei-top').length && $('.dingwei-top').offset().top;
            var b = $('.dingwei-bottom').length && $('.dingwei-bottom').offset().top;
            if (st > 100) {
                $('.back').fadeIn();
            }
            else {
                $('.back').fadeOut();
            }
            if (st <= (b - $('#erwei').height()) && st > t) {
                $('#erwei').css({ position: 'fixed', top: 80, bottom: '0px' });
            } else {
                $('#erwei').css({ position: 'relative', top: '0px', bottom: 'auto' });
            }
        }
    });

    $('#dn_navs a').showBind();

    typeof $().lazyload === 'function' && $('.crop_img img').lazyload({
        threshold: 200,
        effect: "fadeIn",
        tolerance: 60,
        failure_limit: 10,
        container: window,
        load: function () {
            $(this).addClass('white_bg');
        },
        placeholder: PicHub + '/Content/images/blank.gif'
    });
    $('.view-list').hover(function () {
        $('.hasCount') && $('.hasCount').hide();
        $(this).addClass('hover').find('.s-C').show();
    }, function () {
        $('.hasCount').show();
        $(this).removeClass('hover').find('.s-C').hide();
    });
    $('.fn_nav_child').hover(function () {
        $(this).find('.f_icon').stop().animate({ 'backgroundPositionY': '-61px', 'backgroundColor': '#333024' }, 300);
    }, function () {
        $(this).find('.f_icon').stop().animate({ 'backgroundPositionY': '0px', 'background-color': '#fff' }, 300);
    });
    $('.more').showChild();
    $('#sites').children().each(function (i, v) {
        $(v).hover(function () {
            $('#sites').next().children().eq(i).animate({ top: 60, opacity: 1 }).show();
        }, function () {
            $('#sites').next().children().eq(i).animate({ top: 40, opacity: 0 }).hide();
        })
    });
    $('#choose').createSelect();
    checkCookie();

    //头部搜索栏 打开和隐藏
    $('#search_box').searchBar();

    //个人中心-资料下方的导航栏 点击加载页面后自动滚动到该位置
    $.scrollAuto();     //只要发生滚动就给a的链接加上参数
    if (location.hash == '') {
        $('.ssbtn a').attr('href', function () {
            var path = $(this).attr('href').split('#')[0];
            return path;
        })
    } else if (location.hash != '' && location.hash != '#540') {
        $(window).scrollTop(location.hash.split('#')[1]);
        // if (location.hash.split('#')[1] != "1" && location.hash.split('#')[1] != "2" && location.hash.split('#')[1] != "3" && location.hash.split('#')[1] != "4" && location.hash.split('#')[1] != "5") {
        if (location.hash.split('#')[1] >=10) {
            $('html,body').animate({ scrollTop: '540px' }, 200);
        }
    } else if (location.hash == '#540') {
        $(window).scrollTop(540);
    }

    //右上角消息和上传图标的动效
    $('.top_btns').children('a').mouseover(function (event) {
        event.stopPropagation();
        $(this).stop().animate({ backgroundPositionY: '-60px' }, 200);
    })
    $('.top_btns').children('a').mouseout(function (event) {
        event.stopPropagation();
        $(this).stop().animate({ backgroundPositionY: '0px' }, 200);
    })

    // 非首屏二级导航默认选中
    var index_sub_idx = $('.c-sub-nav_li > a.active');
    $('.c-sub-nav_li > a').on('mouseover', function () {
        $('.c-sub-nav_li > a').removeClass('active');
        $(this).addClass('active');
    })
    // index_sub_idx.attr('id','tar');
    $('.c-sub-nav_ul').on('mouseleave', function () {
        $('.c-sub-nav_li > a').removeClass('active');
        if (index_sub_idx.length > 0) {
            index_sub_idx.addClass('active');
        }
    })
})

// 判断浏览器版本
var ie = -1;
var browser = navigator.appName;
var b_version = navigator.appVersion;
var version = b_version.split(";");
if (version.length > 1) {
    var trim_Version = version[1].replace(/[ ]/g, "");
    if (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") {
        ie = 8;
    }
}

jQuery.zqj = {
    //顶部导航条切换
    switchNav: function () {
        return $(window).on('scroll', function () {
            $('#search_box').find('.search_btn').removeClass('sb_bottomLine');
            $('#search_box').css({
                'width': '35px',
                'overflow': 'hidden'
            });
            $('#search_box').find('.sbi_inp').val('');
            var top = $(window).scrollTop();
            if (top > 120) {
                $('.nav_logo>img').attr('src', PicHub + '/Content/images/logo_a.png');
                if (ie !== 8) {
                    $('.nav').css('margin-top', '60px');
                }
                $('.head').css('width', '100%').css('min-width', '1200px').css('position', 'fixed').css('top', '0px').css('z-index', '800');
                $('.head .navbar_ul').show();
                $('.head #search_box').css('display', 'block');
                $('.head .navbar_a.active').addClass('hover');
            } else {
                if (typeof logo == 'undefined') {
                    $('.nav_logo>img').attr('src', PicHub + '/Content/images/logo_b.png');
                } else {
                    $('.nav_logo>img').attr('src', logo);
                }
                if (ie !== 8) {
                    $('.nav').css('margin-top', '0');
                }
                $('.head').css('position', 'static');
                $('.head .navbar_ul').hide();
                $('.head #search_box').css('display', 'none');
            }
        })
    },
    subNav: function ($a) {
        if ($a.hasClass('c-sub-nav')) {
            return $a.on({
                'mouseenter': function () {
                    if ($(window).scrollTop() <= 120) {
                        return;
                    } else {
                        if ($(this).hasClass('news-sub-nav')) {
                            $('.news_a').addClass('hover');
                        } else if ($(this).hasClass('works-sub-nav')) {
                            $('.works_a').addClass('hover');
                        } else if ($(this).hasClass('font-sub-nav')) {
                            $('.font_a').addClass('hover');
                        } else if ($(this).hasClass('article-sub-nav')) {
                            $('.article_a').addClass('hover');
                        } else if ($(this).hasClass('rencai-sub-nav')) {
                            $('.rencai_a').addClass('hover');
                        }
                    }
                }
            })
        }
    }
}

$.zqj.switchNav(); //顶部导航条切换
// $.zqj.subNav($('.navbar_ul .navbar_a'));
// $.zqj.subNav($('div[class*=-sub-nav]'));
// $.zqj.subNav($('body'));

$('.c-search_btn').searchFun(); //调用搜索

$(function () {
    $('.head').css('width', $(document).width() + 'px');//zqj 02/16
    var docWidth = $(document.body).width();
    $(window).resize(function () {
        docWidth = $(document.body).width();
        $('.nb_div').css({//zqj 02/17
            'width': docWidth,
            'left': '0px'
        });
    })
    $(window).scroll(function () {
        if (docWidth <= 1200 && $('.head').css('position') == 'fixed') {
            $('.head').css('left', -$(window).scrollLeft() + 'px');
            $('.c-sub-nav').css('left', -$(window).scrollLeft() + 'px').css('min-width', '1200px');
            $('.nb_div').css('left', -$(window).scrollLeft() + 'px').css('width', $(document).width() + 'px');//zqj 02/16
        } else {
            $('.head').css('left', '0px');
            $('.c-sub-nav').css('left', '0');
        }
    })

    $('div[class*=-sub-nav]').hide();


    //鼠标移入图片放大
    if ($('.zoom').zoomImgRollover != undefined) {
        $('.zoom').zoomImgRollover();
    }

    $('.paging_a_selected').on('click', function (e) { //阻止当前页点击跳转
        e.preventDefault();
    })
    //    分页跳转
    $('#jump_go').on('click', function () {
        var href = $('.paging_a_selected').attr('href'),
            currentPage = +$('.paging_a_selected').html(),
            maxPage = +$('.triangle_right').parents('.paging_lists').prev().find('a').html(),
            newPage = +$('#jump_page').val(),
            idx = href.lastIndexOf('=');
        href = href.slice(0, idx + 1);
        newPage = parseInt(newPage);
        if (typeof newPage == "number" && newPage >= 1 && newPage <= maxPage) {
            // window.location.href = href + newPage;
            $('#pageForm').submit();
        } else {
            $('#jumpGO_isMax').show();
            setTimeout(function () {
                $('#jumpGO_isMax').hide();
            }, 2000);
        }
    })
})

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1) c_end = document.cookie.length
            return unescape(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}

function setCookie(c_name, value, expiredays) {
    var exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    document.cookie = c_name + "=" + escape(value) +
        ((expiredays == null) ? "" : "; expires=" + exdate.toGMTString())
}

function checkCookie() {
    if (getCookie('notice') == 'hide') {
        return;
    } else {
        $('.web-notice').show();
        $('.web-notice .hide').bind('click', function () {
            $('.web-notice').hide();
            setCookie('notice', 'hide', 30);
        })
    }
}
/* 首屏漂浮二级导航 */
var defIdx; //默认选中项
defIdx = $('.nav .nav_ul_v1 .nav_a_v1').index($('.nav_a_v1.active'));
$(function () {
    nav();
    // 首屏二级导航鼠标移入移出状态切换
    var $def = $('.cnd-static .c-sub-nav_li a.active');//默认选中元素
    $('.cnd-static').on('mouseover', '.c-sub-nav_li', function () {
        $(this).parents('.c-sub-nav_ul').find('a').removeClass('active');
        $(this).find('a').addClass('active');
    })
    $('.cnd-static').on('mouseout', '.c-sub-nav_li', function () {
        $(this).find('a').removeClass('active');
        $def.addClass('active');
    })
})
var idx;
function nav() {
    if ($('.subNavWrapper').length > 0) { //首屏绝对定位二级导航
        $('.nav_a_v1').hover(function () {
            idx = $('.nav_a_v1').index(this);
            if (idx >= 1 && idx <= 4 || idx == 6 || idx == 7) {
                $('.subNavWrapper').show();
            }
            $('.nav_a_v1').removeClass('active');
            $(this).addClass('active');
            $('.subNavSet div').hide();
            $('.subNavSet div').eq(idx).show();
        }, function () {
            $('.subNavWrapper').hide();
            $(this).removeClass('active');
            if (defIdx != -1) {
                $('.nav .nav_li_v1').find('.nav_a_v1').eq(defIdx).addClass('active');
            }
        })
        $('.subNavSet div').hover(function () {
            $('.subNavWrapper').show();
            $(this).show();
            $('.nav .nav_li_v1 .nav_a_v1').removeClass('active');
            $('.nav .nav_li_v1').eq(idx).find('.nav_a_v1').addClass('active');
            $('.nav .nav_li_v1').eq(idx).siblings().find('.nav_a_v1').removeClass('active');
        }, function () {
            $('.subNavWrapper').hide();
            $('.nav .nav_li_v1 .nav_a_v1').removeClass('active');
            if (defIdx != -1) {
                $('.nav .nav_li_v1').find('.nav_a_v1').eq(defIdx).addClass('active');
            }
        })
    }
    if ($('.cnd-static').length > 0) {    //首屏正常文档流中二级导航
        $('.nav_a_v1').hover(function () {
            idx = $('.nav_a_v1').index(this);
            $('.nav_a_v1').removeClass('active');
            $(this).addClass('active');
            $('.zryd-place div').removeClass('show');
            if (idx > 0 && idx <= 4 || idx == 6 || idx == 7) {
                $('.zryd-place').find('div').eq(idx).addClass('show');
            }
        });

        $(".zryd-nav").on('mouseleave', function () {
            idx = defIdx;
            $('.nav .nav_li_v1 .nav_a_v1').removeClass('active');
            $('.nav_a_v1').eq(idx).addClass('active');
            $('.zryd-place').find('div').removeClass('show');
            $('.zryd-place').find('div').eq(idx).addClass('show');
        });
    }
}
/* 首屏漂浮二级导航 */