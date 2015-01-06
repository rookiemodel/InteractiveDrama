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