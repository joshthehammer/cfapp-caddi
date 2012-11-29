
/** 
 * TODO --- 
    [x] text only vs. text+richmedia
    [x] scroll locking
    [x] jquery working
    [x] waypoints working
    [x] rate limit via cookie
    [x] R/L position via config
    [] OWL sends data correctly
    [] OWL data format
**/

CloudFlare.define(
    'cloudflare/owldev',
    ['cloudflare', 'cloudflare/deferred', 'cloudflare/iterator', 'cloudflare/utility', 'cloudflare/console'],
    function(cloudflare, deferred, iterator, utility, cfconsole) {

    console.log( 'inside custom OWL module definition' );

        var ping = function(namespaced) {

                var query = [];

                iterator.forEach(
                    namespaced,
                    function(data, namespace) {

                        iterator.forEach(
                            data,
                            function(value, key) {

                                query.push(encodeURIComponent(namespace) + '[' + encodeURIComponent(key) + ']=' + encodeURIComponent(value));
                            }
                        );
                    }
                );

                query.push('t=' + utility.now());

                new Image().src = '/cdn-cgi/ping?' + query.join('&');
            };

        var createDispatcher = function(name) {

            var toData = function(key, value) {
  // console.log( 'OWL toData() ', key, value );                  
                    var data = typeof key == 'object' ? key : {};

                    if(data !== key && value)
                        data[key] = value;

                    return data;
                },

                dispatch = (function() {
    
  console.log( 'OWL dispatch() invoked ' );
                    var namespace,
                        resolveConfig;

                    return function(key, value) {

  // console.log( 'OWL dispatch() inner op', key, value );

                        var data = toData(key, value),
                            namespaced;

                        if(typeof namespace == 'undefined') {

  console.log( '    namespace undefined, trying to resolve /config for name=' + name  );

                            (resolveConfig = resolveConfig || cloudflare.require(
                                [name + '/config'],
                                function(config) {

  // console.log( '    inside name/config resolved require ..got config?', config );

                                    namespace = config.owlid || name;
                                }
                            )).then(

                                function() {
  console.log( '    starting THEN block ' );
                                    if ( ! namespace ) { 
                                        console.log( 'WARN - failed to create namespace via config.owlid; name=' + name );
                                        return;
                                    }
                                    dispatch(data);
                                }
                            );
                        } else if(namespace) {

  console.log( '    got namespace; speak data', data );
                            namespaced = {};
                            namespaced[namespace] = data;

                            ping(namespaced);
                            speak(data);
                        }
                    };
                })(),
                createQueue = function() {

  console.log( 'OWL createQueue() ' );
                    var queued = {};

                    return {
                        append: function(key, value) {

                            iterator.extend(queued, toData(key, value));
                        },
                        dispatch: function() {

                            var data = queued;

                            queued = {};

                            dispatch(data);
                        }
                    };
                },
                speak = function(data) {

                    listeners = iterator.filter(
                        listeners,
                        function(listener) {

                            return listener(data);
                        }
                    );
                },
                listeners = [];

            return {
                version: 4,
                dispatch: dispatch,
                createQueue: createQueue,
                listen: function(listener) {

                    listeners.push(listener);
                }
            };
        }

  console.log( 'OWL returning OBJECT' );
        return {
            createDispatcher: createDispatcher
        };

    }
);



