(function (G) {
    var doc = document;
    var head = doc.head || doc.getElementsByTagName( 'head' )[0] || doc.documentElement;
    var baseElement = head.getElementsByTagName( 'base' )[0];
    var localStorage = window.localStorage || undefined;


    G.Loader.register(/\.js/, function ( module ) {
        var self  = this;
        var versions = G.config('version') || {};
        var version = versions[module.id];
        var expire = G.config('expire') || 604800;
        var now = Date.now() / 1000;
        if (!version) {
            version = parseInt(now - (now % expire), 10);
        }

        module.status = G.Module.STATUS.FETCHING;

        loadScript( module, version, function (err) {
            var deps, content;

            if (err) {
                self.fail( err );
            } else {
                if (module.status === G.Module.STATUS.FETCHING) {
                    module.status = G.Module.STATUS.FETCHED;
                }

                if ( module.status > 0 && module.status < G.Module.STATUS.SAVED ) {
                    self.compile();
                }

                if (G.config('enableLocalstorage') && localStorage) {
                    deps = module.dependencies.map(function (dep) {
                        return '"' + dep.id + '"';
                    }).join(',');

                    content = 'define("' + module.id + '",' + '['+ deps +'],' + module.factory.toString() + ')';

                    try {
                        localStorage.setItem('FILE#' + module.id, version + '#__#' + content);
                    } catch (ex) {
                        // ignore
                    }
                }
            }
        });
    });

    function loadScript (module, version, callback) {
        var node;
        var localContent;
        var done  = false;
        var timer;
        // load from localstorage
        if (G.config('enableLocalstorage')) {
            try {
                localContent = localStorage ? localStorage.getItem('FILE#' + module.id) : '';
                if (localContent && parseInt(localContent.split('#__#')[0], 10) === version) {
                    setTimeout(function () {
                        callback();
                    }, 0);

                    eval(localContent.split('#__#')[1]);
                    return;
                }
            } catch (ex) {
                // ignore
            }
        }



        node  = doc.createElement( 'script' );

        node.setAttribute( 'type', 'text/javascript' );
        node.setAttribute( 'charset', 'utf-8' );

        node.setAttribute( 'src', module.url );
        node.setAttribute( 'async', true );
        node.onload = node.onreadystatechange = function(){
            if ( !done &&
                    ( !this.readyState ||
                       this.readyState === 'loaded' ||
                       this.readyState === 'complete' )
            ){
                // clear
                done = true;
                clearTimeout( timer );
                node.onload = node.onreadystatechange = null;

                callback();
            }
        };

        node.onerror = function(){
            clearTimeout( timer );
            head.removeChild( node );
            callback( new Error( 'Load Fail' ) );
        };

        timer = setTimeout( function () {
            head.removeChild( node );
            callback( new Error( 'Load timeout' ) );
        }, 30000 ); // 30s

        baseElement ?
            head.insertBefore(node, baseElement) :
            head.appendChild(node);
    }
})(G);