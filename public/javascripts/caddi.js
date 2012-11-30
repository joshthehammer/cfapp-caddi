

/** 
 * TODO --- 
    [x] text only vs. text+richmedia
    [x] scroll locking
    [x] jquery working
    [x] waypoints working
    [x] rate limit via cookie
    [x] R/L position via config
    [X] OWL sends data correctly
    [] OWL data format
    [] R/L bottom anchored options
**/

CloudFlare.define( 'caddi', 
    [       'caddi/config', 'cloudflare/dom',   'cloudflare/user',  'cloudflare/owl',   'cloudflare/jquery1.7' ], 
    function(cfg,           dom,                user,               owl,                jQuery ) {

    var $ = jQuery;

    var section_id  = '3628055';    // default: static+video  

    if ( cfg && cfg.text_only ){ 
        section_id = '3628054';    // static only
    }
 
    /* config vars:
     *  text_only       [ 0  | 1 ]
     *  orient          [ left | right | left_bottom | right_bottom ]
     *  user_pause_ttl  [ -1 | 0 | INT ]
     *  scroll          [ 0 | 1 ]
     *  ss_view_max_ct  [ 0 | INT ]
     *  min_resolution  [ 0 | 1024x0 | 1600x0 ]
     *
     */

    /*
     * setup vars
     */

    var delim       = '|',
        sessionTTL  = 1200,
        cookieCol   = ['timeFirst','sessionStart','N','sessionCt','sessionViewCt','pauseUntil','pauseSkipCt','impCt'],
        currTs      = function() { return parseInt( +(new Date) / 1000 ) },
        currTime    =  currTs(),
        D           = cfg.debug || 0,

        installCookie = function(name,val,ttl) {
            if ( ttl ) { 
                var exp = new Date();
                exp.setTime( exp.getTime() + (ttl * 1000) );
            }
            D  &&  console.log( 'installCookie name=' + name + ' val=' + val );
            document.cookie = name + "=" + escape(val) + (ttl ? ";expires=" + exp.toUTCString() : '' );
        }, 
    
        readCookieAttrs = function(str) {
            var C = {},
                arr = str ? str.split(delim) : [];
            D  &&  console.log( "readCookieAttrs starts on str", str, arr );

            for ( i = 0; i < cookieCol.length; i++ ){ 
                C[ cookieCol[i] ] = arr[i] || 0;
            }
            D  &&  console.log( "finish loop", C );
            ( C.timeFirst && parseInt(C.timeFirst) && C.timeFirst > 1354151978 )  || ( C.timeFirst  = currTime );
            D  &&  console.log( "finish timeset" );
            C.sessionStart || ( C.sessionStart = currTime );
            D  &&  console.log( "readCookieAttrs returns", C );
            return C;
        },

        writeCookie = function(cName, C, ttl){ 
            var vals = [];
            for ( i = 0; i < cookieCol.length; i++){ 
                vals.push( C[cookieCol[i]] || 0);
            }
            installCookie( cName, vals.join(delim), ttl );
        };

        orient      = cfg.orient || 'left',
        isLeft      = orient.indexOf('left') >= 0   ? true : false,
        isBottom    = orient.indexOf('bottom') >= 0 ? true : false,
        useScroll   = ( cfg.scroll || isBottom ) ? 1 : 0,
        minRes      = ( cfg.min_resolution ) ?  cfg.min_resolution.split('x') : null,

        cookieName  =  'cfapp_caddi'+section_id,
        cookie      =  readCookieAttrs( user.getCookie(cookieName) ),
        inSession   = (( currTime - cookie.sessionStart ) < sessionTTL ) ? 1 : 0
        viewport    = dom.getViewport();
        terminate   = false; 

    /*
     * logic: eligibility, cookie, etc.
     */
    D  &&  console.log( "caddi starts with cfg", cfg );

    cookie.N++;
    cookie.sessionCt || ( cookie.sessionCt++ );


    if(  minRes && viewport ) {
        ( minRes[0] && viewport.width ) && ( minRes[0] <= viewport.width || terminate++ );
        ( minRes[1] && viewport.height ) && ( minRes[1] <= viewport.height || terminate++ );
        D  &&  console.log( "minRes check; terminate=" + terminate, minRes, viewport );
    }
    
    if( cookie.pauseUntil && cookie.pauseUntil >= currTime ){
        cookie.pauseSkipCt++;
        terminate++;
        D  &&  console.log( 'Ad serving is paused; seconds left=' + ( cookie.pauseUntil - currTime ) );
    }
    else if ( cookie.pauseUntil ) {
        D  &&  console.log( 'Ad serving was paused; but active again.  Removing cookie setting' );
        cookie.pauseUntil = 0;
    }

    if (! inSession ){ 
        cookie.sessionCt++;
        cookie.sessionStart     = currTime;
        cookie.sessionViewCt    = 0;
    }
   
    if ( cfg.ss_view_max_ct && cookie.sessionViewCt >= cfg.ss_view_max_ct){
        terminate++;
    }else{
        cookie.sessionViewCt++;
    }

    writeCookie(cookieName,cookie);

    if ( terminate ) { 
        D   &&  console.log( 'TERMINATE' );
        return;
    }

    var cfOwl           = owl.createDispatcher('caddi');

    D  &&  console.log( 'owl created cfOwl' , cfOwl );

    /* 
     * create HTML
     */

    var a = 'cfad',     // id="cfad"
        ar = '#'+a,     // reference of id;  #cfad
        b   = a + 'b',  
        br  = '#'+b,
        x   = a + 'x',  // x=close
        xr  = '#'+x,
        f   = a + 'f',  // f=frame
        fr  = '#'+f,
        tx  = 1000,     // slider fade-in time
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

    css += '.top-{  background-color: red; } .bottom-align { background-color: green; } ';

/*
 *
 */

    D  &&  console.log( "vars were set: ar=" + ar + ' br='+ br + ' xr=' + xr + ' isLeft=' + isLeft );

    $('head').append(  '<style type="text/css">' + css + '</style>' );

    $('<div/>').attr('id', a).appendTo('body');
    $('<div/>').attr('id', b).html(iframe).appendTo(ar);

    $('<a href="#">x</a>').attr('id',x).appendTo(br);

    $(xr).click(function(){ 
        if ( cfg.user_pause_ttl ){
            D  &&  console.log( 'adding user_pause_ttl = ' + cfg.user_pause_ttl );
            cookie.pauseUntil = currTime + cfg.user_pause_ttl; 
            writeCookie(cookieName,cookie);
        }
        $(ar).remove();
        cfOwl.dispatch( {action: 'close', orient: orient });
    });

    D  &&  console.log( "classes were added; orient=" + orient  );

    setTimeout((function slideIn() {
        // D  &&  console.log( 'inside slideIn() function orient='+orient + ' delay=' + tx );
        $(ar).css('display', 'block' );
        var s = parseInt( $(br).css( orient ) );
        // D  &&  console.log( '    got s=' + s );
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
            D  &&  console.log('display complete; Owl dispatched' );
        }
    }), tx );

    D  &&  console.log( "timeout was added" );


/*
 * jQuery Waypoints - v1.1.7
 * Copyright (c) 2011-2012 Caleb Troughton
 * */
(function($,k,m,i,d){var e=$(i),g="waypoint.reached",b=function(o,n){o.element.trigger(g,n);if(o.options.triggerOnce){o.element[k]("destroy")}},h=function(p,o){if(!o){return -1}var n=o.waypoints.length-1;while(n>=0&&o.waypoints[n].element[0]!==p[0]){n-=1}return n},f=[],l=function(n){$.extend(this,{element:$(n),oldScroll:0,waypoints:[],didScroll:false,didResize:false,doScroll:$.proxy(function(){var q=this.element.scrollTop(),p=q>this.oldScroll,s=this,r=$.grep(this.waypoints,function(u,t){return p?(u.offset>s.oldScroll&&u.offset<=q):(u.offset<=s.oldScroll&&u.offset>q)}),o=r.length;if(!this.oldScroll||!q){$[m]("refresh")}this.oldScroll=q;if(!o){return}if(!p){r.reverse()}$.each(r,function(u,t){if(t.options.continuous||u===o-1){b(t,[p?"down":"up"])}})},this)});$(n).bind("scroll.waypoints",$.proxy(function(){if(!this.didScroll){this.didScroll=true;i.setTimeout($.proxy(function(){this.doScroll();this.didScroll=false},this),$[m].settings.scrollThrottle)}},this)).bind("resize.waypoints",$.proxy(function(){if(!this.didResize){this.didResize=true;i.setTimeout($.proxy(function(){$[m]("refresh");this.didResize=false},this),$[m].settings.resizeThrottle)}},this));e.load($.proxy(function(){this.doScroll()},this))},j=function(n){var o=null;$.each(f,function(p,q){if(q.element[0]===n){o=q;return false}});return o},c={init:function(o,n){this.each(function(){var u=$.fn[k].defaults.context,q,t=$(this);if(n&&n.context){u=n.context}if(!$.isWindow(u)){u=t.closest(u)[0]}q=j(u);if(!q){q=new l(u);f.push(q)}var p=h(t,q),s=p<0?$.fn[k].defaults:q.waypoints[p].options,r=$.extend({},s,n);r.offset=r.offset==="bottom-in-view"?function(){var v=$.isWindow(u)?$[m]("viewportHeight"):$(u).height();return v-$(this).outerHeight()}:r.offset;if(p<0){q.waypoints.push({element:t,offset:null,options:r})}else{q.waypoints[p].options=r}if(o){t.bind(g,o)}if(n&&n.handler){t.bind(g,n.handler)}});$[m]("refresh");return this},remove:function(){return this.each(function(o,p){var n=$(p);$.each(f,function(r,s){var q=h(n,s);if(q>=0){s.waypoints.splice(q,1);if(!s.waypoints.length){s.element.unbind("scroll.waypoints resize.waypoints");f.splice(r,1)}}})})},destroy:function(){return this.unbind(g)[k]("remove")}},a={refresh:function(){$.each(f,function(r,s){var q=$.isWindow(s.element[0]),n=q?0:s.element.offset().top,p=q?$[m]("viewportHeight"):s.element.height(),o=q?0:s.element.scrollTop();$.each(s.waypoints,function(u,x){if(!x){return}var t=x.options.offset,w=x.offset;if(typeof x.options.offset==="function"){t=x.options.offset.apply(x.element)}else{if(typeof x.options.offset==="string"){var v=parseFloat(x.options.offset);t=x.options.offset.indexOf("%")?Math.ceil(p*(v/100)):v}}x.offset=x.element.offset().top-n+o-t;if(x.options.onlyOnScroll){return}if(w!==null&&s.oldScroll>w&&s.oldScroll<=x.offset){b(x,["up"])}else{if(w!==null&&s.oldScroll<w&&s.oldScroll>=x.offset){b(x,["down"])}else{if(!w&&s.element.scrollTop()>x.offset){b(x,["down"])}}}});s.waypoints.sort(function(u,t){return u.offset-t.offset})})},viewportHeight:function(){return(i.innerHeight?i.innerHeight:e.height())},aggregate:function(){var n=$();$.each(f,function(o,p){$.each(p.waypoints,function(q,r){n=n.add(r.element)})});return n}};$.fn[k]=function(n){if(c[n]){return c[n].apply(this,Array.prototype.slice.call(arguments,1))}else{if(typeof n==="function"||!n){return c.init.apply(this,arguments)}else{if(typeof n==="object"){return c.init.apply(this,[null,n])}else{$.error("Method "+n+" does not exist on jQuery "+k)}}}};$.fn[k].defaults={continuous:true,offset:0,triggerOnce:false,context:i};$[m]=function(n){if(a[n]){return a[n].apply(this)}else{return a.aggregate()}};$[m].settings={resizeThrottle:200,scrollThrottle:100};e.load(function(){$[m]("refresh")})})(jQuery,"waypoint","waypoints",window);




    if ( useScroll ) {
        $.waypoints.settings.scrollThrottle = 50;       // default=100
        $.waypoints.settings.offset = 10;       // default=0

        D  &&  console.log( "using scroll;  waypoints settings ", $.waypoints.settings );

        $(br).waypoint( function(event, direction) {
            D  &&  console.log( '   inside waypoint callback ' );
            if ( isBottom ){ 
                $(event.target).removeClass('topAlign').addClass( 'bottomAlign' );
            }else{
                $(event.target).removeClass('bottomAlign').addClass( 'topALign' );
            }
            $(event.target).css( { 
                'position':'fixed',
                'top':'10',
            } );
            event.stopPropagation();
        });
    }

    D  &&  console.log( "waypoint was added to id=" + ar );
    D  &&  console.log( 'caddi completed' );

} );

