
CloudFlare.define( 'caddi', [ 'cfapp-caddi/config' ], function(o) {
    console.log( "inside caddi", o );

    // config supports adtypes txt AND/OR video?  

    // Close button text
    var _CLOSE =          ' X ',

        // How long to wait before sliding in.
        _DELAY = 1000,          

        // Ad HTML Code to be injected
        _ADHTML =               
        '<!-- BEGIN STANDARD TAG - 300 x 250 - CloudFlare Publisher Network: CloudFare Network 300x250 Slider - Static + Video - DO NOT MODIFY --><IFRAME FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=300 HEIGHT=250 SRC="//ad.yieldmanager.com/st?ad_type=iframe&ad_size=300x250&section=3628055&pub_url=' + escape(location.href)  + '"></IFRAME><!-- END TAG -->';

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
    a1.style.backgroundColor = '#444';
    a1.style.bottom = '-19px';
    a1.style.color = '#fff';
    a1.style.display = 'block';
    a1.style.border = '1px solid #999';
    a1.style.font = '10px Helvetica,Arial,Sans-serif';
    a1.style.padding = '4px';
    a1.style.position = 'absolute';
    a1.style.right = '0';
    a1.style.textDecoration = 'none';
    a1.style.zIndex = 2e7;
    a1.innerHTML = _CLOSE;
    a1.onclick = function() {
        d1.parentNode.removeChild(d1);
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
    }), _DELAY);
    document.getElementsByTagName('body')[0].appendChild(d1);
} );

