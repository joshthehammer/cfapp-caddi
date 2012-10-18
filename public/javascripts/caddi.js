
CloudFlare.define( 'caddi', [ 'cfapp-caddi/config', 'cloudflare/owl' ], function(cfg, owl) {

    // console.log( "inside caddi", O );

    var section_id  = '3628055';// default: static+video  
    if ( cfg && cfg.text_only ){ 
        section_id = '3628054';    
    }

    var cfOwl           = owl.createDispatcher('caddi');

    var Cxx = function(){ 
        return 'background-color: white; '
         + 'bottom: -27px; '
         + 'color: #404040; '
         + 'font-weight: bold; '
         + 'font-size: 13px; '
         + 'padding: 0px 5px 0.5px 4px; '
         + 'text-decoration:none; '
         + 'border-bottom: 1px solid #404040; ' 
         + 'border-left: 1px solid #404040; ' 
         + 'right: 0; '
         + 'position: absolute; '
         + 'display: block;  '
    }


    // Close button text
    var _CLOSE =          'x',

        // How long to wait before sliding in.
        _DELAY = 1000,          

        // Ad HTML Code to be injected
        _ADHTML =               
        '<!-- BEGIN STANDARD TAG - 300 x 250 - CloudFlare Publisher Network: CloudFare Network 300x250 Slider - Static + Video - DO NOT MODIFY --><IFRAME style="border: 1px solid #404040; padding: 3px; background-color: white;" FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="//ad.yieldmanager.com/st?ad_type=iframe&ad_size=300x250&section=' + section_id + '&pub_url=' + escape(location.href)  + '"></IFRAME><!-- END TAG -->';

    // DO NOT MODIFY BELOW THIS POINT
    var d1 = document.createElement('div');
    d1.style.display = 'none';
    d1.style.height = '300px';
    d1.style.overflow = 'hidden';
    d1.style.position = 'absolute';    
    d1.style.right = '0';
    d1.style.top = '150px';
    d1.style.width = '320px';
    d1.style.zIndex = 2e7;
    // iframe style
    var d2 = document.createElement('div');
    d2.style.backgroundColor = '#fff';
    d2.style.height = '250px';
    d2.style.marginBottom = '25px';
    d2.style.padding = '2px';
    d2.style.right = '-320px';
    d2.style.position = 'absolute';
    d2.style.top = '10px';
    d2.style.width = '300px';

    // close button 
    var a1 = document.createElement('a');
    a1.href = '#';
    a1.setAttribute('style', Cxx() );
    a1.innerHTML = _CLOSE;

    a1.onclick = function() {
        d1.parentNode.removeChild(d1);
        cfOwl.dispatch( { 
            action:     'click',
            type:       'close'
        });
        return false;
    }
 
    d2.innerHTML = _ADHTML;
    d1.appendChild(d2);
    d2.appendChild(a1);
 

    d1.style.display = 'block';
    setTimeout((function iii() {
        d1.style.display = 'block';
        var s = parseInt(d2.style.right);
        if (s <= 0) {
            d2.style.right = (s + 6) + 'px';
            setTimeout(iii, 10);
        } else {
            d2.style.right = '0px';
            a1.style.display = 'block';
        }
        cfOwl.dispatch( { 
            action:     'load',
        });
 
    }), _DELAY);
    document.getElementsByTagName('body')[0].appendChild(d1);
} );

