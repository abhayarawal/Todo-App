;(function($) {
	window.Todo = Backbone.Model.extend({
		toggle: function() {
			this.save({checked: !this.get('checked')});
		},

		clear: function() {
			$(this.view.el).animate({ marginLeft: -600 }).slideUp('normal').fadeOut(50, function() {
				$(this).remove();
			});
			this.destroy();
		}
	});

	window.TodoCollection = Backbone.Collection.extend({
		model: Todo,

		localStorage: new Store('TodoCollection'),

		checked: function() {
			return this.filter(function(todo) { return todo.get('checked'); });
		},

		nextOrder: function() {
			if (!this.length) return 1;
			return this.last().get('order') + 1;
		},

		comparator: function(todo) {
			return todo.get('order');
		}
	});

	window.Todos = new TodoCollection;

	window.TodoView = Backbone.View.extend({
		tagName: 'li',

		template: _.template($('#todo-template').html()),

		events: {
			'click :checkbox'    : 'toggleDone',
			'dblclick .todo'     : 'edit',
			'click .cross'       : 'clear',
			'keypress input:text': 'updateOnEnter'
		},

		initialize: function() {
			_.bindAll(this, 'render');
			this.model.bind('change', this.render);
			this.model.view = this;
		},

		render: function() {
			var c_h = '', c_m = '', c_l = '';

			switch (this.model.get('priority')) {
				case 'high'  : c_h = 'checked'; break;
				case 'medium': c_m = 'checked'; break;
				default      : c_l = 'checked'; break;
			}

			var obj = {
				'id'      : this.model.get('id'),
				'priority': this.model.get('priority'),
				'c_h'     : c_h,
				'c_m'     : c_m,
				'c_l'     : c_l,
				'todo'    : this.model.get('todo'),
				'checked' : this.model.get('checked')
			};

			$(this.el).html(this.template(obj));
			return this;
		},

		toggleDone: function() {
			this.model.toggle();
		},

		edit: function() {
			if (_.isObject(editingView)) {
				editingView.update();
			}
			editingView = this;
			
			var divTodo = this.$('div.todo');
			
			$('#sortable li div.todo').children().show();
			$('#sortable li div.todo').children('div.wrap').hide();
			$( divTodo ).children().hide();
			$( divTodo ).children('div.wrap').show();
		},

		clear: function() {
			this.model.clear();
		},

		updateOnEnter: function(e) {
			if ((e.keyCode || e.which) == 13) {
				this.update();
			}
		},

		update: function() {
			this.model.save({
				priority: this.$('input:radio[name='+this.model.get('id')+']:checked').val(),
				todo: this.$('input:text').val()
			});
		}
	});

	window.editingView = "";

	window.AppView = Backbone.View.extend({
		el : $('.wrapper'),

		statTemplate: _.template('<span class="todo-count"><% if (remaining>0) { %><span class=num><%= remaining %></span> tasks left.<%} else {%>Nothing to do ;)<% }%></span><span class="filter right help">?</span><% if (complete>0) {%><span class="filter right clearComplete">Clear <%=complete%> completed</span><%}%><div class="clear"></div>'),

		initialize: function() {
			$( "#sortable" ).sortable({ opacity: 0.8 });

			_.bindAll(this, 'addOne', 'render');
			this.input = $('#new-todo');

			Todos.bind('add', this.addOne);
			Todos.bind('all', this.render);

			Todos.fetch();
			Todos.each(this.addOne);
		},

		events: {
			'keypress #new-todo'   : 'createNewTodo',
			'click .clearComplete' : 'clearChecked'
		},

		render: function() {
			var complete = Todos.checked().length;
			$('.stat').html(this.statTemplate({
				complete: complete,
				remaining: Todos.length - complete,
				total: Todos.length
			}));
		},

		addOne: function(todo) {
			var view = new TodoView({model: todo});
			$('#sortable').append(view.render().el);
		},

		createNewTodo: function(e) {
			if ((e.keyCode || e.which) == 13) {
				if (!this.input.val()) return;

				var todoVal = this.input.val(),
					priorityVal = $('input:radio[name=priority]:checked').val();

				Todos.create({
					todo    : todoVal,
					priority: priorityVal,
					order   : Todos.nextOrder(),
					checked : false
				});

				$('#new-todo').val('');
			}
		},

		clearChecked: function() {
			_.each(Todos.checked(), function(todo) { 
				todo.clear(); 
			});
			return false;
		}
	});

	window.appView = new AppView();
})(jQuery);