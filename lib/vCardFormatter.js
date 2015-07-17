/********************************************************************************
    VCardsJS 0.10, Eric J Nesser, November 2014
********************************************************************************/
/*jslint node: true */
'use strict';

/**
 * vCard formatter for formatting vCards in VCF format
 */
(function vCardFormatter() {
    var moment = require('moment');
    var majorVersion = '4';

    /**
     * Encode string
     * @param  {String}     value to encode
     * @return {String}     encoded string
     */
    function e(value) {
        if (value) {
          value = value + '';
            return value.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
        }
        return '';
    }

    /**
     * Return new line characters
     * @return {String} new line characters
     */
    function nl() {
        return '\r\n';
    }

    /**
     * Get formatted address
     * @param  {object}         address
     * @return {String}         Formatted address
     */
    function getFormattedAddress(address) {

        var formattedAddress = '';

        var type = address.type;
        address = address.value;

        if (address &&
            (address.label ||
            address.street ||
            address.city ||
            address.stateProvince ||
            address.postalCode ||
            address.countryRegion)) {

            if (majorVersion < 4) {
                if (address.label) {
                    formattedAddress = 'LABEL;TYPE=' + type + ':' + e(address.label) + nl();
                }
                formattedAddress += 'ADR;TYPE=' + type + ':;;' +
                    e(address.street) + ';' +
                    e(address.city) + ';' +
                    e(address.stateProvince) + ';' +
                    e(address.postalCode) + ';' +
                    e(address.countryRegion) + nl();
            } else {
                formattedAddress = 'ADR;TYPE=' + type +
                    ';LABEL=' + e(address.label) + ':;;' +
                    e(address.street) + ';' +
                    e(address.city) + ';' +
                    e(address.stateProvince) + ';' +
                    e(address.postalCode) + ';' +
                    e(address.countryRegion) + nl();
            }
        }

        return formattedAddress;
    }

        /**
     * Get formatted address
     * @param  {object}         address
     * @return {String}         Formatted address
     */
    function getFormattedName(n) {

        var formattedName = 'N:' +
            e(n.last) + ';' +
            e(n.first) + ';' +
            e(n.middle) + ';' +
            e(n.prefix) + ';' +
            e(n.suffix) + nl();


        return formattedName;
    }

    module.exports = {

        /**
         * Get formatted vCard in VCF format
         * @param  {object}     vCard object
         * @return {String}     Formatted vCard in VCF format
         */
        getFormattedString: function(vCard) {

            majorVersion = vCard.getMajorVersion();

            var formattedVCardString = '';
            formattedVCardString += 'BEGIN:VCARD' + nl();
            formattedVCardString += 'VERSION:' + vCard.version + nl();
            var formattedName = vCard.fn;

            if (!formattedName && vCard.n) {
                formattedName = '';

                [vCard.n.first, vCard.n.middle, vCard.n.last]
                .forEach(function(name) {
                    if (name) {
                        if (formattedName) {
                            formattedName += ' ';
                        }
                    }
                    formattedName += name;
                });
            }

            formattedVCardString += 'FN:' + e(formattedName) + nl();

            if(vCard.n && typeof vCard.n === 'object' ){
                formattedVCardString += getFormattedName(vCard.n);
            }

            if (vCard.nickname && majorVersion >= 3) {
                formattedVCardString += 'NICKNAME:' + e(vCard.nickname) + nl();
            }

            if (vCard.gender && majorVersion >= 4) {
                formattedVCardString += 'GENDER:' + e(vCard.gender) + nl();
            }

            if (vCard.bday) {
                formattedVCardString += 'BDAY:' + vCard.bday + nl();
            }

            if (vCard.anniversary && majorVersion >= 4) {
                formattedVCardString += 'ANNIVERSARY:' + vCard.anniversary + nl();
            }

            if (vCard.email) {
                if (majorVersion >= 4) {
                    formattedVCardString += 'EMAIL:' + e(vCard.email) + nl();
                } else {
                    formattedVCardString += 'EMAIL;PREF;INTERNET:' + e(vCard.email) + nl();
                }
            }

            if (vCard.adr && typeof vCard.adr === 'object' ) {

                vCard.adr = (vCard.adr.length !== null) ? vCard.adr : [vCard.adr];
                vCard.adr.forEach(
                    function(address) {
                        if(!Object.keys(address)) return;
                        formattedVCardString += getFormattedAddress(address);
                    }
                );
            }

            if (vCard.tel && typeof vCard.tel === 'object' ) {

                vCard.tel = (vCard.tel.length !== null) ? vCard.tel : [vCard.tel];
                vCard.tel.forEach(function(tel) {
                    console.log(tel);
                    if(!Object.keys(tel)) return;
                    formattedVCardString += 'TEL;TYPE=' + tel.type + ':' + e(tel.value) + nl();
                });
            }


            if (vCard.title) {
                formattedVCardString += 'TITLE:' + e(vCard.title) + nl();
            }

            if (vCard.role) {
                formattedVCardString += 'ROLE:' + e(vCard.role) + nl();
            }

            if (vCard.organization) {
                formattedVCardString += 'ORG:' + e(vCard.organization) + nl();
            }

            if (vCard.url) {
                formattedVCardString += 'URL:' + e(vCard.url) + nl();
            }

            if (vCard.note) {
                formattedVCardString += 'NOTE:' + e(vCard.note) + nl();
            }

            var specialKeys = Object.keys( vCard ).filter( function( key ){ return key.indexOf('x-') === 0 });

            if( specialKeys.length ){

              for( var i = 0; i < specialKeys.length; i++ ){

                if (
                  specialKeys[ i ] === 'x-socialprofile' &&
                  vCard['x-socialprofile'] &&
                  typeof vCard['x-socialprofile'] === 'object'
                ) {

                    vCard['x-socialprofile'] = (vCard['x-socialprofile'].length !== null) ? vCard['x-socialprofile'] : [vCard['x-socialprofile']];
                    vCard['x-socialprofile'].forEach(function(social) {
                        if(!Object.keys(social)) return;
                        formattedVCardString += 'X-SOCIALPROFILE;TYPE=' + social.type + ":" + e(social.value) + nl();
                    });

                }else{
                  formattedVCardString += specialKeys[ i ].toUpperCase() + ':' + e(vCard[ specialKeys[ i ] ]) + nl();
                }

              }

            }

            if (vCard.source) {
                formattedVCardString += 'SOURCE:' + e(vCard.source) + nl();
            }

            formattedVCardString += 'REV:' + moment().format() + nl();
            formattedVCardString += 'END:VCARD' + nl();

            console.log(formattedVCardString);
            return formattedVCardString;
        }
    };
})();
