(function ($) {
    var foundationReg = $(window).adaptTo("foundation-registry");

    foundationReg.register("foundation.validation.validator", {
        selector: "[data-granite-coral-multifield-name='./inpagesearchlists']",
        validate: function(el) {
			var flag=0;
            var $multifields = $(el).find(".js-coral-pathbrowser-input");

    		$multifields.each(function(index) {
                            if($($multifields[index]).val() === '/content/' || $($multifields[index]).val() === '/content' || $($multifields[index]).val() === ''){
            					flag = 1; return "Invalid Path";
                            }

            });


    		return ( flag === 1
                            ? "Invalid Path, /content /content/ and empty path not allowed" : undefined);
          }
		});


    }(jQuery));