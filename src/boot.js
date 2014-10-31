var G = this.G = {};
(function (G) {
    var config = {};
    G.config = function ( key, value ) {
        if ( ! arguments.length ) {
            return config;
        } else if ( arguments.length === 2 ) {
            config[ key ] = value;
        } else if ( typeof key === 'object' ) {
            Object.keys( key ).forEach(function (k) {
                config[ k ] = key[ k ];
            });
        } else {
            return config[ key ];
        }
    };
})(G);