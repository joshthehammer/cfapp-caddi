
CloudFlare.define( 'caddi', [ 'cloudflare/dom', 'cloudflare/user', 'cfapp-caddi/config' ], function( version, user, config )
{
  // console.log( "caddi loads!", config );
  try
  {
    var _CLOSE = 'Close';                           // Close button text
    var _ADHTML = 'You Stay Classy San Diego!';     // Ad HTML Code to be injected

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

    d2.style.backgroundColor = '#eee';
    d2.style.font = '20px Helvetica,Arial,Sans-serif';
    d2.style.color = '#000';
    d2.style.backgroundImage = "url('http://www.gleeco.com/ronb.bmp')";
    d2.style.backgroundRepeat = 'no-repeat';
    d2.style.backgroundPosition = 'center bottom';

    d2.style.height = '250px';
    d2.style.marginBottom = '25px';
    d2.style.padding = '2px';
    d2.style.right = '-320px';
    d2.style.position = 'absolute';
    d2.style.top = '10px';
    d2.style.width = '300px';
    var a1 = document.createElement('a');
    a1.href = '#';
    a1.style.backgroundColor = '#000';
    a1.style.bottom = '-19px';
    a1.style.color = '#fff';
    a1.style.display = 'block';
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
    }), 1000);
    document.getElementsByTagName('body')[0].appendChild(d1);
  }
  catch( e )
  {
        //
  }
} );
