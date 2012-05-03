(function($) {
	window.Todo = Backbone.Model.extend({});

	window.TodoView = Backbone.View.extend({
		tagName: 'li',

		initialize: function() {
			this.template = _.template($('#todo-template').html());
		},

		render: function() {
			var renderedContent = this.template(this.model.toJSON());
			$(this.el).html(renderedContent);
			return this;
		}
	});
})(jQuery);