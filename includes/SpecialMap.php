<?php
	namespace MediaWiki\Extension\Leaflet;

	class SpecialMap extends \SpecialPage {

		public function __construct() {
			parent::__construct( 'Map' );
		}

		public function execute( $sub ) {
			$out = $this->getOutput();
			$out->setPageTitle($this->msg('map'));
            $out->addModules('ext.Leaflet.map');
	    }

		protected function getGroupName() {
			return 'other';
		}
	}
?>