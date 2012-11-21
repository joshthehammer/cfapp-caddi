
/** 
 * TODO
    [x] text only vs. text+richmedia
    [x] scroll locking
    [x] jquery working
    [x] waypoints working
    [x] rate limit via cookie
    [x] R/L position via config
    [] OWL sends data correctly
    [] OWL data format
**/

CloudFlare.define( 'caddi', 
    [       'caddi/config', 'cloudflare/dom',   'cloudflare/user',  'cloudflare/owl',   'cloudflare/jquery1.7' ], 
    function(cfg,           dom,                user,               owl,                jQuery ) {

    var section_id  = '3628055';    // default: static+video  

    if ( cfg && cfg.text_only ){ 
        section_id = '3628054';    // static only
    }
    
    var cookie          =  'cfapp_caddi'+section_id,
        view_max        = ( cfg.view_max_ct || 0 ),
        view_ttl        = ( cfg.view_ttl_days || 1 ),
        view_ct         = ( user.getCookie( cookie ) || 0 );

    console.log( "config -- ", cfg );
    // console.log( 'cookie = ' + cookie, ' view count=', view_ct );

    if( view_max && view_ct >= view_max ) {
        console.log( 'view_count over max' );
        window.alert( 'view_count over max / ' + view_ct );
        return true;
    }else{
        ++view_ct;
        console.log( 'setting cookie=' + cookie +  ' view_ct=' + view_ct , + 'view_ttl=' + view_ttl );
        user.setCookie( cookie, view_ct, view_ttl );
    }

    var $ = jQuery;

/*
 * jQuery Waypoints - v1.1.7
 * Copyright (c) 2011-2012 Caleb Troughton
 * */
(function($,k,m,i,d){var e=$(i),g="waypoint.reached",b=function(o,n){o.element.trigger(g,n);if(o.options.triggerOnce){o.element[k]("destroy")}},h=function(p,o){if(!o){return -1}var n=o.waypoints.length-1;while(n>=0&&o.waypoints[n].element[0]!==p[0]){n-=1}return n},f=[],l=function(n){$.extend(this,{element:$(n),oldScroll:0,waypoints:[],didScroll:false,didResize:false,doScroll:$.proxy(function(){var q=this.element.scrollTop(),p=q>this.oldScroll,s=this,r=$.grep(this.waypoints,function(u,t){return p?(u.offset>s.oldScroll&&u.offset<=q):(u.offset<=s.oldScroll&&u.offset>q)}),o=r.length;if(!this.oldScroll||!q){$[m]("refresh")}this.oldScroll=q;if(!o){return}if(!p){r.reverse()}$.each(r,function(u,t){if(t.options.continuous||u===o-1){b(t,[p?"down":"up"])}})},this)});$(n).bind("scroll.waypoints",$.proxy(function(){if(!this.didScroll){this.didScroll=true;i.setTimeout($.proxy(function(){this.doScroll();this.didScroll=false},this),$[m].settings.scrollThrottle)}},this)).bind("resize.waypoints",$.proxy(function(){if(!this.didResize){this.didResize=true;i.setTimeout($.proxy(function(){$[m]("refresh");this.didResize=false},this),$[m].settings.resizeThrottle)}},this));e.load($.proxy(function(){this.doScroll()},this))},j=function(n){var o=null;$.each(f,function(p,q){if(q.element[0]===n){o=q;return false}});return o},c={init:function(o,n){this.each(function(){var u=$.fn[k].defaults.context,q,t=$(this);if(n&&n.context){u=n.context}if(!$.isWindow(u)){u=t.closest(u)[0]}q=j(u);if(!q){q=new l(u);f.push(q)}var p=h(t,q),s=p<0?$.fn[k].defaults:q.waypoints[p].options,r=$.extend({},s,n);r.offset=r.offset==="bottom-in-view"?function(){var v=$.isWindow(u)?$[m]("viewportHeight"):$(u).height();return v-$(this).outerHeight()}:r.offset;if(p<0){q.waypoints.push({element:t,offset:null,options:r})}else{q.waypoints[p].options=r}if(o){t.bind(g,o)}if(n&&n.handler){t.bind(g,n.handler)}});$[m]("refresh");return this},remove:function(){return this.each(function(o,p){var n=$(p);$.each(f,function(r,s){var q=h(n,s);if(q>=0){s.waypoints.splice(q,1);if(!s.waypoints.length){s.element.unbind("scroll.waypoints resize.waypoints");f.splice(r,1)}}})})},destroy:function(){return this.unbind(g)[k]("remove")}},a={refresh:function(){$.each(f,function(r,s){var q=$.isWindow(s.element[0]),n=q?0:s.element.offset().top,p=q?$[m]("viewportHeight"):s.element.height(),o=q?0:s.element.scrollTop();$.each(s.waypoints,function(u,x){if(!x){return}var t=x.options.offset,w=x.offset;if(typeof x.options.offset==="function"){t=x.options.offset.apply(x.element)}else{if(typeof x.options.offset==="string"){var v=parseFloat(x.options.offset);t=x.options.offset.indexOf("%")?Math.ceil(p*(v/100)):v}}x.offset=x.element.offset().top-n+o-t;if(x.options.onlyOnScroll){return}if(w!==null&&s.oldScroll>w&&s.oldScroll<=x.offset){b(x,["up"])}else{if(w!==null&&s.oldScroll<w&&s.oldScroll>=x.offset){b(x,["down"])}else{if(!w&&s.element.scrollTop()>x.offset){b(x,["down"])}}}});s.waypoints.sort(function(u,t){return u.offset-t.offset})})},viewportHeight:function(){return(i.innerHeight?i.innerHeight:e.height())},aggregate:function(){var n=$();$.each(f,function(o,p){$.each(p.waypoints,function(q,r){n=n.add(r.element)})});return n}};$.fn[k]=function(n){if(c[n]){return c[n].apply(this,Array.prototype.slice.call(arguments,1))}else{if(typeof n==="function"||!n){return c.init.apply(this,arguments)}else{if(typeof n==="object"){return c.init.apply(this,[null,n])}else{$.error("Method "+n+" does not exist on jQuery "+k)}}}};$.fn[k].defaults={continuous:true,offset:0,triggerOnce:false,context:i};$[m]=function(n){if(a[n]){return a[n].apply(this)}else{return a.aggregate()}};$[m].settings={resizeThrottle:200,scrollThrottle:100};e.load(function(){$[m]("refresh")})})(jQuery,"waypoint","waypoints",window);



    // console.log( "waypoints settings ", $.waypoints.settings );

    var cfOwl           = owl.createDispatcher('caddi');


    console.log( "owl dispatcher:", cfOwl );

    var isLeft      = ( Math.floor((Math.random()*10)+1) < 6 ) ? true : false,
        // isLeft      = true,
        orient      = isLeft ? 'left' : 'right';

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
               // animate: br + ' { background-color: #ffffff; height: 250px; width:320px; margin-bottom: 25px; padding: 2px; left : 0px; position: absolute; top: 10px; } ' + 
               fr + ' { height: 250px; width: 300px; margin: 0px; padding: 3px; background-color: #ffffff; border: 1px solid #404040; border-left: 0px } ' + 
               xr + ' { background-color: #ffffff; margin-top: -1px; color: #404040; font-weight: bold; font: 16px Helvetica,Arial,Sans-serif; padding: 0px 5px 0.6px 4px; text-decoration: none; border-bottom: 1px solid #404040; border-right: 1px solid #404040; left : 0; position: absolute; display: block; } ' 
               )
            :  ( 
               ar + ' { display: none; height: 300px; overflow: hidden; position: absosulte; width: 320px; right: 0; top: 150px; z-index: 4; } ' + 
               br + ' { background-color: #ffffff; height: 250px; margin-bottom: 25px; padding: 2px; right: -320px; position: absolute; top: 10px; } ' + 
               // animate: br + ' { background-color: #ffffff; height: 250px; margin-bottom: 25px; padding: 2px; right: 0px; position: absolute; top: 10px; } ' + 
               fr + ' { height: 250px; width: 300px; margin: 0px; padding: 3px; background-color: #ffffff; border: 1px solid #404040; border-right: 0px } ' + 
               xr + ' { background-color: #ffffff; margin-top: -1px; color: #404040; font-weight: bold; font: 16px Helvetica,Arial,Sans-serif; padding: 0px 5px 0.6px 4px; text-decoration: none; border-bottom: 1px solid #404040; border-left: 1px solid #404040; right: 0; position: absolute; display: block; } '
               );


    console.log( "vars were set: ar=" + ar + ' br='+ br + ' xr=' + xr + ' isLeft=' + isLeft );

    $('head').append(  '<style type="text/css">' + css + '</style>' );

    $('<div/>').attr('id', a).appendTo('body');

    $('<div/>').attr('id', b).html(iframe).appendTo(ar);

    $('<a href="#">x</a>').attr('id',x).appendTo(br);

    $(xr).click(function(){ 
        $(ar).remove();
        // cfOwl.dispatch( {action: 'close'});
    });

    $(ar).css('display', 'block');
    $(br).css('display', 'block');
    

    console.log( "classes were added orient= " + orient  );

    /** 

    $(br).animate({ orient : '+=320px' }, "slow", function() { 
        console.log( '   animate is done ' );
        // $(br).css(orient, '0px' );
        $(xr).css('display', 'block');

    });

    // jquery fadeIN

    $(br).fadeIn(tx, function(){ 
        console.log( '   fadeIn all done ' );
        $(br).css(orient, '0px' );
        $(ar).css('display', 'block' );
        $(xr).css('display', 'block');
    });
    ****/

    setTimeout((function slideIn() {

        // console.log( 'inside slideIn() function orient='+orient + ' delay=' + tx );
        $(ar).css('display', 'block' );
        var s = parseInt( $(br).css( orient ) );
        // console.log( '    got s=' + s );
        if (s <= 0 ) {
            $(br).css(orient, (s + 8) + 'px' );        // lower is slower
            setTimeout(slideIn, 10);
        } else {
            console.log( '   slideIn all done ' );
            $(br).css(orient, '0px' );
            $(xr).css('display', 'block');
        }
 
    }), tx );



    // console.log( "timeout was added" );
    cfOwl.dispatch( {action: 'load'});

    $.waypoints.settings.scrollThrottle = 50;       // default=100

    $(br).waypoint( function(event, direction) {
        // console.log( ' ..inside ads waypoint op' );
        $(event.target).css( { 
            'position':'fixed',
            'top':'20',
        } );
        event.stopPropagation();
    });


    // console.log( "waypoint was added to id=" + ar );
    console.log( 'caddi completed' );

} );

