require.config({
    urlArgs: "v=" +  (new Date()).getTime(),
    baseUrl: "js/lexus/",
    paths: {
        plugins: '../libs/plugins', 
        jquery: '../libs/jquery-1.10.1.min',
        underscore: '../libs/underscore-1.6.0.min',
        backbone: '../libs/backbone-1.1.2.min'
    },
    shim: {
        jquery: { exports: "$" },
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        }
    }
});

require(['jquery', 'Application', 'plugins'], function( $, Application ) {
    $( function(){
        window.App = new Application();
        App.startup( {appName:'interactivedrama'} );
    })
});

require.onError = function( $error ) {
    console.log( $error.requireType );

    if( $error.requireType === 'timeout' ) {
        console.log( 'modules: '+$error.requireModules );
    }

    throw $error;
};