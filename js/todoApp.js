(function($) {
	window.Todo = Backbone.Model.extend({
		clear: function() {
			this.destroy();
			$(this.view.el).remove();
		}
	});

	window.TodoView = Backbone.View.extend({
		tagName: 'li',

		events: {
			'click :checkbox' : 'toogleDone',
			'dblclick .todo' : 'edit',
			'click .cross' : 'clear',
			'keypress input:text' : 'updateOnEnter'
		},

		initialize: function() {
			_.bindAll(this, 'render');
			this.model.bind('change', this.render);
			this.template = _.template($('#todo-template').html());
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			return this;
		},

		toogleDone: function() {

		},

		edit: function() {
		},

		clear: function() {

		},

		updateOnEnter: function(e) {
			if (e.charCode == 13) {
				this.model.set({
					priority: this.$('input:radio[name='+this.model.get('id')+']:checked').val(),
					todo: this.$('input:text').val()
				});
			}
		}
	});
})(jQuery);