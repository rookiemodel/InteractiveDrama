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