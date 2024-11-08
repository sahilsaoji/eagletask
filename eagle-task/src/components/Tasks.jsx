import React, { useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { createTaskList } from '../api/api';
//Need to pull the canvas api

const Tasks = () => {
    const [messages, setMessages] = useState([]);
    const [taskList, setTaskList] = useState([]);
    const [input, setInput] = useState("");
    const [isTaskView, setIsTaskView] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const sendMessage = async (message = input) => {
        if (message.trim() === "") return;

        const newMessage = { sender: "user", text: message };
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        try {
            // Use createTaskList to send the user's message to the backend
            const response = await createTaskList(message);

            const botMessage = {
                sender: "bot",
                text: response.data.response,
            };

            setMessages((prevMessages) => [...prevMessages, botMessage]);

            // Check if the user is requesting the task list
            if (message.toLowerCase().includes('generate task list') || message.toLowerCase().includes('show me the task list')) {
                // Extract tasks from the bot's response
                const tasks = response.data.response
                    .split("\n")
                    .map(task => task.trim())
                    .filter(task => task !== "");
                setTaskList(tasks);
            }

        } catch (error) {
            console.error("Error creating task list:", error);
        }

        setInput("");
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F5F5F5] text-gray-900">
            <div className="flex-1 p-6 flex gap-6">
                {/* Chat Section */}
                <div className="w-1/2 bg-white shadow-md rounded-lg p-6 flex flex-col max-h-[80vh]">
                    <h1 className="text-3xl font-semibold text-center mb-6">Chat With AI</h1>
                    <div className="flex-1 bg-gray-100 rounded-lg p-4 mb-4 overflow-y-auto border border-gray-300">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    msg.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                            >
                                <div
                                    className={`p-3 mb-2 rounded-lg max-w-xs ${
                                        msg.sender === "user"
                                            ? "bg-[#7B313C] text-white text-right"
                                            : "bg-gray-300 text-gray-900 text-left"
                                    }`}
                                    style={{ wordWrap: "break-word" }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Type your message here..."
                            className="flex-1 p-2 rounded-md border border-gray-400 bg-black text-white" // Set background to white and text to black
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="bg-[#7B313C] text-white px-4 py-2 rounded-md"
                            onClick={() => sendMessage(input)}
                        >
                            Send
                        </button>
                        <button
                            className="bg-[#7B313C] text-white px-4 py-2 rounded-md"
                            onClick={() => sendMessage("generate task list")}
                        >
                            Send Task List
                        </button>
                    </div>
                </div>

                {/* Task List / Calendar Section with Toggle */}
                <div className="w-1/2 bg-white shadow-md rounded-lg p-6 max-h-[80vh]">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-semibold">{isTaskView ? "Task List" : "Calendar"}</h1>
                        <button
                            className="bg-[#7B313C] text-white px-4 py-2 rounded-md"
                            onClick={() => setIsTaskView(!isTaskView)}
                        >
                            {isTaskView ? "Switch to Calendar View" : "Switch to Task List View"}
                        </button>
                    </div>

                    {isTaskView ? (
                        // Task List View
                        <div>
                            {taskList.length > 0 ? (
                                <ul className="space-y-4">
                                    {taskList.map((task, index) => (
                                        <li key={index} className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                                            <span className="font-medium text-gray-800">{task}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center">
                                    Your task list will appear here after you request it.
                                </p>
                            )}
                        </div>
                    ) : (
                        // Calendar View with Task Integration
                        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300 flex flex-col items-center">
                            <Calendar
                                onChange={setSelectedDate}
                                value={selectedDate}
                            />
                            <p className="text-gray-500 mt-4">
                                Selected Date: {selectedDate.toDateString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tasks;