CloudFlare.define( 'caddi', 
    // [       'caddi/config', 'cloudflare/dom',   'cloudflare/user',  '/v1/cloudflare/owl.js',   'cloudflare/jquery1.7' ], 
    // [       'caddi/config', 'cloudflare/dom',   'cloudflare/user',  'cloudflare/owl',   'cloudflare/jquery1.7' ], 
    [       'caddi/config', 'cloudflare/dom',   'cloudflare/user',  'cloudflare/owldev',   'cloudflare/jquery1.7' ], 
    function(cfg,           dom,                user,               owl,                jQuery ) {

    var $ = jQuery;

    var section_id  = '3628055';    // default: static+video  

    if ( cfg && cfg.text_only ){ 
        section_id = '3628054';    // static only
    }
 
    /* config vars:
     *  text_only       [ 0  | 1 ]
     *  orient          [ left | right ]
     *  user_pause_ttl  [ -1 | 0 | INT ]
     *  sticky          [ 0 | 1 ]
     *  ss_view_max_ct  [ 0 | INT ]
     *
     */
    console.log( "caddi starts with cfg", cfg );

    var delim       = '|',
        sessionTTL  = 1200,
        cookieCol   = ['timeFirst','sessionStart','N','sessionCt','sessionViewCt','pauseUntil','pauseSkipCt'],
        currTs      = function() { return parseInt( +(new Date) / 1000 ) },
        currTime    =  currTs(),

        installCookie = function(name,val,ttl) {
            if ( ttl ) { 
                var exp = new Date();
                exp.setTime( exp.getTime() + (ttl * 1000) );
            }
            console.log( 'installCookie name=' + name + ' val=' + val );
            document.cookie = name + "=" + escape(val) + (ttl ? ";expires=" + exp.toUTCString() : '' );
        }, 
    
        readCookieAttrs = function(str) {
            var C = {},
                arr = str ? str.split(delim) : [];
            console.log( "readCookieAttrs starts on str", str, arr );

            for ( i = 0; i < cookieCol.length; i++ ){ 
                C[ cookieCol[i] ] = arr[i] || 0;
            }
            ( C.timeFirst && C.timeFirst > 1354151978 )  || ( C.timeFirst  = currTtime );
            C.sessionStart || ( C.sessionStart = currTime );
            console.log( "readCookieAttrs returns", C );
            return C;
        },

        writeCookie = function(cName, C, ttl){ 
            var vals = [];
            for ( i = 0; i < cookieCol.length; i++){ 
                vals.push( C[cookieCol[i]] || 0);
            }
            installCookie( cName, vals.join(delim), ttl );
        };


    var isLeft      = ( cfg.orient && cfg.orient == 'left' ) ? true : false,
        orient      = isLeft ? 'left' : 'right',
        useScroll   = cfg.scroll ? 1 : 0,

        cookieName  =  'cfapp_caddi'+section_id,
        cookie      =  readCookieAttrs( user.getCookie(cookieName) ),
        inSession   = ((  currTime - cookie.timeLast ) < sessionTTL ) ? 1 : 0
        terminate   = false; 


    cookie.N++;
    cookie.sessionCt || ( cookie.sessionCt++ );

    if( cookie.pauseUntil && cookie.pauseUntil >= currTime ){
        cookie.pauseSkipCt++;
        terminate++;
    }
    else if ( cookie.pauseUntil ) {
        cookie.pauseUntil = 0;
    }

    if (! inSession ){ 
        cookie.sessionCt++;
        cookie.timeLast         = currTime;
        cookie.sessionViewCt    = 0;
    }
   
    if ( cfg.ss_view_max_ct && cookie.sessionViewCt >= cfg.ss_view_max_ct){
        terminate++;
    }else{
        cookie.sessionViewCt++;
    }

    writeCookie(cookieName,cookie);

    if ( terminate ) { 
        console.log( 'TERMINATE' );
        return;
    }

    var cfOwl           = owl.createDispatcher('caddi');
    console.log( 'owl created cfOwl' , cfOwl );

    var a = 'cfad',
        ar = '#'+a,
        b   = a + 'b',
        br  = '#'+b,
        x   = a + 'x',
        xr  = '#'+x,
        f   = a + 'f',
        fr  = '#'+f,
        tx  = 1000,
        iframe  = '<iframe id="'+f+'" FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="//ad.yieldmanager.com/st?ad_type=iframe&ad_size=300x250&section=' + section_id + '&pub_url=' + escape(location.href)  + '"></IFRAME>',
        css = isLeft 
            ?  ( 
               ar + ' { display: none; height: 300px; overflow: hidden; position: absosulte; width: 320px; left: 0; top: 150px; z-index: 4; } ' + 
               br + ' { background-color: #ffffff; height: 250px; width:320px; margin-bottom: 25px; padding: 2px; left : -320px; position: absolute; top: 10px; } ' + 
               fr + ' { height: 250px; width: 300px; margin: 0px; padding: 3px; background-color: #ffffff; border: 1px solid #404040; border-left: 0px } ' + 
               xr + ' { background-color: #ffffff; margin-top: -1px; color: #404040; font-weight: bold; font: 16px Helvetica,Arial,Sans-serif; padding: 0px 5px 0.6px 4px; text-decoration: none; border-bottom: 1px solid #404040; border-right: 1px solid #404040; left : 0; position: absolute; display: block; } ' 
               )
            :  ( 
               ar + ' { display: none; height: 300px; overflow: hidden; position: absosulte; width: 320px; right: 0; top: 150px; z-index: 4; } ' + 
               br + ' { background-color: #ffffff; height: 250px; margin-bottom: 25px; padding: 2px; right: -320px; position: absolute; top: 10px; } ' + 
               fr + ' { height: 250px; width: 300px; margin: 0px; padding: 3px; background-color: #ffffff; border: 1px solid #404040; border-right: 0px } ' + 
               xr + ' { background-color: #ffffff; margin-top: -1px; color: #404040; font-weight: bold; font: 16px Helvetica,Arial,Sans-serif; padding: 0px 5px 0.6px 4px; text-decoration: none; border-bottom: 1px solid #404040; border-left: 1px solid #404040; right: 0; position: absolute; display: block; } '
               );


    console.log( "vars were set: ar=" + ar + ' br='+ br + ' xr=' + xr + ' isLeft=' + isLeft );

    $('head').append(  '<style type="text/css">' + css + '</style>' );

    $('<div/>').attr('id', a).appendTo('body');

    $('<div/>').attr('id', b).html(iframe).appendTo(ar);

    $('<a href="#">x</a>').attr('id',x).appendTo(br);

    $(xr).click(function(){ 
        if ( cfg.user_pause_ttl ){
            console.log( 'adding user_pause_ttl = ' + cfg.user_pause_ttl );
            cookie.pauseUntil = currTime + cfg.user_pause_ttl; 
            writeCookie(cookieName,cookie);
        }
        $(ar).remove();
        cfOwl.dispatch( {action: 'close', orient: orient });
    });


    console.log( "classes were added; orient=" + orient  );

    setTimeout((function slideIn() {
        // console.log( 'inside slideIn() function orient='+orient + ' delay=' + tx );
        $(ar).css('display', 'block' );
        var s = parseInt( $(br).css( orient ) );
        // console.log( '    got s=' + s );
        if (s <= 0 ) {
            $(br).css(orient, (s + 8) + 'px' );        // lower is slower
            setTimeout(slideIn, 10);
        } else {
            $(br).css(orient, '0px' );
            $(xr).css('display', 'block');

            cfOwl.dispatch( {
                action: 'load',
                orient: orient,
            });
            console.log('display complete; Owl dispatched' );
        }
    }), tx );

    console.log( "timeout was added" );


/*
 * jQuery Waypoints - v1.1.7
 * Copyright (c) 2011-2012 Caleb Troughton
 * */
(function($,k,m,i,d){var e=$(i),g="waypoint.reached",b=function(o,n){o.element.trigger(g,n);if(o.options.triggerOnce){o.element[k]("destroy")}},h=function(p,o){if(!o){return -1}var n=o.waypoints.length-1;while(n>=0&&o.waypoints[n].element[0]!==p[0]){n-=1}return n},f=[],l=function(n){$.extend(this,{element:$(n),oldScroll:0,waypoints:[],didScroll:false,didResize:false,doScroll:$.proxy(function(){var q=this.element.scrollTop(),p=q>this.oldScroll,s=this,r=$.grep(this.waypoints,function(u,t){return p?(u.offset>s.oldScroll&&u.offset<=q):(u.offset<=s.oldScroll&&u.offset>q)}),o=r.length;if(!this.oldScroll||!q){$[m]("refresh")}this.oldScroll=q;if(!o){return}if(!p){r.reverse()}$.each(r,function(u,t){if(t.options.continuous||u===o-1){b(t,[p?"down":"up"])}})},this)});$(n).bind("scroll.waypoints",$.proxy(function(){if(!this.didScroll){this.didScroll=true;i.setTimeout($.proxy(function(){this.doScroll();this.didScroll=false},this),$[m].settings.scrollThrottle)}},this)).bind("resize.waypoints",$.proxy(function(){if(!this.didResize){this.didResize=true;i.setTimeout($.proxy(function(){$[m]("refresh");this.didResize=false},this),$[m].settings.resizeThrottle)}},this));e.load($.proxy(function(){this.doScroll()},this))},j=function(n){var o=null;$.each(f,function(p,q){if(q.element[0]===n){o=q;return false}});return o},c={init:function(o,n){this.each(function(){var u=$.fn[k].defaults.context,q,t=$(this);if(n&&n.context){u=n.context}if(!$.isWindow(u)){u=t.closest(u)[0]}q=j(u);if(!q){q=new l(u);f.push(q)}var p=h(t,q),s=p<0?$.fn[k].defaults:q.waypoints[p].options,r=$.extend({},s,n);r.offset=r.offset==="bottom-in-view"?function(){var v=$.isWindow(u)?$[m]("viewportHeight"):$(u).height();return v-$(this).outerHeight()}:r.offset;if(p<0){q.waypoints.push({element:t,offset:null,options:r})}else{q.waypoints[p].options=r}if(o){t.bind(g,o)}if(n&&n.handler){t.bind(g,n.handler)}});$[m]("refresh");return this},remove:function(){return this.each(function(o,p){var n=$(p);$.each(f,function(r,s){var q=h(n,s);if(q>=0){s.waypoints.splice(q,1);if(!s.waypoints.length){s.element.unbind("scroll.waypoints resize.waypoints");f.splice(r,1)}}})})},destroy:function(){return this.unbind(g)[k]("remove")}},a={refresh:function(){$.each(f,function(r,s){var q=$.isWindow(s.element[0]),n=q?0:s.element.offset().top,p=q?$[m]("viewportHeight"):s.element.height(),o=q?0:s.element.scrollTop();$.each(s.waypoints,function(u,x){if(!x){return}var t=x.options.offset,w=x.offset;if(typeof x.options.offset==="function"){t=x.options.offset.apply(x.element)}else{if(typeof x.options.offset==="string"){var v=parseFloat(x.options.offset);t=x.options.offset.indexOf("%")?Math.ceil(p*(v/100)):v}}x.offset=x.element.offset().top-n+o-t;if(x.options.onlyOnScroll){return}if(w!==null&&s.oldScroll>w&&s.oldScroll<=x.offset){b(x,["up"])}else{if(w!==null&&s.oldScroll<w&&s.oldScroll>=x.offset){b(x,["down"])}else{if(!w&&s.element.scrollTop()>x.offset){b(x,["down"])}}}});s.waypoints.sort(function(u,t){return u.offset-t.offset})})},viewportHeight:function(){return(i.innerHeight?i.innerHeight:e.height())},aggregate:function(){var n=$();$.each(f,function(o,p){$.each(p.waypoints,function(q,r){n=n.add(r.element)})});return n}};$.fn[k]=function(n){if(c[n]){return c[n].apply(this,Array.prototype.slice.call(arguments,1))}else{if(typeof n==="function"||!n){return c.init.apply(this,arguments)}else{if(typeof n==="object"){return c.init.apply(this,[null,n])}else{$.error("Method "+n+" does not exist on jQuery "+k)}}}};$.fn[k].defaults={continuous:true,offset:0,triggerOnce:false,context:i};$[m]=function(n){if(a[n]){return a[n].apply(this)}else{return a.aggregate()}};$[m].settings={resizeThrottle:200,scrollThrottle:100};e.load(function(){$[m]("refresh")})})(jQuery,"waypoint","waypoints",window);


    console.log( "waypoints settings ", $.waypoints.settings );


    if ( cfg.sticky ) {

        $.waypoints.settings.scrollThrottle = 50;       // default=100

        $(br).waypoint( function(event, direction) {
            console.log( ' ..inside ads waypoint op' );
            $(event.target).css( { 
                'position':'fixed',
                'top':'20',
            } );
            event.stopPropagation();
        });

    }

    console.log( "waypoint was added to id=" + ar );
    console.log( 'caddi completed' );

} );

