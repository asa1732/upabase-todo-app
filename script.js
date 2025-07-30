// Supabaseクライアントを初期化します。
const supabaseUrl = 'https://twozsakzkqrfidzyoyyg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3b3pzYWt6a3FyZmlkenlveXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MjQ5NTgsImV4cCI6MjA2OTQwMDk1OH0.UR5cLucV5yKAmflUlHmWX1BS4ApJj_dAkmtNanhGaMQ';

const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

// Todosをフェッチして表示する関数
async function fetchTodos() {
    const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching todos:', error.message);
        return;
    }

    todoList.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = todo.is_complete ? 'completed' : '';
        li.innerHTML = `
            <span>${todo.task}</span>
            <div>
                <input type="checkbox" ${todo.is_complete ? 'checked' : ''} data-id="${todo.id}">
                <button data-id="${todo.id}">削除</button>
            </div>
        `;
        todoList.appendChild(li);

        // チェックボックスのイベントリスナー
        li.querySelector('input[type="checkbox"]').addEventListener('change', async (e) => {
            const id = e.target.dataset.id;
            const is_complete = e.target.checked;
            const { error: updateError } = await supabase
                .from('todos')
                .update({ is_complete })
                .eq('id', id);

            if (updateError) {
                console.error('Error updating todo:', updateError.message);
            } else {
                fetchTodos(); // 更新後にリストを再フェッチ
            }
        });

        // 削除ボタンのイベントリスナー
        li.querySelector('button').addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            const { error: deleteError } = await supabase
                .from('todos')
                .delete()
                .eq('id', id);

            if (deleteError) {
                console.error('Error deleting todo:', deleteError.message);
            } else {
                fetchTodos(); // 削除後にリストを再フェッチ
                }
            });
        });
    }

// 新しいTodoを追加する関数
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const task = todoInput.value.trim();
    if (task === '') return;

    const { error } = await supabase
        .from('todos')
        .insert([{ task, is_complete: false }]);

    if (error) {
        console.error('Error adding todo:', error.message);
    } else {
        todoInput.value = '';
        fetchTodos(); // 追加後にリストを再フェッチ
    }
});

// ページロード時にTodosをフェッチ
fetchTodos();
