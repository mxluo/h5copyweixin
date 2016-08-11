var TodoItem = React.createClass({
    getInitialState: function() {
        return ({
            updatedTitle: this.props.todoItem.title
        });
    },
    shouldCompenentUpdate: function(nextProps, nextState) {
        return (
            nextProps.todoItem !== this.props.todoItem ||
            nextProps.editing !== this.props.editing ||
            nextState.updatedTitle !== this.state.updatedTitle
            );
    },
    componentDidUpdate: function(prevProps) {
        if (!prevProps.editing && this.props.editing) {
            var node = this.refs.editInput;
            node.focus();
            node.setSelectionRange(node.value.length, node.value.length);
        }
    },
    handleDoubleClick: function(e) {
        this.props.onEditTodo(this.props.todoItem.id);
    },
    handleChange: function(e) {
        this.setState({updatedTitle:e.target.value});
    },
    handleKeyDown: function(e) {
        if (e.keyCode==13) {
            this.handleBlur();
        }
    },
    handleBlur: function() {
        var title = this.state.updatedTitle.trim();
        if (title.length>0) {
            this.props.onUpdateTodo(this.props.todoItem.id,title);
        } else {
            this.props.onDestroyTodo(this.props.todoItem.id);
        }
    },
    handleCheck: function(e) {
        this.props.onCompleteTodo(this.props.todoItem.id);
    },
    handleDestroy: function(e) {
        this.props.onDestroyTodo(this.props.todoItem.id);
    },
    render: function() {
        return (
            <li className={classNames({
                    completed: this.props.todoItem.isCompleted?'completed':'',
                    editing: this.props.editing==this.props.todoItem.id?' editing':''
                })}
            >
            <div className="view">
            <input className="toggle" type="checkbox" checked={this.props.todoItem.isCompleted} onChange={this.handleCheck}/>
            <label onDoubleClick={this.handleDoubleClick}>{this.props.todoItem.title}</label>
            <button className="destroy" onClick={this.handleDestroy}></button>
            </div>
            <input className="edit" ref="editInput" value={this.state.updatedTitle} onChange={this.handleChange} onKeyDown={this.handleKeyDown} onBlur={this.handleBlur}/>
            </li>
            );
    }
});

var TodoInput = React.createClass({
    getInitialState: function() {
        return ({
            newTitle: ''
        });
    },
    handleChange: function(e) {
        this.setState({newTitle:e.target.value});
    },
    handleKeyDown: function(e) {
        var title = this.state.newTitle.trim();
        if (e.keyCode==13 && title.length>0) {
            this.props.onAddTodo(title);
            this.setState({newTitle:''});
        }
    },
    render: function() {
        return (
            <input className="new-todo" placeholder="What need to be done?" value={this.state.newTitle} onChange={this.handleChange} onKeyDown={this.handleKeyDown}/>
        );
    }
});

var TodoFoot = React.createClass({
    handleFilter: function(type, e) {
        e.preventDefault();
        this.props.onFilterTodos(type);
    },
    handleClear: function() {
        this.props.onClearCompleted();
    },
    render: function() {
        return (
            <footer className="footer">
            <span className="todo-count">
            <strong>{this.props.todoList.length}</strong>
            <span> </span>
            <span>item</span>
            <span> left</span>
            </span>
            <ul className="filters">
            <li><a href="#" className={this.props.shownType=='all'?'selected':''} onClick={this.handleFilter.bind(this,'all')}>All</a></li>
            <span> </span>
            <li><a href="#" className={this.props.shownType=='active'?'selected':''} onClick={this.handleFilter.bind(this,'active')}>Active</a></li>
            <span> </span>
            <li><a href="#" className={this.props.shownType=='completed'?'selected':''} onClick={this.handleFilter.bind(this,'completed')}>Completed</a></li>
            </ul>
            <button className="clear-completed" onClick={this.handleClear}>Clear completed</button>
            </footer>
        );
    }
});

var TodoBox = React.createClass({
    getInitialState: function() {
        return ({
            todoList: this.getTodos() || [],
            shownType: 'all',
            editing: null
        });
    },
    storeTodos: function(newList) {
        localStorage.setItem('todolist',JSON.stringify(newList));
    },
    getTodos: function() {
        return JSON.parse(localStorage.getItem('todolist'));
    },
    addTodo: function(newTitle) {
        var newItem = {id:Date.now(), title:newTitle, isCompleted: false};
        var newList = this.state.todoList.concat(newItem);
        this.setState({todoList:newList});
        this.storeTodos(newList);
    },
    editTodo: function(itemId) {
        this.setState({editing:itemId});
    },
    updateTodo: function(itemId, updatedTitle) {
        var todoList = this.state.todoList;
        todoList.map(function(todoItem, k) {
            if (todoItem.id == itemId) {
                todoList[k].title = updatedTitle;
            }
        }.bind(this));
        this.setState({todoList:todoList,editing:''});
        this.storeTodos(todoList);
    },
    completeTodo: function(itemId) {
        var todoList = this.state.todoList;
        todoList.map(function(todoItem, k) {
            if (todoItem.id == itemId) {
                todoList[k].isCompleted = !todoItem.isCompleted;
            }
        }.bind(this));
        this.setState({todoList:todoList});
        this.storeTodos(todoList);
    },
    destroyTodo: function(itemId) {
        var todoList = this.state.todoList;
        todoList.map(function(todoItem, k) {
            if (todoItem.id == itemId) {
                todoList.splice(k, 1);
            }
        }.bind(this));
        this.setState({todoList:todoList});
        this.storeTodos(todoList);
    },
    completeAll: function(e) {
        var todoList = this.state.todoList;
        todoList.map(function(todoItem, k) {
            todoList[k].isCompleted = e.target.checked;
        }.bind(this));
        this.setState({todoList:todoList});
        this.storeTodos(todoList);
    },
    clearCompleted: function() {
        var todoList = [];
        this.state.todoList.map(function(todoItem, k) {
            if (!todoItem.isCompleted) {
                todoList.push(todoItem);
            }
        }.bind(this));
        this.setState({todoList:todoList});
        this.storeTodos(todoList);
    },
    filterTodes: function(type) {
        this.setState({shownType: type});
    },
    render: function() {
        var main = '';
        var shownList = this.state.todoList.filter(function (todo) {
                switch (this.state.shownType) {
                    case 'active':
                        return !todo.isCompleted;
                    case 'completed':
                        return todo.isCompleted;
                    default:
                        return true;
                }
            }, this);
        if (shownList.length > 0) {
            var items = shownList.map(function(todoItem) {
                return (<TodoItem todoItem={todoItem} editing={this.state.editing} onEditTodo={this.editTodo} onUpdateTodo={this.updateTodo} onCompleteTodo={this.completeTodo} onDestroyTodo={this.destroyTodo} key={todoItem.id}/>);
            }.bind(this));
            main = (
                <section className="main">
                <input className="toggle-all" type="checkbox" onChange={this.completeAll}/>
                <ul className="todo-list">
                {items}
                </ul>
                </section>
            );
        }
        return (
            <div>
                <header className="header">
                <h1>todolist</h1>
                <TodoInput onAddTodo={this.addTodo}/>
                </header>
                {main}
                <TodoFoot todoList={shownList} shownType={this.state.shownType} onClearCompleted={this.clearCompleted} onFilterTodos={this.filterTodes}/>
            </div>
        );
    }
});

ReactDOM.render(
    <TodoBox />,
    document.getElementById('todobox')
);