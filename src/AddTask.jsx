import React, { useState } from 'react';

const ToDoForm = ({ addTask }) => {
  const [userInput, setUserInput] = useState("");

  const handleChange = e => setUserInput(e.currentTarget.value);
  const handleSubmit = e => {
    e.preventDefault();
    addTask(userInput);
    setUserInput('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={userInput}
        onChange={handleChange}
        placeholder="Введите задачу..."
      />
      <button>Сохранить</button>
    </form>
  );
};

export default ToDoForm;
