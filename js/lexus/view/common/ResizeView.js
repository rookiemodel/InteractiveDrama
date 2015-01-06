define( 'view/common/ResizeView',
    [ 'jquery', 'underscore', 'backbone' ],
    function( $, _, Backbone ){
        var ResizeView = Backbone.View.extend({
            initialize: function() {
                this.addEvent();
            },

            addEvent: function(){
                $(window).on( 'resize', _.bind(this.resizeHandler, this) );
                $(window).trigger( 'resize' );
            },

            resizeHandler: function( $evt ) {
                App.GlobalVars.windowWidth = $(window).width();
                App.GlobalVars.windowHeight = $(window).height();

                App.trigger( App.Events.RESIZE_BROWSER );
            }
        });

        return ResizeView;
    });