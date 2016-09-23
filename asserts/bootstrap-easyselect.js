(function($){

function forEach(array, callback) {
    for (var index = 0; index < array.length; ++index) {
        callback(array[index], index);
    }
}

/**
* 构造器
*
* @param {jQuery} container
* @param {Object} options
* @returns {Easyselect}
*/
function Easyselect(container, options){
	this.$container = $(container);
	if(!this.$container.hasClass('btn-group')){
		this.$container.addClass('btn-group')
	}

	this.options = this.mergeOptions($.extend({}, options, this.$container.data()));

	this.query = '';
    this.searchTimeout = null;
    this.lastToggledInput = null;

    this.options.multiple = this.$container.attr('multiple') === "multiple";
    this.options.onChange = $.proxy(this.options.onChange, this);
    this.options.onDropdownShow = $.proxy(this.options.onDropdownShow, this);
    this.options.onDropdownHide = $.proxy(this.options.onDropdownHide, this);
    this.options.onDropdownShown = $.proxy(this.options.onDropdownShown, this);
    this.options.onDropdownHidden = $.proxy(this.options.onDropdownHidden, this);
    this.options.onFiltering = $.proxy(this.options.onFiltering, this);

    // Build select all if enabled.
    this.buildContainer();
    this.buildButton();
    this.buildDropdown();
    this.buildDropdownMenu();
}

Easyselect.prototype = {
	defaults : {
		/**
             * 按钮文字
             *
             * @param {jQuery} options
             * @param {jQuery} container
             * @returns {String}
             */
            buttonText: function(options, container) {
                if (this.disabledText.length > 0
                        && (container.prop('disabled') || (options.length == 0 && this.disableIfEmpty)))  {

                    return this.disabledText;
                }
                else if (options.length === 0) {
                    return this.nonSelectedText;
                }
                else if (options.length > this.numberDisplayed) {
                    return options.length + ' ' + this.nSelectedText;
                }
                else {
                    var selected = '';
                    var delimiter = this.delimiterText;

                    options.each(function() {
                        var tagA  = $(this).children('a');
                        var label = (tagA.attr('label') !== undefined) ? tagA.attr('label') : tagA.text();
                        selected += label + delimiter;
                    });

                    return selected.substr(0, selected.length - this.delimiterText.length);
                }
            },
            /**
             * 更新按钮title
             *
             * @param {jQuery} options
             * @param {jQuery} container
             * @returns {@exp;selected@call;substr}
             */
            buttonTitle: function(options, container) {
                if (options.length === 0) {
                    return this.nonSelectedText;
                }
                else {
                    var selected = '';
                    var delimiter = this.delimiterText;

                    options.each(function () {
                        var tagA  = $(this).children('a');
                        var label = (tagA.attr('label') !== undefined) ? tagA.attr('label') : tagA.text();
                        selected += label + delimiter;
                    });
                    return selected.substr(0, selected.length - this.delimiterText.length);
                }
            },
            /**
             * 触发onChange事件
             *
             * Not triggered when selecting/deselecting options manually.
             *
             * @param {jQuery} option
             * @param {Boolean} checked
             */
            onChange : function(option, checked) {

            },
            /**
             * Triggered when the dropdown is shown.
             *
             * @param {jQuery} event
             */
            onDropdownShow: function(event) {

            },
            /**
             * Triggered when the dropdown is hidden.
             *
             * @param {jQuery} event
             */
            onDropdownHide: function(event) {

            },
            /**
             * Triggered after the dropdown is shown.
             *
             * @param {jQuery} event
             */
            onDropdownShown: function(event) {

            },
            /**
             * Triggered after the dropdown is hidden.
             *
             * @param {jQuery} event
             */
            onDropdownHidden: function(event) {

            },
            /**
             * 触发过滤
             *
             * @param {jQuery} $filter
             */
            onFiltering: function($filter) {

            },
            enableHTML: false,
            buttonClass: 'btn btn-default',
            inheritClass: false,
            buttonWidth: 'auto',
            buttonContainer: '<div class="btn-group" />',
            dropRight: false,
            dropUp: false,
            selectedClass: 'active',
            // Maximum height of the dropdown menu.
            // If maximum height is exceeded a scrollbar will be displayed.
            maxHeight: false,
            // possible options: 'text', 'value', 'both'
            filterBehavior: 'text',
            nonSelectedText: '无选项',
            nSelectedText: 'selected',
            numberDisplayed: 3,
            disableIfEmpty: false,
            disabledText: '',
            delimiterText: '的',
            name: 'name',
            value: 'value',
            templates: {
                button: '<button type="button" class="dropdown-toggle" data-toggle="dropdown"><span class="easyselect-selected-text"></span><span class="caret" style="margin-left:5px;"></span></button>',
                ul: '<ul class="easyselect-container dropdown-menu"></ul>',
                filter: '<li class="easyselect-item easyselect-filter"><div class="input-group"><span class="input-group-addon" style="padding:6px;border-right:none;"><i class="glyphicon glyphicon-search"></i></span><input class="form-control easyselect-search" style="" type="text"></div></li>',
                filterClearBtn: '',
                li: '<li><a href=""></a></li>',
                divider: '<li class="easyselect-item divider"></li>',
                liGroup: '<li class="easyselect-item easyselect-group"><label></label></li>'
            }
	},
	constructor: Easyselect,
	/**
     * 添加container事件
     */
    buildContainer: function() {
        if(!this.$container.hasClass('easyselect')){
            this.$container.addClass('easyselect');
        }
         
        this.$container.on('show.bs.dropdown', this.options.onDropdownShow);
        this.$container.on('hide.bs.dropdown', this.options.onDropdownHide);
        this.$container.on('shown.bs.dropdown', this.options.onDropdownShown);
        this.$container.on('hidden.bs.dropdown', this.options.onDropdownHidden);
    },
    /**
     * 创建button
     */
    buildButton: function() {
    	var btn = this.$container.children('button.btn');
    	if(btn.length>0){
    		this.$button = btn.eq(0);
            var spans = this.$button.children('span');
            if(!spans.eq(0).hasClass('easyselect-selected-text')){
                spans.eq(0).addClass('easyselect-selected-text')
            }
    	}else{
    		this.$button = $(this.options.templates.button).addClass(this.options.buttonClass);
    		this.$container.prepend(this.$button);
    	}

        // Adopt active state.
        if (this.$container.prop('disabled')) {
            this.disable();
        }
        else {
            this.enable();
        }

        // Manually add button width if set.
        if (this.options.buttonWidth && this.options.buttonWidth !== 'auto') {
            this.$button.css({
                'width' : '100%', //this.options.buttonWidth,
                'overflow' : 'hidden',
                'text-overflow' : 'ellipsis'
            });
            this.$container.css({
                'width': this.options.buttonWidth
            });
        }
        
    },
    /**
     * 创建下拉列表
     */
    buildDropdown: function() {
    	var ul = this.$container.children('ul.dropdown-menu');
        // Build ul.
        if(ul.length>0){
        	this.$ul = ul.eq(0);
        	if(!this.$ul.hasClass('easyselect-container'))
        		this.$ul.addClass('easyselect-container');
        }else{
        	this.$ul = $(this.options.templates.ul);
        	this.$container.append(this.$ul);
        }
        
        if (this.options.dropRight) {
            this.$ul.addClass('pull-right');
        }

        // Set max height of dropdown menu to activate auto scrollbar.
        if (this.options.maxHeight) {
            // TODO: Add a class for this option to move the css declarations.
            this.$ul.css({
                'max-height': this.options.maxHeight + 'px',
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            });
        }

        if (this.options.dropUp) {

            var height = Math.min(this.options.maxHeight, $('li[data-role!="divider"]', this.$ul).length*26 + $('li[data-role="divider"]', this.$ul).length*19 + (this.options.includeSelectAllOption ? 26 : 0) + (this.options.enableFiltering || this.options.enableCaseInsensitiveFiltering ? 44 : 0));
            var moveCalc = height + 34;

            this.$ul.css({
                'max-height': height + 'px',
                'overflow-y': 'auto',
                'overflow-x': 'hidden',
                'margin-top': "-" + moveCalc + 'px'
            });
        }
    },
    /**
     * 创建下拉菜单的值和绑定必要的事件
     *
     * Uses createDivider and createOptionValue to create the necessary li.
     */
    buildDropdownMenu: function() {
    	this.$ul.children().each($.proxy(function(index, element) {

            var $element = $(element);
            // Support optgroups and options without a group simultaneously.
            var tag = $element.prop('tagName')
                .toLowerCase();

        	if($element.data('role') === 'group'){
        		this.createOptgroup(element);
        	}
            if ($element.data('role') === 'divider') {
                this.createDivider();
            }
            else {
                this.createOptionValue(element);
            }
            // Other illegal tags will be ignored.
        }, this));

        $('li:not(.easyselect-group)', this.$ul).on('click', $.proxy(function(event) {
            event.stopPropagation();
            event.preventDefault();
        	var tagName = event.target.tagName;
        	if(tagName == 'A'){
        		var $target = $(event.target);
        	}else{
        		var $target = $(event.target).find('a').eq(0);
        	}
        	var $li = $target.closest('li');
            if($li.hasClass('disabled')){   //禁用按钮，不执行点击事件
                return;
            }
            
            var $liNotThis = $('li', this.$ul).not($li);
            $liNotThis.removeClass(this.options.selectedClass);

            // Apply or unapply the configured selected class.
            var activeClass = this.options.selectedClass;
            if (activeClass) {
                if (!$li.hasClass(activeClass)) {
                    this.setActiveClass($li);
                }
            }
            // Get the corresponding option.
            var value = $target.attr('value');

            
            
            // To prevent select all from firing onChange: #575
            this.options.onChange($target);

            this.updateButtonText();
            this.$button.click();
        }, this));
    },


    setActiveClass: function(element){
        $(element).addClass(this.options.selectedClass);
        var ul = $(element).closest('ul');
        if(ul.parent()[0].tagName == 'LI'){
            this.setActiveClass(ul.parent());
        }
    },

    /**
     * Create an option using the given select option.
     *
     * @param {jQuery} element
     */
    createOptionValue: function(element) {

    },

	/**
     * Creates a divider using the given select option.
     *
     * @param {jQuery} element
     */
    createDivider: function(element) {
        var $divider = $(this.options.templates.divider);
        this.$ul.append($divider);
    },

    /**
     * Creates an optgroup.
     *
     * @param {jQuery} group
     */
    createOptgroup: function(group) {

    },

    /**
     * The provided data will be used to build the dropdown.
     */
    dataprovider: function(dataprovider) {
        var $ul  = this.$ul.empty();
        var $name  = this.options.name? this.options.name:this.defaults.name;
        var $value = this.options.value? this.options.value:this.defaults.value;

        $.each(dataprovider, function (index, option) {

            var attrForA = {
                'value': option[$value],
                'label': option[$name] || option[$value],
                'title': option.title||'',
                'class': option.class||''
            };

            var attrForLI = {
                'selected': !!option.selected,
                'disabled': !!option.disabled
            }
            for (var key in option.attributes) {
              attrForA['data-' + key] = option.attributes[key];
            }

            $tagA = $('<a/>').attr(attrForA);
            $tagA.text(attrForA['label']);

            $tagLI = $('<li/>');
            $tagLI.append($tagA);
            if(attrForLI['selected']){
                $tagLI.addClass('active');
            }
            if(attrForLI['disabled']){
                $tagLI.addClass('disabled');
            }

            if ($.isArray(option.children)) {            // create optiongroup tag

                var $subUl = $('<ul/>').attr({
                    class: 'dropdown-menu extend-menu'
                });
                $tagLI.addClass('extend-li');

                forEach(option.children,function(subOption){
                    var attrForSubA = {
                        'value': subOption[$value],
                        'label': subOption[$name] || subOption[$value],
                        'title': subOption.title||'',
                        'class': subOption.class||''
                    };

                    var attrForSubLI = {
                        'selected': !!subOption.selected,
                        'disabled': !!subOption.disabled
                    }
                    
                     //Loop through attributes object and add key-value for each attribute
                    for (var key in subOption.attributes) {
                        attrForSubA['data-' + key] = subOption.attributes[key];
                    }

                    $tagSubA = $('<a/>').attr(attrForSubA);
                    $tagSubA.text(attrForSubA['label']);

                    $tagSubLI = $('<li/>');
                    $tagSubLI.append($tagSubA);
                    if(attrForSubLI['selected']){
                        $tagSubLI.addClass('active');
                    }
                    if(attrForSubLI['disabled']){
                        $tagSubLI.addClass('disabled');
                    }

                    $subUl.append($tagSubLI);
                });
                $tagLI.append($subUl);
            }
            $ul.append($tagLI);
        });

        if($ul.find('li.active').length == 0){
            var list = $ul.children('li');
            for(var i=0; i<list.length; i++){
                if(!list.eq(i).hasClass('disabled')){
                    list.eq(i).addClass(this.options.selectedClass);
                    break;
                }
            }
        }
        this.rebuild();
    },

    /**
     * Enable the multiselect.
     */
    enable: function() {
        this.$button.prop('disabled', false)
            .removeClass('disabled');
    },

    /**
     * Disable the multiselect.
     */
    disable: function() {
        this.$button.prop('disabled', true)
            .addClass('disabled');
    },

    /**
     * Select all options of the given values.
     *
     * If triggerOnChange is set to true, the on change event is triggered if
     * and only if one value is passed.
     *
     * @param {Array} selectValues
     * @param {Boolean} triggerOnChange
     */
    select: function(selectValues, triggerOnChange) {
        if(!$.isArray(selectValues)) {
            selectValues = [selectValues];
        }

        for (var i = 0; i < selectValues.length; i++) {
            var value = selectValues[i];

            if (value === null || value === undefined) {
                continue;
            }

            var $a  = this.$ul.find('li').find('a[value="'+value+'"]');
            var $li = $a.closest('li');
            if($a.length==0){
                continue;
            }
            if (this.options.selectedClass) {
                var $liNotThis = $('li', this.$ul).not($li);
                $liNotThis.removeClass(this.options.selectedClass);
                this.setActiveClass($li);
            }

            if (triggerOnChange) {
                this.options.onChange($li, true);
            }
        }

        this.updateButtonText();
    },

	/**
     * Update the button text and its title based on the currently selected options.
     */
    updateButtonText: function() {
        var options = this.getSelected();

        // First update the displayed button text.
        if (this.options.enableHTML) {
            $('.easyselect-selected-text', this.$container).html(this.options.buttonText(options, this.$container));
        }
        else {
            $('.easyselect-selected-text', this.$container).text(this.options.buttonText(options, this.$container));
        }

        // Now update the title attribute of the button.
        $('.easyselect', this.$container).attr('title', this.options.buttonTitle(options, this.$container));
    },

    /**
     * Rebuild the plugin.
     *
     * Rebuilds the dropdown, the filter and the select all option.
     */
    rebuild: function() {

        // Important to distinguish between radios and checkboxes.
        this.options.multiple = this.$container.attr('multiple') === "multiple";

        this.buildDropdownMenu();

        this.updateButtonText();

        if (this.options.enableClickableOptGroups && this.options.multiple) {
            this.updateOptGroups();
        }

        if (this.options.disableIfEmpty && $('li', this.$ul).length <= 0) {
            this.disable();
        }
        else {
            this.enable();
        }

        if (this.options.dropRight) {
            this.$ul.addClass('pull-right');
        }
    },

    /**
     * Get all selected options.
     *
     * @returns {jQUery}
     */
    getSelected: function() {
        return $('li', this.$ul).filter("."+this.options.selectedClass);
    },

    /**
     * Get all selected options.
     *
     * @returns {jQUery}
     */
    getValue: function(attr) {
        var options = this.getSelected();
        var $resA = null;
        var $result = '';
        for(var i=0; i<options.length; i++){
            $resA   = options.eq(i).children('a');
            $ul     = options.eq(i).children('ul');
            if($ul.length>0 && $ul.children('li.active').length>0){
                $resA = $ul.children('li.active').children('a');
            }
        }

        if($resA){
            var val = '';
            if(!attr){  //取value
                val = $resA.attr('value');
            }else{      //取自定义属性
                val = $resA.data(attr);
            }
           
            $result = !!val? val : $resA.text();
        }
        return $result;
    },

    /**
     * Refreshs the multiselect based on the selected options of the select.
     */
    refresh: function () {

    },

    /**
     * Set the options.
     *
     * @param {Array} options
     */
    setOptions: function(options) {
        this.options = this.mergeOptions(options);
    },

    /**
     * Merges the given options with the default options.
     *
     * @param {Array} options
     * @returns {Array}
     */
    mergeOptions: function(options) {
        return $.extend(true, {}, this.defaults, this.options, options);
    },
    /**
     * Unbinds the whole plugin.
     */
    destroy: function() {
        this.$container.remove();
        this.$select.show();
        this.$select.data('multiselect', null);
    },

}

$.fn.easyselect = function(option, paramter,extraOptions){
	var data = $(this).data('easyselect');
    var options = typeof option === 'object' && option;

    // 初始化easyselect
    if (!data) {
        data = new Easyselect(this, options);
        $(this).data('easyselect', data);
    }

    // 调用easyselect方法
    if (typeof option === 'string') {
        var result = data[option](paramter,extraOptions);

        if (option === 'destroy') {
            $(this).data('easyselect', false);
        }
        return result;
    }
}

$.fn.easyselect.Constructor = Easyselect;

})(window.jQuery)