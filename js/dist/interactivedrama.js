define('Application',
    ['backbone', 'view/common/ResizeView', 'model/interactivedrama/InteractivedramaModel', 'collection/interactivedrama/InteractivedramaCollection', 'view/interactivedrama/InteractivedramaView'],
    function( Backbone, Resize, Model, Collection, View ){
        var App = Backbone.Router.extend({
            Models: {},
            Collections: {},
            Views: {},
            Events: { 
				GOTO_PAGE: "goto_page", 
				RESIZE_BROWSER: 'resizeBrowser'
			}, 

			GlobalVars: { 
                windowWidth: 0, 
                windowHeight: 0, 
				EVENT_STORY2: 'interactivedrama'
			}, 

            routes: {
                '': 'index',
                "!/:sceneIdx" : "setPage"
            },

            index: function() {
                this.setNavigate( this.view.sceneIdx );
            },

            setNavigate: function( $hash, $trigger ) {
                $hash = ( $hash == null ) ? this.view.sceneIdx : $hash;

                this.navigate( '!/'+$hash, {trigger:!!!$trigger} );
            },

            setPage: function( $sceneIdx ) {
                this.view.sceneIdx = parseInt( $sceneIdx );

                this.trigger( this.Events.GOTO_PAGE, $sceneIdx );
            },

            startup: function( $options ) {
                this.model = new Model();
                this.collection = new Collection( {model:Model} );
                this.collection.on( 'reset', _.bind(this.completeData, this) );

				this.resize = new Resize();
				switch( $options.appName ) {
					case this.GlobalVars.EVENT_STORY2 : this.view = new View( {el:'.story-2'} ); break;
				}

                this.collection.fetch( {reset:true} );
            },

            completeData: function( $data ) {
                this.view.render( {collection:$data} );

                Backbone.history.start();
            }
        });

        return App;
});
define( 'collection/interactivedrama/InteractivedramaCollection',
    [ 'backbone' ],
    function( Backbone ) {
        var InteractivedramaCollection = Backbone.Collection.extend({
            url: 'json/lexus/interactivedrama.json',
            parse: function( $data ) {
                App.view.sceneIdx = $data.interactivedrama.sceneIdx;
                App.view.choseIdx = $data.interactivedrama.choseIdx;
                App.view.returnIdx = $data.interactivedrama.returnIdx;
                App.view.result = $data.interactivedrama.result;
                App.view.imgPath = $data.interactivedrama.imgPath;

                return $data.interactivedrama.scene;
            }
        });

        return InteractivedramaCollection;
});
define( 'view/interactivedrama/InteractivedramaView',
    [ 'jquery', 'underscore', 'backbone' ],
    function( $, _, Backbone ){
        var InteractivedramaView = Backbone.View.extend({
            initialize: function () {
				this.ALERT_MESSAGE = '영상을 다 보신 후 선택해 주세요';
				this.IMAGE_WIDTH = 640;
				this.VIDEO_WIDTH = 561;
				this.VIDEO_HEIGHT = 316;
				this.isInEvent = false;
                this.isSceneEnd = false;
                this.isRePlay = false;
                this.videoID = '';
                this.container = $(this.el);
                this.videoContainer = this.container.find('.video-con');
                this.txt = this.container.find('.section-3 > img');
                this.choises = this.container.find('.choises');
                this.end = this.container.find('.end');
                this.btn1 = this.container.find('.choise-y img');
                this.btn2 = this.container.find('.choise-n img');

                this.reset();
				this.disable();
                this.listenTo( App, App.Events.GOTO_PAGE, this.gotoPage );
				this.listenTo( App, App.Events.RESIZE_BROWSER, this.resizeHandler );
            },

            events: {
                'click .choises a': 'clickChoise',
                'click .end a': 'clickReplay'
            },

            reset: function() {
                this.isSceneEnd = false;
                this.isRePlay = false;
                this.sceneIdx = 0;
                this.choseIdx = 0;
                this.result = '';
            },

            render: function( $options ) {
                this.collection = $options.collection;

				this.addAllListItem();
            }, 

            addAllListItem: function() {
                this.collection.forEach( this.addOneListItem, this );
            }, 

            addOneListItem: function( $model, $idx ) {
                if( $model.attributes.seq === undefined ) return;

				this.sceneTotal = $idx;
            }, 

            clickChoise: function( $evt ) {
                $evt.preventDefault();

				if( this.isInEvent ) {
					alert( this.ALERT_MESSAGE );
					return;
				}

                this.sceneIdx++;
                this.choseIdx = $($evt.currentTarget).index();
                this.setResult();

                App.setNavigate( this.sceneIdx );
            },

            setResult: function( ) {
                if( this.sceneIdx == this.returnIdx && !this.isRePlay ) {
                    this.isRePlay = false;
                    this.result = '';

                } else if( this.sceneIdx == this.returnIdx+1 ) {
                    this.result = ( this.choseIdx == 0 ) ? 'fail' : 'success';
                }
            },

            clickReplay: function( $evt ) {
                $evt.preventDefault();

                this.isRePlay = true;
				this.isSceneEnd = true;
                this.toggleChoiseButton();
                if( this.result == 'fail' ) {
                    this.sceneIdx = this.returnIdx;
                    this.choseIdx = 0;
                    App.setNavigate( this.sceneIdx );

                } else {
                    this.reset();
                    App.setNavigate( this.sceneIdx );
                }
            },

            gotoPage: function( ) {
                // Exception - Without Choise Scene-4, Direction Access
                if( this.sceneIdx > this.returnIdx && this.result == '' ) {
                    this.reset();
                    App.setNavigate( this.sceneIdx );
                }

				this.disable();
                this.changeVideo();
                this.changeText();
                this.changeButton();
            }, 

			enable: function () {
				this.isInEvent = false;
			}, 

			disable: function () {
				this.isInEvent = true;
			}, 

            changeVideo: function () {
                if( this.videoContainer.children().length > 0 ) this.reomveVideo();
                this.addVideo();
            },

            addVideo: function() {
                // Exception - Fail Last Scene, Return Page
                if( this.sceneIdx == this.returnIdx && this.result == 'fail' ) {
                    this.videoID = this.getScene().return;

                // Divistion - Success & Fail Last Scene
                } else if( this.sceneIdx == this.sceneTotal ) {
                    this.videoID = this.getScene().video[ this.getResultIdx() ][ this.choseIdx ];

                } else {
                    this.videoID = this.getScene().video[ this.choseIdx ];
                }

				this.videoContainer.append( $('<div id="iframe"></div>')  );
				var eventObj = { 'onStateChange':_.bind(this.onPlayerStateChange, this) };
				var videoObj = { videoId:this.videoID, events:eventObj };
				this.player = new YT.Player('iframe', videoObj );

				App.trigger( App.Events.RESIZE_BROWSER );
				this.videoContainer.css( {display:'block'} );

            },

			onPlayerStateChange: function( $evt ) {
				if( $evt.data == YT.PlayerState.PLAYING ) {
					this.enable();
				}
			}, 

            getResultIdx: function() {
                return ( this.result == 'fail' ) ? 0 : 1;
            },

            reomveVideo: function() {
                this.videoContainer.css( {display:'none'} );
				this.player.destroy();
				this.player = null;
                this.videoContainer.find('#iframe').remove();
            },

            changeText: function() {
                var imgUrl = ( this.sceneIdx == this.sceneTotal ) ? this.getScene().content[ this.result ] : this.getScene().content;
                this.txt.attr( {src:this.imgPath+imgUrl} );
            },

            changeButton: function () {
                 if( this.sceneIdx == this.sceneTotal ) {
                     this.isSceneEnd = true;
                     this.toggleChoiseButton();

                 } else {
                     this.isSceneEnd = false;
                     this.btn1.attr( {src:this.imgPath+this.getScene().button[0]} );
                     this.btn2.attr( {src:this.imgPath+this.getScene().button[1]} );
					 this.toggleChoiseButton();
                 }
            }, 

            toggleChoiseButton: function() {
                this.choises.css( {display:this.isSceneEnd ? 'none' : 'block'} );
                this.end.css( {display:this.isSceneEnd ? 'block' : 'none'} );
            },

            getScene: function() {
                return this.collection.at(this.sceneIdx).attributes;
            }, 

			resizeHandler: function() {
				this.resizeVideo();
			}, 
	
			resizeVideo: function() {
				var w = (this.VIDEO_WIDTH/this.IMAGE_WIDTH) * 100;
				var h = (this.VIDEO_HEIGHT/this.VIDEO_WIDTH) * 100;
				this.videoContainer.css( {width:w+'%', height:h+'%'} );
				$('iframe').css( {width:'100%', height:this.videoContainer.height()} );
			}
        });

        return InteractivedramaView;
});
// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


// YouTube Player - iframe API
if (!window['YT']) {var YT = {loading: 0,loaded: 0};}if (!window['YTConfig']) {var YTConfig = {'host': 'http://www.youtube.com'};}if (!YT.loading) {YT.loading = 1;(function(){var l = [];YT.ready = function(f) {if (YT.loaded) {f();} else {l.push(f);}};window.onYTReady = function() {YT.loaded = 1;for (var i = 0; i < l.length; i++) {try {l[i]();} catch (e) {}}};YT.setConfig = function(c) {for (var k in c) {if (c.hasOwnProperty(k)) {YTConfig[k] = c[k];}}};var a = document.createElement('script');a.id = 'www-widgetapi-script';a.src = 'https:' + '//s.ytimg.com/yts/jsbin/www-widgetapi-vflpis9xw/www-widgetapi.js';a.async = true;var b = document.getElementsByTagName('script')[0];b.parentNode.insertBefore(a, b);})();}
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