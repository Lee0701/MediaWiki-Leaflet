<?php
	namespace MediaWiki\Extension\Leaflet;

    use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;
    use Config;

	class HookHandler implements ResourceLoaderGetConfigVarsHook {

        public function onResourceLoaderGetConfigVars( array &$vars, $skin, Config $config ): void {
            $vars['wgLeaflet'] = [
                'tileUrl' => $config->get('LeafletTileUrl'),
                'attribution' => $config->get('LeafletAttribution'),
                'viewLat' => $config->get('LeafletViewLat'),
                'viewLng' => $config->get('LeafletViewLng'),
                'viewZoom' => $config->get('LeafletViewZoom'),
                'markerCategory' => $config->get('LeafletMarkerCategory'),
            ];
        }

	}
?>